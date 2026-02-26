const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string; error?: string };
    const message = data?.message || data?.error;
    if (message) return message;
  } catch {
    // Ignore parse failures for non-JSON responses.
  }
  return `${response.status} ${response.statusText}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listResource<T>(resource: string): Promise<T[]> {
  return request<T[]>(`/${resource}`);
}

export function createResource<T extends object>(
  resource: string,
  payload: T,
): Promise<T> {
  return request<T>(`/${resource}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function patchResource<T extends object>(
  resource: string,
  id: string,
  payload: Partial<T>,
): Promise<T> {
  return request<T>(`/${resource}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteResource(resource: string, id: string): Promise<void> {
  return request<void>(`/${resource}/${id}`, {
    method: "DELETE",
  });
}
