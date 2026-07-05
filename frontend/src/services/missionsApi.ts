import type {
  Mission,
  MissionCreatePayload,
  MissionEvent,
  MissionListParams,
  MissionStatusUpdatePayload,
  PaginatedMissions,
} from "../types/mission";
import { API_URL } from "../config";

interface ApiValidationError {
  msg?: string;
}

function stringifyDetail(detail: unknown): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (typeof detail === "object" && detail !== null) {
    if ("msg" in detail && typeof detail.msg === "string") {
      return detail.msg;
    }

    if ("message" in detail && typeof detail.message === "string") {
      return detail.message;
    }

    return JSON.stringify(detail);
  }

  return String(detail);
}

function getErrorMessage(data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data
  ) {
    const detail = (data as { detail?: unknown }).detail;

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item: ApiValidationError) => item.msg)
        .filter(Boolean)
        .join("; ");

      return messages || detail.map(stringifyDetail).join("; ");
    }

    return stringifyDetail(detail);
  }

  return "Erro ao comunicar com a API";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(getErrorMessage(data));
  }

  return response.json() as Promise<T>;
}

export async function listMissions({
  page,
  pageSize,
  status,
}: MissionListParams): Promise<PaginatedMissions> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (status) {
    params.set("status", status);
  }

  return request<PaginatedMissions>(`/missions?${params.toString()}`);
}

export async function getMissionById(id: number): Promise<Mission> {
  return request<Mission>(`/missions/${id}`);
}

export async function createMission(
  payload: MissionCreatePayload,
): Promise<Mission> {
  return request<Mission>("/missions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMissionStatus(
  id: number,
  payload: MissionStatusUpdatePayload,
): Promise<Mission> {
  return request<Mission>(`/missions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function listMissionEvents(limit = 20): Promise<MissionEvent[]> {
  return request<MissionEvent[]>(`/events?limit=${limit}`);
}


