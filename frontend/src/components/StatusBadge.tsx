import { statusLabels } from "../constants/status";
import type { MissionStatus } from "../types/mission";

interface StatusBadgeProps {
  status: MissionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge ${status}`}>{statusLabels[status]}</span>;
}
