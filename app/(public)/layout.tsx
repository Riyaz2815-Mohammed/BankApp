export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
            {children}
        </div>
    );
}
