import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  children: React.ReactNode;
}

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusStyles = {
    'neutral': 'bg-gray-300 border-gray-400',
    'empty': 'bg-gray-400 border-gray-500',
    'good': 'bg-green-500 border-green-600',
    'warning': 'bg-amber-500 border-amber-600',
    'urgent': 'bg-red-500 border-red-600'
  };

  const textStyles = {
    'neutral': 'text-gray-600',
    'empty': 'text-gray-700',
    'good': 'text-green-700',
    'warning': 'text-amber-700',
    'urgent': 'text-red-700'
  };

  return (
    <div 
      className={cn(
        "flex items-center px-3 py-1 rounded-full",
        status === 'neutral' ? 'bg-gray-100' : '',
        status === 'empty' ? 'bg-gray-100' : '',
        status === 'good' ? 'bg-green-50' : '',
        status === 'warning' ? 'bg-amber-50' : '',
        status === 'urgent' ? 'bg-red-50' : '',
      )}
    >
      <span 
        className={cn(
          "inline-block w-2.5 h-2.5 rounded-full mr-2 border",
          statusStyles[status as keyof typeof statusStyles] || 'bg-gray-400 border-gray-500'
        )} 
      />
      <span 
        className={cn(
          "text-xs font-semibold",
          textStyles[status as keyof typeof textStyles] || 'text-gray-700'
        )}
      >
        {children}
      </span>
    </div>
  );
}
