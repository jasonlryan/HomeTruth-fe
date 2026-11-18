export function getNoteExcerpt(value, limit = 190) {
  const text = String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > limit
    ? `${text.slice(0, limit).trimEnd()}…`
    : text || "Open this note to read the full answer.";
}
