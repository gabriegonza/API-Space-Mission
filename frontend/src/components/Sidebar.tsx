import { Gauge, Satellite } from "lucide-react";

import { N8N_URL } from "../config";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">
          <img src="/favicon.png" alt="" className="brand-image" />
        </span>
        <span className="brand-text">Sala de Controle</span>
      </div>

      <nav className="nav-list" aria-label="Navegacao principal">
        <a className="nav-item active" href="#missions" title="Missoes">
          <Gauge size={20} aria-hidden="true" />
          <span>Missões</span>
        </a>
        <a
          className="nav-item"
          href={N8N_URL}
          rel="noreferrer"
          target="_blank"
          title="Abrir automacao no n8n"
        >
          <Satellite size={20} aria-hidden="true" />
          <span>Automação</span>
        </a>
      </nav>
    </aside>
  );
}
