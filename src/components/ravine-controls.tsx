"use client";

import { useEffect, useState } from "react";
import { signInWithGoogleAction } from "@/app/[locale]/auth/actions";

export default function RAVINEControls({ locale, googleEnabled = false }: { locale: "ar" | "en"; googleEnabled?: boolean }) {
  const ar = locale === "ar";
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("ravine-theme");
    return saved === "light";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = light ? "light" : "dark";
  }, [light]);
  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
    window.localStorage.setItem("ravine-theme", next ? "light" : "dark");
  }
  function switchLocale() {
    const path = window.location.pathname;
    const next = path.replace(/^\/(ar|en)(?=\/|$)/, ar ? "/en" : "/ar");
    window.location.assign(next || (ar ? "/en" : "/ar"));
  }
  return <>
    <div className="rv-global-controls">
      <button type="button" onClick={switchLocale} aria-label={ar ? "تغيير اللغة" : "Change language"}>{ar ? "EN" : "عربي"}</button>
      <button type="button" onClick={toggleTheme} aria-label={ar ? "تغيير وضع العرض" : "Toggle appearance"}>{light ? "☾" : "☼"}</button>
    </div>
    <button type="button" className="rv-modal-trigger" onClick={() => setOpen(true)}>{ar ? "إنشاء حساب" : "Create account"}</button>
    {open && <div className="rv-auth-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <section className="rv-auth-modal" role="dialog" aria-modal="true" aria-labelledby="rv-auth-title">
        <button className="rv-auth-close" type="button" onClick={() => setOpen(false)} aria-label={ar ? "إغلاق" : "Close"}>×</button>
        <p className="rv-auth-kicker">RAVINE / THE PATH TO LIGHT</p>
        <h2 id="rv-auth-title">{ar ? "ابدأ رحلتك في رافين" : "Begin your RAVINE journey"}</h2>
        <p>{ar ? "استكشف كزائر، أو أنشئ حسابًا لتشارك وتحفظ وتتواصل." : "Explore as a guest, or create an account to participate, save, and connect."}</p>
        <form action={signInWithGoogleAction}>
          <input type="hidden" name="locale" value={locale}/>
          {googleEnabled ? (
            <>
              <button className="rv-google-button" type="submit"><span>G</span>{ar ? "المتابعة باستخدام Google" : "Continue with Google"}</button>
              <div className="rv-auth-separator"><span>{ar ? "أو" : "or"}</span></div>
            </>
          ) : (
            <p className="rv-auth-unavailable">{ar ? "الدخول عبر Google غير مُفعّل في هذه البيئة بعد." : "Google sign-in is not enabled in this environment yet."}</p>
          )}
        </form>
        <a className="rv-email-auth-link" href={`/${locale}/login`}>{ar ? "البريد الإلكتروني وكلمة المرور" : "Continue with email"}</a>
        <small>{ar ? "يمكنك مواصلة التصفح كزائر دون إنشاء حساب." : "You can keep browsing as a guest without creating an account."}</small>
      </section>
    </div>}
  </>;
}
