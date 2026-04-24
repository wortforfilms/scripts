type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  ok: boolean;
  headers: Headers;
  response: Response | null;
};

const RATE_LIMIT_STORE_SYMBOL = Symbol.for("maataa.rate-limit.store");

function getRateLimitStore(): Map<string, RateBucket> {
  const globalWithStore = globalThis as typeof globalThis & {
    [RATE_LIMIT_STORE_SYMBOL]?: Map<string, RateBucket>;
  };

  if (!globalWithStore[RATE_LIMIT_STORE_SYMBOL]) {
    globalWithStore[RATE_LIMIT_STORE_SYMBOL] = new Map<string, RateBucket>();
  }

  return globalWithStore[RATE_LIMIT_STORE_SYMBOL];
}

function secureEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;
  const [scheme, token] = authorization.split(/\s+/, 2);
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function getAdminToken(): string | null {
  return process.env.MAATAA_ADMIN_TOKEN ?? process.env.ADMIN_TOKEN ?? null;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getAdminToken());
}

export function requireAdminToken(request: Request): Response | null {
  const expectedToken = getAdminToken();

  if (!expectedToken) {
    return Response.json(
      {
        ok: false,
        error: "admin_auth_not_configured"
      },
      { status: 503 }
    );
  }

  const providedToken =
    request.headers.get("x-maataa-admin-token") ??
    request.headers.get("x-admin-token") ??
    getBearerToken(request);

  if (!providedToken || !secureEqual(providedToken, expectedToken)) {
    return Response.json(
      {
        ok: false,
        error: "unauthorized"
      },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="Maataa Admin"'
        }
      }
    );
  }

  return null;
}

export function getClientAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "anonymous";
}

export function checkRateLimit(request: Request, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const clientAddress = getClientAddress(request);
  const storeKey = `${options.key}:${clientAddress}`;
  const store = getRateLimitStore();
  const existing = store.get(storeKey);

  if (!existing || existing.resetAt <= now) {
    store.set(storeKey, {
      count: 1,
      resetAt: now + options.windowMs
    });
  } else {
    existing.count += 1;
    store.set(storeKey, existing);
  }

  const current = store.get(storeKey)!;
  const remaining = Math.max(0, options.limit - current.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  const headers = new Headers({
    "X-RateLimit-Limit": String(options.limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": new Date(current.resetAt).toISOString(),
    "Retry-After": String(retryAfterSeconds)
  });

  if (current.count > options.limit) {
    return {
      ok: false,
      headers,
      response: Response.json(
        {
          ok: false,
          error: "rate_limited",
          retryAfterSeconds
        },
        {
          status: 429,
          headers
        }
      )
    };
  }

  return { ok: true, headers, response: null };
}

export function jsonWithHeaders(body: unknown, init: ResponseInit = {}, headers?: Headers): Response {
  const responseHeaders = new Headers(init.headers);
  if (headers) {
    headers.forEach((value, key) => responseHeaders.set(key, value));
  }

  return Response.json(body, {
    ...init,
    headers: responseHeaders
  });
}

export function resetRateLimitStateForTests(): void {
  getRateLimitStore().clear();
}
