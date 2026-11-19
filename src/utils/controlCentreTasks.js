function localDate() {
  const today = new Date();
  const local = [today.getFullYear(), today.getMonth() + 1, today.getDate()];
  return local.map(value => String(value).padStart(2, "0")).join("-");
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}

export function groupPropertyTasks(tasks, propertyId, today = localDate()) {
  const ordered = tasks
    .filter(task => task.status === "open" && String(task.propertyId) === String(propertyId))
    .map(task => {
      const date = validDate(task.dueDate);
      return { task, date, overdue: Boolean(date && date < today) };
    })
    .sort((a, b) => (a.date || "9999-99-99").localeCompare(b.date || "9999-99-99"));

  return {
    upcoming: ordered.filter(row => row.date && !row.overdue),
    attention: ordered.filter(({ task, date, overdue }) => overdue || (!date && (
      task.sourceType === "manual" || task.taskType === "known_issue_follow_up" || task.taskType === "service_due" || task.taskType === "document_expiry"
    ))),
  };
}
