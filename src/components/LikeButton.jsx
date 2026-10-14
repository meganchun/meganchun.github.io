import React, { useEffect, useRef, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { COOLDOWN_MS, counterRef, visitorRef, getVisitorId, nextLikeAt, getLikeLocation, submitLike, notifyLike } from "../services/likes";

export default function LikeButton({ onStarSaved }) {
  const [likes, setLikes] = useState(null);
  const [uid, setUid] = useState(null);
  const [ready, setReady] = useState(false);
  const [availableAt, setAvailableAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const buttonRef = useRef(null);
  const inFlight = useRef(false);

  const launchStar = (star) => {
    const origin = buttonRef.current?.querySelector('.star-button-icon')?.getBoundingClientRect();
    if (star && origin) onStarSaved?.(star, {
      x: origin.left + origin.width / 2, y: origin.top + origin.height / 2,
    });
  };

  useEffect(() => {
    let active = true;
    let stopVisitor = () => {};
    setReady(false);
    setError("");
    const failed = () => {
      if (active) {
        setReady(false);
        setError("Likes are unavailable. Please try again.");
      }
    };
    const stopCounter = onSnapshot(counterRef, (snapshot) => {
      if (!active) return;
      if (!snapshot.exists() || !Number.isSafeInteger(snapshot.data().count)) {
        failed();
        return;
      }
      setLikes(snapshot.data().count);
    }, failed);
    getVisitorId().then((id) => {
      if (!active) return;
      setUid(id);
      stopVisitor = onSnapshot(visitorRef(id), (snapshot) => {
        if (!active) return;
        setAvailableAt(nextLikeAt(snapshot.data()));
        setNow(Date.now());
        setReady(true);
      }, failed);
    }).catch(failed);
    return () => { active = false; stopCounter(); stopVisitor(); };
  }, [retry]);

  const coolingDown = now < availableAt;
  useEffect(() => {
    if (!coolingDown) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [coolingDown]);

  const remaining = Math.max(0, Math.ceil((availableAt - now) / 1000));
  const cooldownText = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  const handleLike = async () => {
    if (inFlight.current || !ready || likes === null || remaining > 0) return;
    buttonRef.current?.focus();
    inFlight.current = true;
    setSubmitting(true);
    setError("");
    try {
      const location = await getLikeLocation();
      const result = await submitLike(uid, location);
      launchStar(result?.star);
      // Live snapshots supply the authoritative count and server timestamp.
      setAvailableAt((previous) => Math.max(previous, Date.now() + COOLDOWN_MS));
      setNow(Date.now());
      notifyLike(location).catch((notificationError) => console.warn(notificationError));
    } catch (likeError) {
      if (likeError.code === "likes/cooldown") {
        setAvailableAt(likeError.availableAt);
        setNow(Date.now());
      } else {
        setError("Couldn't save your like. Please try again.");
      }
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="star-button-wrapper">
      <button type="button" ref={buttonRef}
        onClick={handleLike}
        disabled={submitting || !ready || likes === null || remaining > 0}
        aria-label={remaining > 0 ? `Star available in ${cooldownText}` : "Leave a star for this portfolio"}
        aria-describedby="star-location-message like-status"
        className="star-button">
        <span className="star-button-icon" aria-hidden="true">✦</span>
        <span>{submitting ? "Saving…" : remaining > 0 ? "Star left" : "Leave a star"}</span>
        {likes !== null && <span className="star-count">{likes.toLocaleString()}</span>}
      </button>
      <p id="star-location-message" className="star-location-note">Your approximate location places your star in the sky.</p>
      <p id="like-status" className="star-status" role="status">
        {error ? error.replace(/Likes/g, "Stars").replace(/like/g, "star") : remaining > 0 ? `Thank you! Another star in ${cooldownText}.` : ""}
      </p>
      {!ready && error && <button type="button" className="star-retry" onClick={() => setRetry((value) => value + 1)}>Retry</button>}
    </div>
  );
}
