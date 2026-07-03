export type MissionStatus = "planned" | "launched" | "completed" | "failed";
export type MissionUpdateStatus = Exclude<MissionStatus, "planned">;
export type FilterMode = "status" | "id";

export interface Mission {
  id: number;
  name: string;
  destination: string;
  status: MissionStatus;
}

export interface MissionEvent {
  id: number;
  event_id: string;
  event_type: string;
  registered_at: string;
  created_at: string;
  mission_id: number;
  mission_name: string;
  destination: string;
  status: MissionStatus;
}

export interface MissionCreatePayload {
  name: string;
  destination: string;
  status: "planned";
}

export interface MissionStatusUpdatePayload {
  status: MissionUpdateStatus;
}

export interface PaginatedMissions {
  items: Mission[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface MissionListParams {
  page: number;
  pageSize: 5 | 10;
  status?: MissionStatus;
}
