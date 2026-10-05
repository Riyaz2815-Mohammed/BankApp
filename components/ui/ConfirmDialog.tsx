interface Props {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }: Props) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div className="card" style={{ width: "100%", maxWidth: "380px", padding: "28px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>{title}</h3>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "24px", lineHeight: 1.6 }}>{message}</p>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={onCancel} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={onConfirm} style={{ flex: 1, padding: "8px 16px", borderRadius: "8px", background: "var(--danger)", color: "#fff", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
