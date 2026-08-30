import { Beneficiary } from "../types";

interface Props {
    beneficiaries: Beneficiary[];
    onDelete?: (id: string) => void;
}

export default function BeneficiaryList({ beneficiaries, onDelete }: Props) {
    if (beneficiaries.length === 0) {
        return <p className="text-sm" style={{ color: "var(--muted)" }}>No beneficiaries added yet.</p>;
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {beneficiaries.map((b) => (
                <div key={b.id} className="rounded-xl p-5 shadow-sm flex items-center justify-between" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div>
                        <p className="font-semibold" style={{ color: "var(--text)" }}>{b.nickname}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Account: {b.beneficiaryAccountId}</p>
                    </div>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(b.id)}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                            style={{ color: "var(--danger)", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
                        >
                            Remove
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
