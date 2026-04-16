import { Link } from 'react-router-dom';
import { MapPin, Clock, Laptop, Briefcase, Key, CreditCard, Shirt, Book, Box } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Item, ItemCategory } from '../lib/mockData';
import { StatusBadge } from './Badge';
import { cn } from '../lib/utils';

const categoryConfig: Record<ItemCategory, { icon: any, color: string, bg: string }> = {
  'Electronics': { icon: Laptop, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Bags': { icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-100' },
  'Keys': { icon: Key, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  'ID Cards': { icon: CreditCard, color: 'text-red-600', bg: 'bg-red-100' },
  'Clothing': { icon: Shirt, color: 'text-pink-600', bg: 'bg-pink-100' },
  'Books': { icon: Book, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  'Others': { icon: Box, color: 'text-slate-600', bg: 'bg-slate-100' },
};

export function ItemCard({ item, matchScore }: { item: Item; matchScore?: number }) {
  if (!item) return null;
  const config = categoryConfig[item.category] || categoryConfig['Others'];
  const Icon = config.icon;

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full",
      item.type === 'Lost' ? "border-l-4 border-l-red-500" : "border-l-4 border-l-green-500"
    )}>
      {item.imageUrl && (
        <div className="h-48 w-full overflow-hidden bg-slate-100 relative group">
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3">
            <StatusBadge status={item.status} />
          </div>
        </div>
      )}
      <div className="p-5 flex flex-col flex-grow">
        {!item.imageUrl && (
          <div className="flex justify-end mb-2">
            <StatusBadge status={item.status} />
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", config.bg, config.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.title}</h3>
            <p className="text-xs font-medium text-slate-500">{item.category}</p>
          </div>
        </div>
        
        <div className="space-y-2 mb-5 flex-grow">
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Clock className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
            <span>{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</span>
          </div>
        </div>

        {matchScore !== undefined && (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-slate-700">Match Score</span>
              <span className="text-xs font-bold text-green-600">{matchScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${matchScore}%` }}
              />
            </div>
          </div>
        )}
        
        <Link 
          to={`/item/${item.id}`}
          className="mt-auto w-full inline-flex justify-center items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:text-green-600 hover:border-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
