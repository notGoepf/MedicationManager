import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  children: React.ReactNode;
}

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusStyles = {
    'good': 'bg-green-500',
    'warning': 'bg-amber-500',
    'urgent': 'bg-red-500'
  };

  return (
    <div className="flex items-center">
      <span 
        className={cn(
          "inline-block w-3 h-3 rounded-full mr-2",
          statusStyles[status as keyof typeof statusStyles] || 'bg-gray-400'
        )} 
      />
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}
