import HTGlyph from "./HTGlyph";
export default function ArrowBullet({ children }) {
  return (
    <div className="flex items-start space-x-3 mb-2">
      <div className="flex-shrink-0 w-6 h-6 bg-sky-50 text-ht-cyan rounded-full flex items-center justify-center text-xs font-bold">
        <HTGlyph name="chevron-right" size={16} />
      </div>
      <div className="text-gray-800">{children}</div>
    </div>
  );
}
