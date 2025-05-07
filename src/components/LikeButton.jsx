import React, { useEffect, useState } from "react";
import { db, doc, getDoc, updateDoc, increment } from "../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

export default function LikeButton() {
  const docRef = doc(db, "likes", "portfolio");
  const [likes, setLikes] = useState(null);
  const [userLocation, setUserLocation] = useState("");

  useEffect(() => {
    fetch("https://ipwho.is/")
      .then((res) => res.json())
      .then((data) => setUserLocation(`${data.city}, ${data.region_code}`))
      .catch((err) => console.error("Location fetch error:", err));
  }, []);

  useEffect(() => {
    async function fetchLikes() {
      const docSnap = await getDoc(docRef);
      setLikes(docSnap.data().count);
    }
    fetchLikes();
  }, [docRef]);

  const handleLike = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
      await updateDoc(docRef, { count: increment(1) });
      setLikes((prev) => prev + 1);

      await fetch("https://formsubmit.co/d01c7b2fa41ce2c7c1372175f3d4ab69", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[100]">
      <div className="bg-[#fff]/50 backdrop-blur-lg px-2 py-1 rounded-full">
        <form data-formsubmit="true" onSubmit={handleLike}>
          <input type="hidden" name="_subject" value="New Like!" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="text" name="user-location" value={userLocation} hidden />

          <button type="submit" className="flex flex-row gap-2 items-center">
            <div className="w-7 h-7 bg-primary-light rounded-full relative">
              <FontAwesomeIcon
                icon={faHeart}
                className="text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <p className="text-primary">{likes}</p>
          </button>
        </form>
      </div>
    </div>
  );
}
