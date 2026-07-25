export type ApiErrorBody = {
  detail?: unknown;
  code?: string;
  request_id?: string;
};

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(
      typeof body.detail === "string"
        ? body.detail
        : `API request failed with status ${status}`,
    );
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return base;
}

type ApiFetchOptions = RequestInit & {
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = { detail: response.statusText };
    }
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type UserResponse = {
  id: string;
  firstname: string | null;
  lastname: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  created_at: string;
  last_signed_in: string | null;
  updated_at: string | null;
  member_since: string | null;
  role: string | null;
};

export function getCurrentUser(token: string) {
  return apiFetch<UserResponse>("/api/v1/users/me", { token });
}
