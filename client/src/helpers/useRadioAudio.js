// plays the song that's on right now, when user has clicked the radio; at the same time as other users.
import { useEffect, useRef } from "react";
import { socket } from "./socket.js";

export function useRadioAudio(nowPlaying, offsetRef, tunedIn) {
  // one audio player for the whole app, reused for every song.
  const audioRef = useRef(null);
  if (!audioRef.current) audioRef.current = new Audio();

  const url = nowPlaying?.previewUrl; // nowPlaying is null when nothing is playing
  const startedAt = nowPlaying?.startedAt; // server time when the song began
  const songId = nowPlaying?.id;

  // runs when the song changes or you tune in/out.
  useEffect(() => {
    const audio = audioRef.current;

    // not tuned in or nothing to play; no audio
    if (!tunedIn || !url) {
      audio.pause();
      return;
    }

    // once the song has loaded: jump to where the room is, then play.
    const onLoaded = () => {
      const secondsIn = (Date.now() + offsetRef.current - startedAt) / 1000;
      if (secondsIn > 0 && secondsIn < audio.duration) audio.currentTime = secondsIn;
      audio.play().catch(() => {}); // if the browser still blocks it, click the radio again
    };

    // when the song finishes, tells the server; starts the next song for everyone.
    const onEnded = () => socket.emit("queue:ended", { id: songId });

    audio.addEventListener("loadedmetadata", onLoaded, { once: true });
    audio.addEventListener("ended", onEnded, { once: true });
    audio.src = url; // setting the source starts loading

    // clean up when the song changes or you tune out.
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, [tunedIn, url, startedAt, songId, offsetRef]);

}