import { persistRuntimeEvent } from "@maataa/runtime-db";

const schedulerState = {
  ticks: 0,
  lastEvent: null,
  logs: [],
  queue: []
};

const schedulerListeners = new Set();

function notify(event) {
  for (const listener of schedulerListeners) {
    try {
      listener(event);
    } catch {}
  }
}

async function pushLog(event) {
  schedulerState.logs = [event, ...schedulerState.logs].slice(0, 50);
  schedulerState.lastEvent = event;
  notify(event);
  try {
    await persistRuntimeEvent(event);
  } catch {}
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
      tick: schedulerState.ticks,
      queueSize: schedulerState.queue.length
    };
    pushLog(event);
    return event;
  };
}

export function emitSchedulerEvent(event) {
  const normalized = {
    id: event.id ?? `scheduler-${Date.now()}`,
    source: "scheduler",
    type: event.type ?? "scheduler.event",
    time: event.time ?? new Date().toISOString(),
    state: event.state ?? "ok",
    ...event
  };
  pushLog(normalized);
  return normalized;
}

export function queueSchedulerTask(task) {
  const queued = {
    id: task.id ?? `task-${Date.now()}`,
    title: task.title ?? "Untitled Task",
    status: task.status ?? "queued",
    createdAt: new Date().toISOString(),
    ...task
  };
  schedulerState.queue = [queued, ...schedulerState.queue].slice(0, 50);
  emitSchedulerEvent({
    type: "scheduler.queued",
    state: "ok",
    taskId: queued.id,
    title: queued.title,
    queueSize: schedulerState.queue.length
  });
  return queued;
}

export function tickScheduler() {
  schedulerState.ticks += 1;
  const event = {
    id: `scheduler-${schedulerState.ticks}`,
    source: "scheduler",
    type: "scheduler.tick",
    time: new Date().toISOString(),
    state: schedulerState.queue.length > 5 ? "warn" : "ok",
    tick: schedulerState.ticks,
    queueSize: schedulerState.queue.length
  };
  pushLog(event);
  return event;
}

export function subscribeScheduler(listener) {
  schedulerListeners.add(listener);
  return () => schedulerListeners.delete(listener);
}

export function getSchedulerState() {
  return schedulerState;
}
