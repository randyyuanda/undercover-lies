// src/hooks/useBackgroundMusic.ts
import { useRef } from "react";

const useBackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/assets/music/bg-sound.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    }

    audioRef.current
      .play()
      .then(() => console.log("🎵 Music playing"))
      .catch((err) => console.warn("❌ Failed to play:", err));
  };

  return { playMusic };
};

export default useBackgroundMusic;
