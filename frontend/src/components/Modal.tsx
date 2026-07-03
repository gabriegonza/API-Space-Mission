import type { ReactNode } from "react";

import { X } from "lucide-react";

interface ModalProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function Modal({ children, title, subtitle, onClose }: ModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button className="icon-button" type="button" onClick={onClose} title="Fechar">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
