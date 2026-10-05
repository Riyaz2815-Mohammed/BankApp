import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Navbar />
                <main style={{ flex: 1, padding: "32px 36px", backgroundColor: "var(--bg)" }}>
                    <div style={{ maxWidth: "1100px" }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
