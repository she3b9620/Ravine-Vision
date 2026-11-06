import { RouteState } from "@/components/route-state";

// Handles notFound() raised by pages inside the locale segment, e.g. the review
// console hiding itself from accounts without a staff role.
export default function LocaleNotFound() {
  return (
    <RouteState
      code="404"
      titleAr="لا يوجد شيء هنا."
      titleEn="Nothing here."
      bodyAr="قد يكون هذا المحتوى غير متاح لحسابك، أو أنه لم يُنشر بعد. لا نكشف تفاصيل ما لا تملك صلاحية الوصول إليه."
      bodyEn="This content may not be available to your account, or it may not be published yet. We do not reveal details of what you are not permitted to access."
    />
  );
}
