export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-4 p-4 animate-pulse">
            <div className="h-32 bg-muted rounded-2xl w-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96 bg-muted rounded-xl" />
                <div className="h-96 bg-muted rounded-xl" />
            </div>
        </div>
    );
}
