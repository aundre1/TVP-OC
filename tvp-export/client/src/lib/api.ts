import type { Video, UserProfile, UpdateUserProfile } from "@shared/schema";

const API_BASE = "/api";

// Videos
export async function fetchVideos(filters?: {
  genre?: string;
  bpmMin?: number;
  bpmMax?: number;
  quality?: string;
  search?: string;
}): Promise<Video[]> {
  const params = new URLSearchParams();
  if (filters?.genre) params.append("genre", filters.genre);
  if (filters?.bpmMin) params.append("bpmMin", filters.bpmMin.toString());
  if (filters?.bpmMax) params.append("bpmMax", filters.bpmMax.toString());
  if (filters?.quality) params.append("quality", filters.quality);
  if (filters?.search) params.append("search", filters.search);

  const url = `${API_BASE}/videos${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch videos");
  return response.json();
}

export async function fetchVideo(id: string): Promise<Video> {
  const response = await fetch(`${API_BASE}/videos/${id}`);
  if (!response.ok) throw new Error("Failed to fetch video");
  return response.json();
}

// User Profile
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/profile/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/profile/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
}

// Favorites
export async function fetchFavorites(userId: string): Promise<Video[]> {
  const response = await fetch(`${API_BASE}/favorites/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch favorites");
  return response.json();
}

export async function addFavorite(userId: string, videoId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, videoId }),
  });
  if (!response.ok) throw new Error("Failed to add favorite");
}

export async function removeFavorite(userId: string, videoId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/favorites/${userId}/${videoId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to remove favorite");
}

export async function checkFavorite(userId: string, videoId: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/favorites/${userId}/${videoId}/check`);
  if (!response.ok) throw new Error("Failed to check favorite status");
  const data = await response.json();
  return data.isFavorite;
}

// Downloads
export async function addDownload(userId: string, videoId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/downloads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, videoId }),
  });
  if (!response.ok) throw new Error("Failed to add download");
}

export async function fetchDownloads(userId: string, limit?: number): Promise<any[]> {
  const url = limit 
    ? `${API_BASE}/downloads/${userId}?limit=${limit}`
    : `${API_BASE}/downloads/${userId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch downloads");
  return response.json();
}
