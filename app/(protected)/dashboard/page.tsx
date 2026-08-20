export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Dashboard</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Overview of your banking activity</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Balance", value: "—", color: "var(--primary)" },
                    { label: "Accounts", value: "—", color: "var(--success)" },
                    { label: "Transactions", value: "—", color: "#F59E0B" },
                    { label: "Beneficiaries", value: "—", color: "#8B5CF6" },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>{stat.label}</p>
                        <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
