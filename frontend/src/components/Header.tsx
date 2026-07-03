import { Plus, Radar } from "lucide-react";

interface HeaderProps {
  onCreateClick: () => void;
  totalMissions: number;
}

export function Header({ onCreateClick, totalMissions }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <span className="eyebrow">API de Missões Espaciais</span>
        <h1>Gerenciamento de missões</h1>
      </div>

      <div className="header-actions">
        <div className="metric" aria-label={`${totalMissions} missões`}>
          <Radar size={18} aria-hidden="true" />
          <span>{totalMissions}</span>
        </div>
        <button className="button primary" type="button" onClick={onCreateClick}>
          <Plus size={18} aria-hidden="true" />
          <span>Criar missão</span>
        </button>
      </div>
    </header>
  );
}

