import { useState, useEffect } from 'react';
import { Activity as ActivityIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ActivityType } from '../lib/mockData';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

const typeColors: Record<ActivityType, string> = {
  lost: 'bg-red-500',
  found: 'bg-green-500',
  match: 'bg-amber-500',
  recovery: 'bg-blue-500',
  new_report: 'bg-purple-500'
};

export function Sidebar() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (!error && data) {
        setActivities(data.map(d => ({
          id: d.id,
          text: d.text,
          timestamp: d.created_at,
          type: d.event_type as ActivityType
        })));
      }
    };

    fetchActivities();

    const channel = supabase.channel('public:activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity' },
        (payload) => {
          const newAct = payload.new;
          setActivities(prev => {
            const updated = [{
              id: newAct.id,
              text: newAct.text,
              timestamp: newAct.created_at,
              type: newAct.event_type as ActivityType
            }, ...prev];
            return updated.slice(0, 8);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-24 flex flex-col max-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">Activity Feed</h2>
        </div>
        
        {/* LIVE Badge */}
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </div>
          <span className="text-[10px] font-bold text-slate-600 tracking-wider">LIVE</span>
        </div>
      </div>
      
      <div className="relative flex-grow overflow-y-auto pr-2 scrollbar-hide">
        <div className="absolute inset-y-0 left-[11px] w-0.5 bg-gradient-to-b from-slate-200 via-slate-200 to-transparent z-0" />
        
        <div className="space-y-4 relative z-10">
          <AnimatePresence initial={false}>
            {activities.map((activity) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                className="relative flex items-start gap-4 group"
              >
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full border-4 border-white shadow-sm shrink-0 mt-0.5 z-10 transition-transform group-hover:scale-110",
                  typeColors[activity.type]
                )} />
                <div className="flex-1 p-3 rounded-lg border border-slate-100 bg-slate-50 shadow-sm transition-colors group-hover:bg-white group-hover:border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <time className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Just now'}
                    </time>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-snug">{activity.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
