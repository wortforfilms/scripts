export function createSchedulerEmitter() {
  return () => ({
    type: "scheduler.tick",
    time: new Date().toISOString(),
    state: "ok"
  });
}
