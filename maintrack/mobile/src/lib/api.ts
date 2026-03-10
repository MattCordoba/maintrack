import { supabase } from "./supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    "Content-Type": "application/json",
    Authorization: session ? `Bearer ${session.access_token}` : "",
  };
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Assets
export async function getAssets() {
  return fetchApi<{ assets: any[] }>("/api/assets");
}

export async function getAsset(id: string) {
  return fetchApi<{ asset: any }>(`/api/assets/${id}`);
}

// Tasks
export async function getTasks(params?: { status?: string; type?: string }) {
  const searchParams = new URLSearchParams(params as any);
  return fetchApi<{ tasks: any[] }>(`/api/tasks?${searchParams}`);
}

export async function getTask(id: string) {
  return fetchApi<{ task: any }>(`/api/tasks/${id}`);
}

export async function completeTask(id: string, data: { notes?: string; meterValue?: number }) {
  return fetchApi(`/api/tasks/${id}/complete`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Search
export async function search(query: string, filters?: { status?: string; type?: string }) {
  const searchParams = new URLSearchParams({ q: query, ...filters } as any);
  return fetchApi<{ results: any[] }>(`/api/search?${searchParams}`);
}

// Notifications
export async function getNotifications() {
  return fetchApi<{ notifications: any[] }>("/api/notifications");
}

export async function markNotificationRead(id: string) {
  return fetchApi(`/api/notifications/${id}/read`, { method: "POST" });
}

export async function markAllNotificationsRead() {
  return fetchApi("/api/notifications/read-all", { method: "POST" });
}
