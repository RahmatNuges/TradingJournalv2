"use client";

import { formatCurrency } from "@/lib/calculations";

interface CalendarHeatmapProps {
    data: Array<{ date: string; pnl: number }>;
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
    // Get current month dates
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create map of date -> pnl
    const pnlByDate: Record<string, number> = {};
    data.forEach(d => {
        pnlByDate[d.date] = d.pnl;
    });

    // Generate calendar days
    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
            day: i,
            date: dateStr,
            pnl: pnlByDate[dateStr] || null,
        });
    }

    // Calm colors: teal green for profit, coral red for loss
    const getColorClass = (pnl: number | null) => {
        if (pnl === null) return "bg-secondary/30";
        if (pnl > 100) return "bg-profit";
        if (pnl > 0) return "bg-profit-muted";
        if (pnl === 0) return "bg-secondary";
        if (pnl > -100) return "bg-loss-muted";
        return "bg-loss";
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    return (
        <div>
            <div className="text-center mb-4 font-medium">
                {monthNames[month]} {year}
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                    <div
                        key={index}
                        className={`aspect-square flex items-center justify-center rounded text-xs font-mono ${day ? getColorClass(day.pnl) : ""
                            } ${day && day.pnl !== null ? 'cursor-pointer' : ''}`}
                        title={day && day.pnl !== null ? `${day.date}: ${formatCurrency(day.pnl)}` : undefined}
                    >
                        {day ? day.day : ""}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <span>Loss</span>
                <div className="w-4 h-4 bg-loss rounded"></div>
                <div className="w-4 h-4 bg-loss-muted rounded"></div>
                <div className="w-4 h-4 bg-secondary/30 rounded"></div>
                <div className="w-4 h-4 bg-profit-muted rounded"></div>
                <div className="w-4 h-4 bg-profit rounded"></div>
                <span>Profit</span>
            </div>
        </div>
    );
}

