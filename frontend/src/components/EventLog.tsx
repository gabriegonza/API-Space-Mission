import { Activity } from "lucide-react";

import type { MissionEvent } from "../types/mission";
import { StatusBadge } from "./StatusBadge";

interface EventLogProps {
  events: MissionEvent[];
  loading: boolean;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

export function EventLog({ events, loading }: EventLogProps) {
  return (
    <section className="event-log" id="events" aria-label="Registro de eventos">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Eventos</span>
          <h2>Registro operacional</h2>
        </div>
        <span className="event-count">{events.length}</span>
      </div>

      {loading ? (
        <div className="state-box">Carregando eventos...</div>
      ) : events.length === 0 ? (
        <div className="state-box">Nenhum evento registrado.</div>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <article className="event-row" key={event.id}>
              <span className="event-icon">
                <Activity size={18} aria-hidden="true" />
              </span>
              <div className="event-main">
                <strong>{event.event_type}</strong>
                <span>
                  #{event.mission_id} {event.mission_name} para {event.destination}
                </span>
              </div>
              <StatusBadge status={event.status} />
              <time dateTime={event.registered_at}>
                {formatDateTime(event.registered_at)}
              </time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
