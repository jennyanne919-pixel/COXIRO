"use client";

import { useRef, useEffect, useCallback } from "react";
import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
  DefaultAudioLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import { saveProgress } from "./actions";

export default function VideoPlayer({
  src,
  title,
  contentItemId,
  resumeAt,
  isAudio,
}: {
  src: string;
  title: string;
  contentItemId: string;
  resumeAt: number;
  isAudio: boolean;
}) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const yaSaltoRef = useRef(false);

  const guardarProgreso = useCallback(() => {
    const t = playerRef.current?.currentTime;
    if (t && t > 0) {
      saveProgress(contentItemId, t);
    }
  }, [contentItemId]);

  // Guarda el progreso cada 10 segundos mientras se reproduce, y al
  // salir de la página -- así, si la cierra a media reproducción, no
  // se pierde el punto donde iba.
  useEffect(() => {
    const interval = setInterval(guardarProgreso, 10000);
    window.addEventListener("beforeunload", guardarProgreso);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", guardarProgreso);
      guardarProgreso();
    };
  }, [guardarProgreso]);

  function handleCanPlay() {
    // Solo saltamos al punto guardado la primera vez que carga, no
    // cada vez que el navegador dispara "canPlay" de nuevo.
    if (!yaSaltoRef.current && resumeAt > 5 && playerRef.current) {
      playerRef.current.currentTime = resumeAt;
      yaSaltoRef.current = true;
    }
  }

  return (
    <MediaPlayer
      ref={playerRef}
      title={title}
      src={src}
      crossOrigin
      playsInline
      onCanPlay={handleCanPlay}
      onPause={guardarProgreso}
      className="w-full rounded-lg overflow-hidden"
    >
      <MediaProvider />
      {isAudio ? (
        <DefaultAudioLayout icons={defaultLayoutIcons} />
      ) : (
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      )}
    </MediaPlayer>
  );
}
