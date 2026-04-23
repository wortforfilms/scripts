const schedulerState = {
  ticks: 0,
  lastEvent: null,
  logs: []
};

const schedulerListeners = new Set();

function notify(event) {
  for (const listener of schedulerListeners) {
    try {
      listener(event);
    } catch {}
  }
}

function pushLog(event) {
  schedulerState.logs = [event, ...schedulerState.logs].slice(0, 50);
  schedulerState.lastEvent = event;
  notify(event);
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

export function subscribeScheduler(listener) {
  schedulerListeners.add(listener);
  return () => schedulerListeners.delete(listener);
}

export function getSchedulerState() {
  return schedulerState;
}
