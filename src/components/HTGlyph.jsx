const sprite = process.env.PUBLIC_URL + "/assets/brand/hometruth-icons.svg";

export default function HTGlyph({ name, size = 24, label, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" focusable="false"
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} {...props}>
      <use href={sprite + "#ht-" + name} />
    </svg>
  );
}
