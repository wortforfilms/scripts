export function connectEvents(onEvent: (e: any) => void) {
  try {
    const es = new EventSource("/api/health");
    es.onmessage = (e) => onEvent(e.data);
    return () => es.close();
  } catch {
    return () => {};
  }
}
