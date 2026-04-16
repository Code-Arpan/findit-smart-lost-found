import { cn } from '../lib/utils';
import { ItemStatus, ItemCategory } from '../lib/mockData';

export function StatusBadge({ status }: { status: ItemStatus }) {
  const styles = {
    'Active': 'bg-blue-100 text-blue-800 border-blue-200',
    'Match Found': 'bg-amber-100 text-amber-800 border-amber-200',
    'Claimed': 'bg-purple-100 text-purple-800 border-purple-200',
    'Resolved': 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", styles[status])}>
      {status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: ItemCategory }) {
  const styles = {
    'Electronics': 'bg-slate-100 text-slate-800',
    'Bags': 'bg-orange-100 text-orange-800',
    'Keys': 'bg-yellow-100 text-yellow-800',
    'ID Cards': 'bg-red-100 text-red-800',
    'Clothing': 'bg-pink-100 text-pink-800',
    'Books': 'bg-indigo-100 text-indigo-800',
    'Others': 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", styles[category])}>
      {category}
    </span>
  );
}
