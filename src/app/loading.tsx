"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function Loading() {
  const [animationData, setAnimationData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    // Load the Lottie JSON from the public folder
    fetch("/loading.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted) setAnimationData(data);
      })
      .catch(() => {
        // Ignore if file isn't there yet
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-dhack-base">
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{ width: 240, height: 240 }}
        />
      ) : (
        <div className="w-16 h-16 border-4 border-dhack-teal border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
}
