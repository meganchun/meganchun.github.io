import React, { useEffect, useRef, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { COOLDOWN_MS, counterRef, visitorRef, getVisitorId, nextLikeAt, getLikeLocation, submitLike, notifyLike } from "../services/likes";

export default function LikeButton() {
  const [likes, setLikes] = useState(null);
  const [uid, setUid] = useState(null);
  const [ready, setReady] = useState(false);
  const [availableAt, setAvailableAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const inFlight = useRef(false);

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
    inFlight.current = true;
    setSubmitting(true);
    setError("");
    try {
      const location = await getLikeLocation();
      await submitLike(uid, location);
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
    <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[100]">
      <div className="bg-[#fff]/90 backdrop-blur-lg px-3 py-2 rounded-2xl text-primary text-center">
        <button type="button" onClick={handleLike}
          disabled={!ready || likes === null || submitting || remaining > 0}
          aria-label={remaining > 0 ? `Like available in ${cooldownText}` : "Like this portfolio"}
          aria-describedby="like-status"
          className="flex flex-row gap-2 items-center mx-auto disabled:opacity-60 disabled:cursor-not-allowed">
          <span className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faHeart} aria-hidden="true" />
          </span>
          <span>{likes === null ? "…" : likes.toLocaleString()}</span>
          {submitting && <span className="text-xs">Saving…</span>}
          {remaining > 0 && !submitting && <span className="text-xs tabular-nums">{cooldownText}</span>}
        </button>
        <p id="like-status" className="text-xs mt-1" role="status">
          {error || (remaining > 0 ? "Thanks! You can like again in five minutes." : "One like per browser every five minutes.")}
        </p>
        <p className="text-xs mt-1 opacity-70">Approximate location is saved with your like.</p>
        {!ready && error && <button type="button" className="text-xs underline mt-1" onClick={() => setRetry((value) => value + 1)}>Retry</button>}
      </div>
    </div>
  );
}
