export default function ArrowBullet({ children }) {
  return (
    <div className="flex items-start space-x-3 mb-2">
      <div className="flex-shrink-0 w-6 h-6 bg-customActive text-customActiveText rounded-full flex items-center justify-center text-xs font-bold">
        <span class="material-symbols-outlined text-sm">arrow_forward_ios</span>
      </div>
      <div className="text-gray-800">{children}</div>
    </div>
  );
}
