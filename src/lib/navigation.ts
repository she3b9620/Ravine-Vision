export type NavigationItem = {
  id: string;
  href: string;
  label: { ar: string; en: string };
  audience: "everyone" | "signed-in" | "creator";
};

export const publicNavigation: NavigationItem[] = [
  { id: "discover", href: "/discover", label: { ar: "اكتشف", en: "Discover" }, audience: "everyone" },
  { id: "works", href: "/works", label: { ar: "الأعمال", en: "Works" }, audience: "everyone" },
  { id: "creators", href: "/creators", label: { ar: "المبدعون", en: "Creators" }, audience: "everyone" },
  { id: "communities", href: "/communities", label: { ar: "المجتمعات", en: "Communities" }, audience: "everyone" },
  { id: "about", href: "/about", label: { ar: "عن رَافِين", en: "About" }, audience: "everyone" },
];

export const creatorNavigation: NavigationItem[] = [
  { id: "overview", href: "/creator", label: { ar: "نظرة عامة", en: "Overview" }, audience: "creator" },
  { id: "studio", href: "/creator/studio", label: { ar: "مساحة العمل", en: "Studio" }, audience: "creator" },
  { id: "library", href: "/creator/library", label: { ar: "مكتبة الأعمال", en: "Work library" }, audience: "creator" },
  { id: "community", href: "/creator/community", label: { ar: "مجتمعي", en: "My community" }, audience: "creator" },
  { id: "earnings", href: "/creator/earnings", label: { ar: "الأرباح", en: "Earnings" }, audience: "creator" },
];
