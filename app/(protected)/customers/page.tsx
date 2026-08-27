"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/modules/customers/api";
import { Customer, CustomerRequest } from "@/modules/customers/types";
import CustomerRow from "@/modules/customers/components/CustomerRow";

const emptyForm: CustomerRequest = { pan: "", firstName: "", lastName: "", email: "", phoneNumber: "" };

export default function CustomersPage() {
    const { data: session } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Customer | null>(null);
    const [form, setForm] = useState<CustomerRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        getCustomers()
            .then(setCustomers)
            .catch(() => setError("Failed to load customers"))
            .finally(() => setLoading(false));
    }, []);
    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
    };
    const openEdit = (c: Customer) => {
        setEditing(c);
        setForm({ pan: c.pan, firstName: c.firstName, lastName: c.lastName, email: c.email, phoneNumber: c.phoneNumber });
        setShowModal(true);
    };
    const handleSave = () => {
        setSaving(true);
        const action = editing ? updateCustomer(editing.id, form) : createCustomer(form);
        action
            .then((saved) => {
                setCustomers((prev) => editing ? prev.map((c) => c.id === editing.id ? saved : c) : [...prev, saved]);
                setShowModal(false);
            })
            .catch(() => setError("Failed to save customer"))
            .finally(() => setSaving(false));
    };
    const handleDelete = (id: string) => {
        deleteCustomer(id)
            .then(() => setCustomers((prev) => prev.filter((c) => c.id !== id)))
            .catch(() => setError("Failed to delete customer"));
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Customers</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Manage all bank customers</p>
                </div>
                <button onClick={openCreate} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: "var(--primary)" }}>+ New Customer</button>
            </div>
            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            {!loading && customers.length > 0 && (
                <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
                    <table className="w-full text-sm" style={{ backgroundColor: "var(--surface)" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "#F8FAFC" }}>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Name</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>PAN</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Email</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Phone</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c) => (
                                <CustomerRow key={c.id} customer={c} isAdmin={isAdmin} onEdit={openEdit} onDelete={handleDelete} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!loading && customers.length === 0 && !error && (
                <p className="text-sm" style={{ color: "var(--muted)" }}>No customers found.</p>
            )}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>{editing ? "Edit Customer" : "New Customer"}</h3>
                        <div className="space-y-3">
                            <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                            <input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                            <input placeholder="PAN (10 chars)" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                            <input placeholder="Phone (10 digits)" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg text-sm text-white font-semibold" style={{ backgroundColor: "var(--primary)" }}>{saving ? "Saving..." : "Save"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
