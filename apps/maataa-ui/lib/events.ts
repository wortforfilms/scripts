export function connectEvents(onEvent: (e: any) => void) {
  try {
    const es = new EventSource("/api/spine/events");
    es.onmessage = (e) => onEvent(e.data);
    es.onerror = () => es.close();
    return () => es.close();
  } catch {
    return () => {};
  }
}
