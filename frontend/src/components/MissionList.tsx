import { Pencil } from "lucide-react";

import type { Mission } from "../types/mission";
import { StatusBadge } from "./StatusBadge";

interface MissionListProps {
  missions: Mission[];
  loading: boolean;
  onUpdateClick: (mission: Mission) => void;
}

const finalStatuses = ["completed", "failed"];

export function MissionList({
  missions,
  loading,
  onUpdateClick,
}: MissionListProps) {
  if (loading) {
    return <div className="state-box">Carregando missões...</div>;
  }

  if (missions.length === 0) {
    return <div className="state-box">Nenhuma missão encontrada.</div>;
  }

  return (
    <div className="mission-list" aria-label="Lista de missões">
      <div className="list-header">
        <span>ID</span>
        <span>Nome</span>
        <span>Destino</span>
        <span>Status</span>
        <span>Ações</span>
      </div>

      {missions.map((mission) => {
        const isFinalStatus = finalStatuses.includes(mission.status);

        return (
          <article className="mission-row" key={mission.id}>
            <span className="cell id-cell" data-label="ID">
              #{mission.id}
            </span>
            <span className="cell" data-label="Nome">
              {mission.name}
            </span>
            <span className="cell muted" data-label="Destino">
              {mission.destination}
            </span>
            <span className="cell" data-label="Status">
              <StatusBadge status={mission.status} />
            </span>
            <span className="cell action-cell" data-label="Ações">
              <button
                className="button compact"
                type="button"
                disabled={isFinalStatus}
                onClick={() => onUpdateClick(mission)}
                title={
                  isFinalStatus
                    ? "Missões completed ou failed não podem mudar de status"
                    : "Atualizar status"
                }
              >
                <Pencil size={16} aria-hidden="true" />
                <span>Atualizar</span>
              </button>
            </span>
          </article>
        );
      })}
    </div>
  );
}

