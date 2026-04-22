const schedulerState = {
  ticks: 0,
  lastEvent: null,
  logs: []
};

function pushLog(event) {
  schedulerState.logs = [event, ...schedulerState.logs].slice(0, 50);
  schedulerState.lastEvent = event;
}

export function createSchedulerEmitter() {
  return () => {
    schedulerState.ticks += 1;
    const event = {
      id: `scheduler-${schedulerState.ticks}`,
      source: "scheduler",
      type: "scheduler.tick",
      time: new Date().toISOString(),
      state: schedulerState.ticks % 5 === 0 ? "warn" : "ok",
      tick: schedulerState.ticks
    };
    pushLog(event);
    return event;
  };
}

export function getSchedulerState() {
  return schedulerState;
}
