import { notFound } from "next/navigation";
import Link from "next/link";
import { signInAction, signUpAction } from "../auth/actions";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string; check_email?: string }> };

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const errors: Record<string, string> = ar
    ? { missing: "أدخل البريد الإلكتروني وكلمة المرور.", credentials: "بيانات الدخول غير صحيحة.", invalid: "راجع الاسم والبريد، واجعل كلمة المرور 10 أحرف على الأقل.", signup: "تعذر إنشاء الحساب. قد يكون البريد مستخدمًا بالفعل.", callback: "تعذر تأكيد الحساب. حاول تسجيل الدخول." }
    : { missing: "Enter your email and password.", credentials: "The email or password is incorrect.", invalid: "Check your name and email; password must be at least 10 characters.", signup: "Account creation failed. This email may already be registered.", callback: "Account confirmation failed. Try signing in." };
  return (
    <main className="auth-screen" dir={ar ? "rtl" : "ltr"}>
      <header className="auth-header"><Link className="rv-logo" href={"/" + locale}><i className="rv-logo-wordmark" role="img" aria-label="RAVINE" /></Link><Link href={"/" + (ar ? "en" : "ar")} className="rv-lang">{ar ? "EN" : "عربي"}</Link></header>
      <div className="auth-layout">
        <section className="auth-intro"><p className="rv-eyebrow"><i />THE PATH TO LIGHT</p><h1>{ar ? "مكانك في الحكاية يبدأ من هنا." : "Your place in the story begins here."}</h1><p>{ar ? "أنشئ حسابك لتكتشف وتتفاعل وتحفظ ما يهمك، أو لتبدأ رحلتك الإبداعية." : "Create an account to discover, participate, save what matters, or begin your creative journey."}</p></section>
        <section className="auth-panel">
          <h2>{ar ? "تسجيل الدخول" : "Sign in"}</h2>
          {query.error && <p className="auth-message" role="alert">{errors[query.error] ?? (ar ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Try again.")}</p>}
          {query.check_email && <p className="auth-success">{ar ? "تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. افتحها لإكمال إنشاء الحساب." : "A confirmation email has been sent. Open it to finish creating your account."}</p>}
          <form action={signInAction} className="auth-form">
            <input type="hidden" name="locale" value={locale}/>
            <label>{ar ? "البريد الإلكتروني" : "Email"}<input name="email" type="email" autoComplete="email" required/></label>
            <label>{ar ? "كلمة المرور" : "Password"}<input name="password" type="password" autoComplete="current-password" required/></label>
            <button className="rv-primary" type="submit">{ar ? "دخول" : "Sign in"} <span>↗</span></button>
          </form>
          <div className="auth-divider"><span>{ar ? "أو أنشئ حسابًا جديدًا" : "Or create a new account"}</span></div>
          <form action={signUpAction} className="auth-form">
            <input type="hidden" name="locale" value={locale}/>
            <label>{ar ? "الاسم الظاهر" : "Display name"}<input name="display_name" autoComplete="name" required/></label>
            <label>{ar ? "البريد الإلكتروني" : "Email"}<input name="email" type="email" autoComplete="email" required/></label>
            <label>{ar ? "كلمة المرور (10 أحرف على الأقل)" : "Password (at least 10 characters)"}<input name="password" type="password" minLength={10} autoComplete="new-password" required/></label>
            <button className="auth-secondary-button" type="submit">{ar ? "إنشاء حساب" : "Create account"}</button>
          </form>
          <p className="auth-footnote">{ar ? "سيتم تفعيل الحساب بعد تأكيد البريد الإلكتروني." : "Your account becomes active after email confirmation."}</p>
        </section>
      </div>
    </main>
  );
}
