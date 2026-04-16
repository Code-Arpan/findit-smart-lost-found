import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, CheckCircle, PackageSearch, TrendingUp, Loader2 } from 'lucide-react';
import { Item } from '../lib/mockData';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mappedItems: Item[] = data.map(d => ({
            id: d.id,
            type: d.type === 'lost' ? 'Lost' : d.type === 'found' ? 'Found' : d.type,
            title: d.title,
            category: d.category,
            description: d.description,
            location: d.location,
            date: d.date_occurred,
            status: d.status === 'active' ? 'Active' : d.status === 'claimed' ? 'Claimed' : d.status === 'resolved' ? 'Resolved' : d.status,
            reporterName: d.contact_name,
            reporterEmail: d.contact_email,
            currentLocation: d.current_location,
            imageUrl: d.image_url
          }));
          setItems(mappedItems);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const totalLost = items.filter(i => i && i.type === 'Lost').length;
  const totalFound = items.filter(i => i && i.type === 'Found').length;
  const resolved = items.filter(i => i && (i.status === 'Resolved' || i.status === 'Claimed')).length;
  const recoveryRate = totalLost > 0 ? Math.round((resolved / totalLost) * 100) : 0;

  const stats = [
    { name: 'Total Lost Items', value: totalLost, icon: Search, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Found Items', value: totalFound, icon: PackageSearch, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Items Resolved', value: resolved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Recovery Rate', value: `${recoveryRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Campus Stats</h1>
        <p className="mt-2 text-slate-600">Overview of lost and found activity on campus.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Resolutions</h2>
        <div className="space-y-4">
          {items.filter(i => i && (i.status === 'Resolved' || i.status === 'Claimed')).map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">Returned to owner</p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500">{new Date(item.date).toLocaleDateString()}</span>
            </div>
          ))}
          {items.filter(i => i && (i.status === 'Resolved' || i.status === 'Claimed')).length === 0 && (
             <p className="text-sm text-slate-500 text-center py-4">No recent resolutions to show.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
