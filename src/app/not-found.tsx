import { RouteState } from "@/components/route-state";

// Root boundary: also serves invalid locales, because notFound() thrown inside
// the [locale] layout is handled by the parent segment.
export default function NotFound() {
  return (
    <RouteState
      code="404"
      titleAr="هذا الطريق لا يؤدي إلى نور."
      titleEn="This path leads nowhere."
      bodyAr="الصفحة التي تبحث عنها غير موجودة، أو تغيّر مسارها، أو أن الرابط غير مكتمل. يمكنك العودة إلى عالم رَافِين من أحد الروابط أدناه."
      bodyEn="The page you are looking for does not exist, has moved, or the link is incomplete. You can return to RAVINE using the links below."
    />
  );
}
