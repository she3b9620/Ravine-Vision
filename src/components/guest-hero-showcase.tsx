"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RAVINEOpenAuth from "@/components/open-auth-link";

type Props = {
  locale: string;
};

export default function GuestHeroShowcase({ locale }: Props) {
  const ar = locale === "ar";
  const [mode, setMode] = useState<"video" | "image">("video");
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Respect reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, []);

  function togglePlay() {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  return (
    <section className="rv-hero-showcase" aria-label={ar ? "معاينة المنصة" : "Platform showcase"}>
      <div className="rv-showcase-copy">
        <p className="rv-kicker"><i />{ar ? "مساحة للإبداع الإنساني والمعرفة" : "A space for human creativity & knowledge"}</p>
        <h1>{ar ? "ما يستحق أن يُرى، يستحق أن يبقى." : "What deserves to be seen, deserves to last."}</h1>
        <p className="rv-hero-charter-note">
          {ar
            ? "شاهد عيّنة من الأعمال، تعرّف على المبدعين، وافهم فكرة رَافِين قبل ما تسجّل. التفاعل الكامل يبدأ بعد إنشاء حسابك."
            : "Preview the work, discover creators, and understand RAVINE before signing up. Full interaction begins after creating your account."}
        </p>

        <div className="rv-hero-actions">
          <Link className="rv-action-primary" href={`/${locale}/discover`}>
            {ar ? "ابدأ الاكتشاف" : "Begin exploring"} <span>↗</span>
          </Link>
          <Link className="rv-action-text" href={`/${locale}/about`}>
            {ar ? "حكاية رافين" : "About RAVINE"}
          </Link>
          <RAVINEOpenAuth className="rv-action-ghost">
            {ar ? "إنشاء حساب ↗" : "Create account ↗"}
          </RAVINEOpenAuth>
        </div>
      </div>

      <div className="rv-showcase-media-frame">
        <div className="rv-media-toolbar">
          <div className="rv-mode-selector" role="tablist" aria-label={ar ? "نمط المعاينة" : "Preview mode"}>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "video"}
              className={mode === "video" ? "active" : ""}
              onClick={() => setMode("video")}
            >
              {ar ? "فيديو" : "Video"}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "image"}
              className={mode === "image" ? "active" : ""}
              onClick={() => setMode("image")}
            >
              {ar ? "صورة" : "Image"}
            </button>
          </div>

          <span className="rv-showcase-badge">
            {ar ? "معاينة سينمائية" : "CINEMATIC PREVIEW"}
          </span>
        </div>

        <div className="rv-media-screen">
          {mode === "video" ? (
            <div className="rv-video-wrapper">
              <video
                ref={videoRef}
                className="rv-hero-video"
                poster="/showcase/cinematic-hero.png"
                muted
                loop
                playsInline
                autoPlay
                aria-label={ar ? "فيديو سينمائي تجريبي" : "Cinematic showcase video"}
              >
                {/* Fallback to poster and ambient animations if webm/mp4 not provided */}
                <source src="/showcase/ambient-preview.mp4" type="video/mp4" />
              </video>
              <div className="rv-video-overlay">
                <button
                  type="button"
                  className="rv-video-control-btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? (ar ? "إيقاف مؤقت" : "Pause preview") : (ar ? "تشغيل" : "Play preview")}
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>
                <div className="rv-video-caption">
                  <span>RAVINE / CINEMA MODE</span>
                  <small>{ar ? "الشِّعب · الطريق إلى النور" : "The Path to Light"}</small>
                </div>
              </div>
            </div>
          ) : (
            <div className="rv-image-wrapper">
              <img
                src="/showcase/cinematic-hero.png"
                alt={ar ? "لقطة سينمائية من أعمال رافين" : "Cinematic still from RAVINE works"}
                className="rv-hero-image"
                loading="eager"
              />
              <div className="rv-image-caption">
                <span>R / 001 — VISUAL ARTS</span>
                <small>{ar ? "أعمال بصرية مختارة" : "Curated visual selection"}</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
