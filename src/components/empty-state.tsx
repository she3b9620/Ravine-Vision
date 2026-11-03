import Link from "next/link";

export function EmptyState({
  locale,
  title,
  description,
  actionLabel,
  actionHref
}: {
  locale: "ar" | "en";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rv-empty-state">
      <div className="rv-empty-symbol">◌</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="rv-empty-action">
          {actionLabel} ↗
        </Link>
      )}
    </div>
  );
}
