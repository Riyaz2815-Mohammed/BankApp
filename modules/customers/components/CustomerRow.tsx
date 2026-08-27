import { Customer } from "../types";

interface Props {
    customer: Customer;
    isAdmin: boolean;
    onEdit: (customer: Customer) => void;
    onDelete: (id: string) => void;
}

export default function CustomerRow({ customer, isAdmin, onEdit, onDelete }: Props) {
    return (
        <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td className="px-5 py-3 font-medium" style={{ color: "var(--text)" }}>{customer.firstName} {customer.lastName}</td>
            <td className="px-5 py-3 text-xs" style={{ color: "var(--muted)" }}>{customer.pan}</td>
            <td className="px-5 py-3 text-xs" style={{ color: "var(--muted)" }}>{customer.email}</td>
            <td className="px-5 py-3 text-xs" style={{ color: "var(--muted)" }}>{customer.phoneNumber}</td>
            <td className="px-5 py-3">
                <div className="flex gap-2">
                    <button onClick={() => onEdit(customer)} className="px-3 py-1 rounded-lg text-xs font-medium border" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Edit</button>
                    {isAdmin && (
                        <button onClick={() => onDelete(customer.id)} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ color: "var(--danger)", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>Delete</button>
                    )}
                </div>
            </td>
        </tr>
    );
}
