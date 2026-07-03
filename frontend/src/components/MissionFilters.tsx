import { RotateCcw, Search } from "lucide-react";

import { missionStatuses, statusLabels } from "../constants/status";
import type { FilterMode, MissionStatus } from "../types/mission";

interface MissionFiltersProps {
  mode: FilterMode;
  idValue: string;
  statusValue: MissionStatus | "all";
  onModeChange: (mode: FilterMode) => void;
  onIdValueChange: (value: string) => void;
  onStatusValueChange: (value: MissionStatus | "all") => void;
  onSearch: () => void;
  onReset: () => void;
}

export function MissionFilters({
  mode,
  idValue,
  statusValue,
  onModeChange,
  onIdValueChange,
  onStatusValueChange,
  onSearch,
  onReset,
}: MissionFiltersProps) {
  return (
    <div className="toolbar" id="missions">
      <div className="filter-group">
        <label htmlFor="filter-mode">Buscar por</label>
        <select
          id="filter-mode"
          value={mode}
          onChange={(event) => onModeChange(event.target.value as FilterMode)}
        >
          <option value="status">Status</option>
          <option value="id">ID</option>
        </select>
      </div>

      {mode === "status" ? (
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={statusValue}
            onChange={(event) =>
              onStatusValueChange(event.target.value as MissionStatus | "all")
            }
          >
            <option value="all">Todos</option>
            {missionStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="filter-group grow">
          <label htmlFor="mission-id-filter">ID da missão</label>
          <input
            id="mission-id-filter"
            min="1"
            type="number"
            value={idValue}
            placeholder="Ex: 2"
            onChange={(event) => onIdValueChange(event.target.value)}
          />
        </div>
      )}

      <div className="toolbar-actions">
        <button className="button secondary" type="button" onClick={onSearch}>
          <Search size={17} aria-hidden="true" />
          <span>Buscar</span>
        </button>
        <button className="icon-button" type="button" onClick={onReset} title="Limpar busca">
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

