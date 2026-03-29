/**
 * Standard page title matching Budget Calculator baseline.
 * Use for all logged-in page titles: text-xl, font-semibold, text-gray-900.
 */
export default function PageTitle({ as: Tag = "h1", children, className = "" }) {
  const baseClass = "text-xl font-semibold text-gray-900";
  return <Tag className={className ? `${baseClass} ${className}` : baseClass}>{children}</Tag>;
}
