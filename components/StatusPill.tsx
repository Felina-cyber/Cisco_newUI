'use client';
import clsx from 'clsx';

export default function StatusPill({ status }: { status: string }) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold';
      case 'in progress':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold';
      case 'closed':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold';
      case 'escalated':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold';
    }
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm',
      getStatusStyles(status)
    )}>
      {status}
    </span>
  );
}
