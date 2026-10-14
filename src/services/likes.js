import { getAuth, signInAnonymously, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { app, db } from "../firebase";
import { locationToStar } from "./starPositions";

export const COOLDOWN_MS = 2 * 60 * 1000;
export const counterRef = doc(db, "likes", "portfolio");
export const visitorRef = (uid) => doc(counterRef, "visitors", uid);
let visitorPromise;

// Persist the visitor's identity across reloads and tabs on this origin.
export function getVisitorId() {
  if (!visitorPromise) {
    visitorPromise = (async () => {
      const auth = getAuth(app);
      await setPersistence(auth, browserLocalPersistence);
      await auth.authStateReady();
      return (auth.currentUser || (await signInAnonymously(auth)).user).uid;
    })().catch((error) => {
      visitorPromise = undefined;
      throw error;
    });
  }
  return visitorPromise;
}

export function nextLikeAt(data) {
  return data?.lastLikedAt ? data.lastLikedAt.toMillis() + COOLDOWN_MS : 0;
}

// Save approximate location, never raw IP or GPS. Failure must not block a like.
export async function getLikeLocation() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch("https://ipwho.is/", { signal: controller.signal });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.success !== true) return null;
    const text = (value) => typeof value === "string" ? value.slice(0, 100) : "";
    const coordinate = (value, maximum) => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= maximum ? Math.round(value) : null;
    return {
      city: text(data.city), region: text(data.region), country: text(data.country), countryCode: text(data.country_code),
      // Round to whole degrees; no precise coordinates or raw IP are stored.
      latitude: coordinate(data.latitude, 90), longitude: coordinate(data.longitude, 180),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function submitLike(uid, location) {
  const visitor = visitorRef(uid);
  const event = doc(collection(counterRef, "events"));
  return runTransaction(db, async (transaction) => {
    const counter = await transaction.get(counterRef);
    const previous = await transaction.get(visitor);
    if (!counter.exists() || !Number.isSafeInteger(counter.data().count)) {
      throw new Error("The like counter is unavailable.");
    }
    const availableAt = nextLikeAt(previous.data());
    if (Date.now() < availableAt) {
      const error = new Error("Please wait before liking again.");
      error.code = "likes/cooldown";
      error.availableAt = availableAt;
      throw error;
    }
    const timestamp = serverTimestamp();
    // Deployed security rules enforce cooldown with server time.
    transaction.update(counterRef, {
      count: counter.data().count + 1,
      mappedLikeCount: (counter.data().mappedLikeCount || 0) + 1,
      lastLikeId: event.id, lastLikedAt: timestamp,
    });
    transaction.set(visitor, { lastLikedAt: timestamp, lastLikeId: event.id });
    transaction.set(event, { visitorId: uid, createdAt: timestamp, location });
    transaction.set(doc(counterRef, "stars", event.id), { ...locationToStar(location), createdAt: timestamp });
    const savedAt = Date.now();
    return { count: counter.data().count + 1, star: { id: event.id, ...locationToStar(location), createdAt: { toMillis: () => savedAt } } };
  });
}

export async function notifyLike(location) {
  const form = new FormData();
  form.set("_subject", "New Like!");
  form.set("_captcha", "false");
  form.set("user-location", location ? [location.city, location.region, location.country].filter(Boolean).join(", ") : "Unknown");
  const response = await fetch("https://formsubmit.co/d01c7b2fa41ce2c7c1372175f3d4ab69", { method: "POST", body: form });
  if (!response.ok) throw new Error("Like notification failed.");
}
