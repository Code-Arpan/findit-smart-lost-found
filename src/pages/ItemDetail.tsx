import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Calendar, User, Mail, ArrowLeft, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Item } from '../lib/mockData';
import { StatusBadge, CategoryBadge } from '../components/Badge';
import { ItemCard } from '../components/ItemCard';
import { supabase } from '../lib/supabase';

export function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestedMatches, setSuggestedMatches] = useState<Item[]>([]);
  
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isClaimSubmitted, setIsClaimSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [claimData, setClaimData] = useState({
    name: '',
    email: '',
    proof: ''
  });

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const mappedItem: Item = {
            id: data.id,
            type: data.type === 'lost' ? 'Lost' : data.type === 'found' ? 'Found' : data.type,
            title: data.title,
            category: data.category,
            description: data.description,
            location: data.location,
            date: data.date_occurred,
            status: data.status === 'active' ? 'Active' : data.status === 'claimed' ? 'Claimed' : data.status === 'resolved' ? 'Resolved' : data.status,
            reporterName: data.contact_name,
            reporterEmail: data.contact_email,
            currentLocation: data.current_location,
            imageUrl: data.image_url
          };
          setItem(mappedItem);

          // Fetch suggested matches
          const { data: matchesData } = await supabase
            .from('items')
            .select('*')
            .eq('category', data.category)
            .neq('type', data.type)
            .neq('id', data.id)
            .limit(3);

          if (matchesData) {
            setSuggestedMatches(matchesData.map(d => ({
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
            })));
          }
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    
    setIsSubmitting(true);
    try {
      // Insert claim
      const { error: claimError } = await supabase.from('claims').insert({
        item_id: item.id,
        claimer_name: claimData.name,
        claimer_email: claimData.email,
        secret_detail: claimData.proof
      });

      if (claimError) throw claimError;

      // Update item status
      const { error: updateError } = await supabase
        .from('items')
        .update({ status: 'claimed' })
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Insert activity
      await supabase.from('activity').insert({
        event_type: 'recovery',
        text: `${claimData.name} claimed ${item.title}`,
      });

      setItem(prev => prev ? { ...prev, status: 'Claimed' } : null);
      setIsClaimSubmitted(true);
      
      setTimeout(() => {
        setIsClaimModalOpen(false);
        setIsClaimSubmitted(false);
        setClaimData({ name: '', email: '', proof: '' });
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900">Item not found</h2>
        <Link to="/" className="mt-4 text-green-600 hover:underline inline-block">Return to Feed</Link>
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
      <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Feed
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {item.imageUrl && (
            <div className="md:w-2/5 h-64 md:h-auto bg-slate-100">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <CategoryBadge category={item.category} />
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                  {item.type}
                </span>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{item.title}</h1>
            
            <p className="text-slate-700 mb-6 whitespace-pre-wrap">{item.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-8">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-slate-400 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Location {item.type === 'Lost' ? 'Lost' : 'Found'}</p>
                  <p className="text-sm text-slate-600">{item.location}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-slate-400 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Date {item.type === 'Lost' ? 'Lost' : 'Found'}</p>
                  <p className="text-sm text-slate-600">{format(new Date(item.date), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              {item.currentLocation && (
                <div className="flex items-start sm:col-span-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Current Location</p>
                    <p className="text-sm text-slate-600">{item.currentLocation}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Reported by {item.reporterName}</p>
                  <p className="text-xs text-slate-500 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {item.reporterEmail}
                  </p>
                </div>
              </div>

              {item.type === 'Found' && item.status !== 'Claimed' && item.status !== 'Resolved' && (
                <button
                  onClick={() => setIsClaimModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Claim This Item
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {suggestedMatches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Suggested Matches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedMatches.map(match => {
              const score = 70 + ((parseInt(match.id) * 7) % 30);
              return <ItemCard key={match.id} item={match} matchScore={score} />;
            })}
          </div>
        </div>
      )}

      {/* Claim Modal */}
      <AnimatePresence>
        {isClaimModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isClaimSubmitted && setIsClaimModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden z-10"
            >
              {isClaimSubmitted ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Claim Request Sent</h3>
                  <p className="text-slate-600 text-sm">
                    The reporter has been notified. They will review your details and contact you shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Claim Item</h3>
                    <button 
                      onClick={() => setIsClaimModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleClaimSubmit} className="p-5 space-y-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">Your Name</label>
                      <input 
                        required 
                        type="text" 
                        value={claimData.name}
                        onChange={e => setClaimData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">Your Email</label>
                      <input 
                        required 
                        type="email" 
                        value={claimData.email}
                        onChange={e => setClaimData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">Proof of Ownership</label>
                      <p className="text-xs text-slate-500 mb-2">Describe a unique detail about this item that only the owner would know (e.g. a specific scratch, contents, serial number).</p>
                      <textarea 
                        required 
                        rows={3} 
                        value={claimData.proof}
                        onChange={e => setClaimData(prev => ({ ...prev, proof: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70"
                      >
                        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Claim Request'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
