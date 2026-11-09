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
  const ultimoTiempoRef = useRef(0);
  const ultimoGuardadoRef = useRef(0);

  const guardarProgreso = useCallback(
    (forzar = true) => {
      const player = playerRef.current;
      const t = player?.currentTime || ultimoTiempoRef.current;
      if (!t || t <= 0) return;
      const ahora = Date.now();
      if (!forzar && ahora - ultimoGuardadoRef.current < 10000) return;
      ultimoGuardadoRef.current = ahora;
      const d = player?.duration;
      saveProgress(contentItemId, t, d && Number.isFinite(d) ? d : undefined);
    },
    [contentItemId]
  );

  // Guarda cada 10 s mientras se reproduce (onTimeUpdate), al pausar, al
  // terminar y al salir de la página o cambiar de pestaña. Antes solo
  // guardaba con un temporizador y al desmontar, y el último tramo se perdía.
  useEffect(() => {
    const alOcultar = () => {
      if (document.visibilityState === "hidden") guardarProgreso(true);
    };
    const alSalir = () => guardarProgreso(true);
    document.addEventListener("visibilitychange", alOcultar);
    window.addEventListener("pagehide", alSalir);
    return () => {
      document.removeEventListener("visibilitychange", alOcultar);
      window.removeEventListener("pagehide", alSalir);
      if (ultimoTiempoRef.current > 0) {
        saveProgress(contentItemId, ultimoTiempoRef.current);
      }
    };
  }, [guardarProgreso, contentItemId]);

  function handleCanPlay() {
    // Solo saltamos al punto guardado la primera vez que carga. Si ya lo
    // había visto casi entero, empieza desde el principio.
    if (yaSaltoRef.current || !playerRef.current) return;
    yaSaltoRef.current = true;
    const d = playerRef.current.duration;
    const casiFinal = d && Number.isFinite(d) && resumeAt >= d - 10;
    if (resumeAt > 5 && !casiFinal) {
      playerRef.current.currentTime = resumeAt;
    }
  }

  function handleTimeUpdate() {
    const t = playerRef.current?.currentTime;
    if (t) ultimoTiempoRef.current = t;
    guardarProgreso(false);
  }

  return (
    <MediaPlayer
      ref={playerRef}
      title={title}
      src={src}
      crossOrigin
      playsInline
      onCanPlay={handleCanPlay}
      onTimeUpdate={handleTimeUpdate}
      onPause={() => guardarProgreso(true)}
      onEnded={() => guardarProgreso(true)}
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
