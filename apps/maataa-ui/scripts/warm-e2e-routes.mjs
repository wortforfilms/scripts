const baseUrl = process.env.APP_BASE_URL ?? "http://127.0.0.1:3000";
const routes = ["/dashboard", "/merkle", "/proof-inspector"];
const timeoutMs = 120_000;
const pollIntervalMs = 1_000;

async function waitForRoute(route) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}${route}`, {
        redirect: "follow",
        headers: {
          "user-agent": "maataa-e2e-warmup"
        }
      });

      if (response.ok) {
        console.log(`warmed ${route} (${response.status})`);
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Timed out warming ${route} after ${timeoutMs}ms`);
}

for (const route of routes) {
  await waitForRoute(route);
}
