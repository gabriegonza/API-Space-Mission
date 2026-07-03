import type { MissionStatus, MissionUpdateStatus } from "../types/mission";

export const missionStatuses: MissionStatus[] = [
  "planned",
  "launched",
  "completed",
  "failed",
];

export const missionUpdateStatuses: MissionUpdateStatus[] = [
  "launched",
  "completed",
  "failed",
];

export const statusLabels: Record<MissionStatus, string> = {
  planned: "Planned",
  launched: "Launched",
  completed: "Completed",
  failed: "Failed",
};
