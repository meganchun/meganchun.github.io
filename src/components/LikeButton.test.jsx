import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { onSnapshot } from "firebase/firestore";
import LikeButton from "./LikeButton";
import { getVisitorId, getLikeLocation, submitLike, notifyLike } from "../services/likes";

jest.mock("firebase/firestore", () => ({
  onSnapshot: jest.fn((ref, receive) => {
    receive({ exists: () => true, data: () => ref === "counter" ? { count: 7787 } : {} });
    return () => {};
  }),
}));
jest.mock("../services/likes", () => ({
  COOLDOWN_MS: 120000,
  counterRef: "counter",
  visitorRef: () => "visitor",
  getVisitorId: jest.fn().mockResolvedValue("visitor-id"),
  nextLikeAt: () => 0,
  getLikeLocation: jest.fn().mockResolvedValue({ country: "Canada" }),
  submitLike: jest.fn().mockResolvedValue(7788),
  notifyLike: jest.fn().mockResolvedValue(undefined),
}));

let container;
let root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  jest.clearAllMocks();
  onSnapshot.mockImplementation((ref, receive) => {
    receive({ exists: () => true, data: () => ref === "counter" ? { count: 7787 } : {} });
    return () => {};
  });
  getVisitorId.mockResolvedValue("visitor-id");
  getLikeLocation.mockResolvedValue({ country: "Canada" });
  submitLike.mockResolvedValue(7788);
  notifyLike.mockResolvedValue(undefined);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
const render = async (props = {}) => { await act(async () => root.render(<LikeButton {...props} />)); };
const click = async (element) => { await act(async () => element.click()); };

test("shows a brief location note and saves with one click", async () => {
  await render();
  expect(container.querySelector('#star-location-message').textContent).toBe("Your approximate location places your star in the sky.");
  expect(getLikeLocation).not.toHaveBeenCalled();
  expect(submitLike).not.toHaveBeenCalled();
  await click(container.querySelector(".star-button"));
  expect(submitLike).toHaveBeenCalledWith("visitor-id", { country: "Canada" });
  expect(container.querySelector('[role="dialog"]')).toBeNull();
  expect(container.querySelector(".star-button").disabled).toBe(true);
});

test("launches the saved star only after a successful commit", async () => {
  const star = { id: "saved-star", x: 0.3, y: 0.4, located: true };
  submitLike.mockResolvedValueOnce({ count: 7788, star });
  const onStarSaved = jest.fn();
  await render({ onStarSaved });
  await click(container.querySelector(".star-button"));
  expect(onStarSaved).toHaveBeenCalledWith(star, { x: 0, y: 0 });
});

test("reenables the button after two minutes and blocks a second save during cooldown", async () => {
  jest.useFakeTimers();
  try {
    await render();
    await click(container.querySelector('.star-button'));
    expect(container.querySelector('[role="status"]').textContent).toContain('2:00');
    await click(container.querySelector('.star-button'));
    expect(submitLike).toHaveBeenCalledTimes(1);
    act(() => jest.advanceTimersByTime(119000));
    expect(container.querySelector('.star-button').disabled).toBe(true);
    act(() => jest.advanceTimersByTime(1000));
    expect(container.querySelector('.star-button').disabled).toBe(false);
  } finally {
    jest.useRealTimers();
  }
});

test("failed saves leave the visitor in place without launching a star", async () => {
  submitLike.mockRejectedValueOnce(new Error("unavailable"));
  const onStarSaved = jest.fn();
  await render({ onStarSaved });
  await click(container.querySelector(".star-button"));
  expect(onStarSaved).not.toHaveBeenCalled();
  expect(container.querySelector('[role="status"]').textContent).toContain("Couldn't save your star");
});
