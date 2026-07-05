import { FormEvent, useState } from "react";

import type { MissionCreatePayload } from "../types/mission";
import { Modal } from "./Modal";

interface CreateMissionModalProps {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: MissionCreatePayload) => Promise<void>;
}

//Modal para criar uma missão
const initialForm: MissionCreatePayload = {
  name: "",
  destination: "",
  status: "planned",
};

export function CreateMissionModal({
  isSubmitting,
  onClose,
  onSubmit,
}: CreateMissionModalProps) {
  const [form, setForm] = useState<MissionCreatePayload>(initialForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      ...form,
      name: form.name.trim(),
      destination: form.destination.trim(),
    });
  }

  return (
    <Modal
      title="Criar missão"
      subtitle="Novas missões sempre começam como planned."
      onClose={onClose}
    >
      <form className="form" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input
            required
            value={form.name}
            placeholder="Apollo X"
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </label>

        <label>
          <span>Destination</span>
          <input
            required
            value={form.destination}
            placeholder="Mars"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                destination: event.target.value,
              }))
            }
          />
        </label>

        <label>
          <span>Status</span>
          <select value={form.status} disabled>
            <option value="planned">planned</option>
          </select>
        </label>

        <div className="form-actions">
          <button className="button secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar missão"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

