export default function PageTitle({ as: Tag = "h1", children, className = "" }) {
  return <Tag className={`ht-page-title text-[var(--color-text-default)] ${className}`.trim()}>{children}</Tag>;
}
