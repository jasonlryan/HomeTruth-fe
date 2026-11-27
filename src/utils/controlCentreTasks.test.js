import { groupPropertyTasks } from "./controlCentreTasks";

function task(id, changes) {
  return { id, propertyId: 12, status: "open", taskType: "known_issue_follow_up", ...changes };
}

test("keeps scheduled tasks in date order and prioritises overdue before undated follow-ups", () => {
  const tasks = [
    task(1, { dueDate: "2026-12-03" }),
    task(2, { dueDate: "2026-11-19" }),
    task(3, { sourceType: "manual" }),
    task(4, { dueDate: "2026-11-16" }),
    task(5, { dueDate: "2026-11-14" }),
    task(6, { dueDate: "2026-02-30", taskType: "service_due" }),
    task(7, { taskType: "missing_baseline" }),
    task(8, { dueDate: "2026-11-21", propertyId: 13 }),
    task(9, { dueDate: "2026-11-21", status: "completed" }),
  ];
  const { upcoming, attention } = groupPropertyTasks(tasks, "12", "2026-11-19");
  expect(upcoming.map(({ task }) => task.id)).toEqual([2, 1]);
  expect(attention.map(({ task }) => task.id)).toEqual([5, 4, 3, 6]);
  expect(attention.map(({ overdue }) => overdue)).toEqual([true, true, false, false]);
  expect(attention[3].date).toBeNull();
});
