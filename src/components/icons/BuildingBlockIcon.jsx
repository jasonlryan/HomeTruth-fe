const variants = {
  purchase: [
    { x: 5, y: 7, size: 18, fill: "var(--ht-orange)" },
    { x: 5, y: 25, size: 18, fill: "var(--ht-purple-light)" },
    { x: 23, y: 25, size: 18, fill: "var(--ht-cyan)" },
  ],
  maintain: [
    { x: 8, y: 6, size: 16, fill: "var(--ht-cyan)" },
    { x: 24, y: 6, size: 16, fill: "var(--ht-purple)" },
    { x: 16, y: 22, size: 16, fill: "var(--ht-green)" },
  ],
  improve: [
    { x: 6, y: 24, size: 17, fill: "var(--ht-purple-light)" },
    { x: 15.5, y: 7, size: 17, fill: "var(--ht-orange)" },
    { x: 25, y: 24, size: 17, fill: "var(--ht-cyan-light)" },
  ],
  sell: [
    { x: 6, y: 8, size: 16, fill: "var(--ht-green)" },
    { x: 22, y: 8, size: 16, fill: "var(--ht-cyan)" },
    { x: 14, y: 24, size: 16, fill: "var(--ht-orange)" },
    { x: 30, y: 24, size: 10, fill: "var(--ht-purple)" },
  ],
};

export default function BuildingBlockIcon({
  variant = "purchase",
  className = "h-10 w-10",
  title,
}) {
  const blocks = variants[variant] || variants.purchase;
  const labelled = Boolean(title);

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden={labelled ? undefined : "true"}
      role={labelled ? "img" : undefined}
    >
      {labelled && <title>{title}</title>}
      {blocks.map((block, index) => (
        <rect
          key={`${variant}-${index}`}
          x={block.x}
          y={block.y}
          width={block.size}
          height={block.size}
          rx="3"
          fill={block.fill}
        />
      ))}
    </svg>
  );
}
