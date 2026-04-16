import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, CheckCircle2, X, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { ItemCategory } from '../lib/mockData';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const CATEGORIES: ItemCategory[] = ['Electronics', 'Bags', 'Keys', 'ID Cards', 'Clothing', 'Books', 'Others'];
const LOCATIONS = [
  'Main Gate', 'Library', 'Cafeteria', 'Hostel Block A', 'Hostel Block B', 
  'Lecture Hall Complex', 'Sports Ground', 'Admin Block', 'Parking Lot', 'Lab Building'
];

export function ReportItem() {
  const location = useLocation();
  const navigate = useNavigate();
  const isFound = location.pathname.includes('found');
  
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    date: '',
    location: '',
    currentLocation: '',
    description: '',
    reporterName: '',
    reporterEmail: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = null;
      
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filePath, selectedFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from('items').insert({
        type: isFound ? 'found' : 'lost',
        title: formData.itemName,
        category: formData.category,
        date_occurred: formData.date,
        location: formData.location,
        current_location: formData.currentLocation || null,
        description: formData.description,
        contact_name: formData.reporterName,
        contact_email: formData.reporterEmail,
        image_url: imageUrl,
        status: 'active',
        match_ids: []
      });

      if (insertError) throw insertError;

      const { error: activityError } = await supabase.from('activity').insert({
        event_type: 'new_report',
        text: `${formData.reporterName} reported a ${isFound ? 'found' : 'lost'} ${formData.itemName}`,
      });

      if (activityError) {
        console.error('Failed to log activity:', activityError);
      }

      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16A34A', '#22C55E', '#4ADE80', '#10B981']
      });

      setIsSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 4000);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag and drop handlers
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file: File | undefined) => {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-2xl mx-auto mt-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Report Submitted!</h2>
        <p className="text-slate-600 text-lg">Thank you for helping keep our campus safe. Redirecting to home...</p>
      </motion.div>
    );
  }

  const steps = [
    { num: 1, title: 'Item Details' },
    { num: 2, title: 'Contact Info' },
    { num: 3, title: 'Confirm' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Report {isFound ? 'Found' : 'Lost'} Item
        </h1>
        <p className="text-slate-600 mb-8">
          {isFound 
            ? "Found something? Let's help get it back to its owner." 
            : "Lost something? Provide details so others can help you find it."}
        </p>

        {/* Step Indicator */}
        <div className="relative px-4 sm:px-12">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full z-0 transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          
          <div className="relative z-10 flex justify-between">
            {steps.map(s => (
              <div key={s.num} className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2 bg-white",
                  step >= s.num ? "border-green-500 text-green-600" : "border-slate-300 text-slate-400",
                  step > s.num && "bg-green-500 text-white"
                )}>
                  {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
                </div>
                <span className={cn(
                  "absolute top-12 text-xs font-medium whitespace-nowrap",
                  step >= s.num ? "text-slate-900" : "text-slate-400"
                )}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleNextStep} 
              className="space-y-6"
            >
              <datalist id="campus-locations">
                {LOCATIONS.map(loc => <option key={loc} value={loc} />)}
              </datalist>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Item Name <span className="text-red-500">*</span></label>
                  <input name="itemName" value={formData.itemName} onChange={handleInputChange} required type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="e.g. Blue Nike Backpack" />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Date {isFound ? 'Found' : 'Lost'} <span className="text-red-500">*</span></label>
                  <input name="date" value={formData.date} onChange={handleInputChange} required type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Location {isFound ? 'Found' : 'Lost'} <span className="text-red-500">*</span></label>
                  <input name="location" value={formData.location} onChange={handleInputChange} list="campus-locations" required type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="e.g. Library 2nd Floor" />
                </div>

                {isFound && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Where is the item currently? <span className="text-red-500">*</span></label>
                    <input name="currentLocation" value={formData.currentLocation} onChange={handleInputChange} required type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="e.g. Handed to Student Union Desk" />
                  </div>
                )}

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                    rows={4} 
                    maxLength={500}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" 
                    placeholder="Provide any identifying details, color, brand, etc." 
                  />
                  <div className="text-right text-xs text-slate-500 font-medium">
                    {formData.description.length} / 500
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Upload Photo (Optional)</label>
                  
                  {!imagePreview ? (
                    <div 
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all cursor-pointer",
                        isDragging ? "border-green-500 bg-green-50" : "border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                      )}
                    >
                      <div className="space-y-1 text-center">
                        <Upload className={cn("mx-auto h-10 w-10 mb-3 transition-colors", isDragging ? "text-green-500" : "text-slate-400")} />
                        <div className="flex text-sm text-slate-600 justify-center">
                          <span className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500">
                            <span>Upload a file</span>
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              className="sr-only" 
                              accept="image/*" 
                              onChange={handleFileSelect}
                            />
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-200 inline-block group">
                      <img src={imagePreview} alt="Preview" className="h-48 w-auto object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(); }}
                          className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors shadow-sm flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleNextStep} 
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Your Name <span className="text-red-500">*</span></label>
                  <input name="reporterName" value={formData.reporterName} onChange={handleInputChange} required type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Your Email <span className="text-red-500">*</span></label>
                  <input name="reporterEmail" value={formData.reporterEmail} onChange={handleInputChange} required type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button type="button" onClick={handlePrevStep} className="flex items-center py-2.5 px-6 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <button type="submit" className="flex items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Review Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Item Name</dt>
                    <dd className="mt-1 text-sm text-slate-900 font-medium">{formData.itemName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Category</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formData.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Location {isFound ? 'Found' : 'Lost'}</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formData.location}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Date {isFound ? 'Found' : 'Lost'}</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formData.date}</dd>
                  </div>
                  {isFound && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-slate-500">Current Location</dt>
                      <dd className="mt-1 text-sm text-slate-900">{formData.currentLocation}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-slate-500">Description</dt>
                    <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{formData.description}</dd>
                  </div>
                  <div className="sm:col-span-2 border-t border-slate-200 pt-4 mt-2">
                    <dt className="text-sm font-medium text-slate-500">Contact Info</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formData.reporterName} ({formData.reporterEmail})</dd>
                  </div>
                  {imagePreview && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-slate-500 mb-2">Attached Photo</dt>
                      <dd>
                        <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded-lg border border-slate-200 object-cover" />
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="pt-4 flex justify-between">
                <button type="button" onClick={handlePrevStep} className="flex items-center py-2.5 px-6 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Submit Report</>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
