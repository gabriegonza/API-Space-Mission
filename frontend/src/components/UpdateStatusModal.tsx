import { FormEvent, useMemo, useState } from "react";

import { missionUpdateStatuses, statusLabels } from "../constants/status";
import type { Mission, MissionUpdateStatus } from "../types/mission";
import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";

interface UpdateStatusModalProps {
  mission: Mission;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (status: MissionUpdateStatus) => Promise<void>;
}

export function UpdateStatusModal({
  mission,
  isSubmitting,
  onClose,
  onSubmit,
}: UpdateStatusModalProps) {
  const availableStatuses = useMemo(
    () =>
      missionUpdateStatuses.filter(
        (availableStatus) => availableStatus !== mission.status,
      ),
    [mission.status],
  );

  const [status, setStatus] = useState<MissionUpdateStatus>(
    availableStatuses[0] ?? "launched",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(status);
  }

  return (
    <Modal
      title="Atualizar status"
      subtitle={`Missão #${mission.id} - ${mission.name}`}
      onClose={onClose}
    >
      <div className="current-status">
        <span>Status atual</span>
        <StatusBadge status={mission.status} />
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          <span>Novo status</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as MissionUpdateStatus)
            }
          >
            {availableStatuses.map((availableStatus) => (
              <option key={availableStatus} value={availableStatus}>
                {statusLabels[availableStatus]}
              </option>
            ))}
          </select>
        </label>

        <div className="form-actions">
          <button className="button secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Atualizando..." : "Atualizar status"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

