import { cn } from "../lib/util";

export default function Badge({ children, color, className }) {
    const bgcolor = (status) =>
    ({
        'gray': "bg-gray-100",
        'red': "bg-red-100",
        'green': "bg-green-100",
        'orange': "bg-orange-100",
        'yellow': "bg-yellow-100",
    }[status] || "bg-gray-100");

    return (
        <span className={cn(
            "text-xs font-semibold px-6pxr py-2pxr rounded-md",
            bgcolor(color),
            className
        )}>{children}
        </span>
    )
}