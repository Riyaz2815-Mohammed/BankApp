"use client";

import { Beneficiary } from "../types";

interface Props {
    beneficiaries: Beneficiary[];
    onDelete?: (id: string) => void;
}

export default function BeneficiaryList({ beneficiaries, onDelete }: Props) {
    if (beneficiaries.length === 0) return <p className="text-sm" style={{ color: "var(--muted)" }}>No beneficiaries added yet.</p>;

    return (
        <div className="space-y-3">
            <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                    <table className="w-full text-sm" style={{ backgroundColor: "var(--surface)", borderCollapse: "separate", borderSpacing: 0 }}>
                        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                            <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "#F8FAFC" }}>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Nickname</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Account Holder</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Type</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Account No</th>
                                {onDelete && <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {beneficiaries.map((b) => (
                                <tr key={b.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td className="px-5 py-3 font-medium" style={{ color: "var(--text)" }}>{b.nickname}</td>
                                    <td className="px-5 py-3" style={{ color: "var(--muted)" }}>{b.accountHolderName}</td>
                                    <td className="px-5 py-3">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{b.accountType}</span>
                                    </td>
                                    <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--muted)" }}>{b.accountNo}</td>
                                    {onDelete && (
                                        <td className="px-5 py-3">
                                            <button onClick={() => onDelete(b.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ color: "var(--danger)", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>Remove</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <span className="text-xs px-1" style={{ color: "var(--muted)" }}>{beneficiaries.length} records</span>
        </div>
    );
}
