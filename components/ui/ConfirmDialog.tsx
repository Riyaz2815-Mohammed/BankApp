interface Props {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }: Props) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="rounded-2xl p-6 w-full max-w-sm shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>{title}</h3>
                <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-lg text-sm border"
                        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2 rounded-lg text-sm text-white font-semibold"
                        style={{ backgroundColor: "var(--danger)" }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
