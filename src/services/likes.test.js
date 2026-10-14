import { COOLDOWN_MS, getLikeLocation, getVisitorId, nextLikeAt, submitLike } from './likes';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

jest.mock('../firebase', () => ({ app: {}, db: {} }));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(), signInAnonymously: jest.fn(),
  setPersistence: jest.fn().mockResolvedValue(), browserLocalPersistence: 'local',
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((...args) => ({ path: args.slice(1).join('/'), id: 'event-123' })),
  collection: jest.fn(() => ({ path: 'likes/portfolio/events' })),
  runTransaction: jest.fn(), serverTimestamp: jest.fn(() => 'SERVER_TIME'),
}));

const transaction = { get: jest.fn(), update: jest.fn(), set: jest.fn() };
const snapshot = (data) => ({ exists: () => data !== undefined, data: () => data });
const originalFetch = global.fetch;

beforeEach(() => {
  jest.clearAllMocks();
  doc.mockImplementation((...args) => ({ path: args.slice(1).join('/'), id: 'event-123' }));
  collection.mockImplementation(() => ({ path: 'likes/portfolio/events' }));
  serverTimestamp.mockReturnValue('SERVER_TIME');
  jest.spyOn(Date, 'now').mockReturnValue(1000000);
  runTransaction.mockImplementation((db, callback) => callback(transaction));
  global.fetch = jest.fn();
});
afterEach(() => { jest.restoreAllMocks(); global.fetch = originalFetch; });

it('keeps the existing total and saves count, cooldown, and location in one transaction', async () => {
  const location = { city: 'Waterloo', region: 'Ontario', country: 'Canada', countryCode: 'CA' };
  transaction.get.mockResolvedValueOnce(snapshot({ count: 7123 })).mockResolvedValueOnce(snapshot());
  await expect(submitLike('browser-a', location)).resolves.toMatchObject({ count: 7124, star: { id: 'event-123', x: 0.5, y: 0.9, located: false } });
  expect(transaction.update).toHaveBeenCalledWith(expect.anything(), {
    count: 7124, mappedLikeCount: 1, lastLikeId: 'event-123', lastLikedAt: 'SERVER_TIME',
  });
  expect(transaction.set).toHaveBeenCalledWith(expect.anything(), {
    visitorId: 'browser-a', createdAt: 'SERVER_TIME', location,
  });
  expect(transaction.set).toHaveBeenCalledTimes(3);
  expect(transaction.set).toHaveBeenCalledWith(expect.anything(), { x: 0.5, y: 0.9, located: false, createdAt: 'SERVER_TIME' });
  expect(serverTimestamp).toHaveBeenCalledTimes(1);
});

it('rejects a recent like before performing any writes', async () => {
  transaction.get.mockResolvedValueOnce(snapshot({ count: 7000 }))
    .mockResolvedValueOnce(snapshot({ lastLikedAt: { toMillis: () => 999999 } }));
  await expect(submitLike('browser-a', null)).rejects.toMatchObject({ code: 'likes/cooldown', availableAt: 999999 + COOLDOWN_MS });
  expect(transaction.update).not.toHaveBeenCalled();
  expect(transaction.set).not.toHaveBeenCalled();
});

it('uses a two-minute cooldown in the client and security rules', () => {
  expect(COOLDOWN_MS).toBe(120000);
  const rules = require('fs').readFileSync('firestore.rules', 'utf8');
  expect(rules).toContain("duration.value(2, 'm')");
});

it('rejects a like one millisecond before the two-minute boundary', async () => {
  transaction.get.mockResolvedValueOnce(snapshot({ count: 7000 }))
    .mockResolvedValueOnce(snapshot({ lastLikedAt: { toMillis: () => 1000000 - 120000 + 1 } }));
  await expect(submitLike('browser-a', null)).rejects.toMatchObject({ code: 'likes/cooldown', availableAt: 1000001 });
  expect(transaction.update).not.toHaveBeenCalled();
  expect(transaction.set).not.toHaveBeenCalled();
});

it('allows a like exactly at the two-minute boundary', async () => {
  transaction.get.mockResolvedValueOnce(snapshot({ count: 7000 }))
    .mockResolvedValueOnce(snapshot({ lastLikedAt: { toMillis: () => 1000000 - COOLDOWN_MS } }));
  await expect(submitLike('browser-a', null)).resolves.toMatchObject({ count: 7001 });
});

it('preserves the historical baseline as mapped likes grow', async () => {
  transaction.get.mockResolvedValueOnce(snapshot({ count: 7800, mappedLikeCount: 13 })).mockResolvedValueOnce(snapshot());
  await submitLike('browser-b', { latitude: 43, longitude: -80 });
  const update = transaction.update.mock.calls[0][1];
  expect(update.count - update.mappedLikeCount).toBe(7787);
  expect(transaction.set).toHaveBeenCalledWith(expect.anything(), {
    x: 100 / 360, y: 47 / 180, located: true, createdAt: 'SERVER_TIME',
  });
});

it('does not recreate or reset a missing counter', async () => {
  transaction.get.mockResolvedValueOnce(snapshot()).mockResolvedValueOnce(snapshot());
  await expect(submitLike('browser-a', null)).rejects.toThrow('counter is unavailable');
  expect(transaction.update).not.toHaveBeenCalled();
  expect(transaction.set).not.toHaveBeenCalled();
});

it('propagates failed commits so the caller does not treat them as accepted likes', async () => {
  runTransaction.mockRejectedValueOnce(new Error('permission-denied'));
  await expect(submitLike('browser-a', null)).rejects.toThrow('permission-denied');
});

it('records only coarse location, excluding IP and precise coordinates', async () => {
  fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true, city: 'Waterloo', region: 'Ontario', country: 'Canada', country_code: 'CA', ip: 'private', latitude: 43.46, longitude: -80.52 }) });
  await expect(getLikeLocation()).resolves.toEqual({ city: 'Waterloo', region: 'Ontario', country: 'Canada', countryCode: 'CA', latitude: 43, longitude: -81 });
});

it('accepts unknown location when the provider rejects or fails', async () => {
  fetch.mockRejectedValueOnce(new Error('blocked'));
  await expect(getLikeLocation()).resolves.toBeNull();
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: false }) });
  await expect(getLikeLocation()).resolves.toBeNull();
});

it('reuses a restored anonymous identity without signing in again', async () => {
  getAuth.mockReturnValue({ authStateReady: jest.fn().mockResolvedValue(), currentUser: { uid: 'restored-browser' } });
  const ids = await Promise.all([getVisitorId(), getVisitorId()]);
  expect(ids).toEqual(['restored-browser', 'restored-browser']);
  expect(signInAnonymously).not.toHaveBeenCalled();
});

it('has no cooldown for a first-time visitor', () => {
  expect(nextLikeAt(undefined)).toBe(0);
});
