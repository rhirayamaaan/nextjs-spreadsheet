export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`API Error ${status} (${statusText})`);
    this.name = "ApiError";
  }
}

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    let errorData: unknown;
    try {
      errorData = await res.json();
    } catch {
      try {
        errorData = await res.text();
      } catch {
        errorData = null;
      }
    }
    throw new ApiError(res.status, res.statusText, errorData);
  }

  // 204 No Content などの空レスポンスを考慮
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json();
};

export const apiClient = {
  async get<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...init,
      method: "GET",
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
    return handleResponse<T>(res);
  },

  async post<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...init,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init?.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async put<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...init,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init?.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async delete<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...init,
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
    return handleResponse<T>(res);
  },
};
