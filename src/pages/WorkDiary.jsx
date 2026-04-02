import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Clock, MousePointer2, Keyboard, ExternalLink, ChevronLeft, ChevronRight, Layout } from 'lucide-react';

const WorkDiary = () => {
    const { id } = useParams();
    const [screenshots, setScreenshots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchScreenshots();
    }, [id, selectedDate]);

    const fetchScreenshots = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/screenshots?userId=${id}&date=${selectedDate}`);
            setScreenshots(res.data);
        } catch (err) {
            console.error('Fetch screenshots failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 pt-0 animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-10 py-6 border-b border-slate-100">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Work Diary</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Review activity snapshots and productivity</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-xl text-brand-600 font-black text-sm">
                        <Calendar size={16} />
                        {selectedDate}
                    </div>
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight size={20} /></button>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                </div>
            ) : screenshots.length === 0 ? (
                <div className="bg-white p-20 rounded-[40px] text-center shadow-sm border border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Layout className="text-slate-200" size={32} />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No activity found for this date</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {screenshots.map((shot, i) => (
                        <div key={i} className="group bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                            <div className="relative aspect-video overflow-hidden bg-slate-100">
                                <img src={shot.imageUrl.startsWith('http') ? shot.imageUrl : `${import.meta.env.VITE_API_URL}${shot.imageUrl}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <button
                                        onClick={() => window.open(shot.imageUrl.startsWith('http') ? shot.imageUrl : `${import.meta.env.VITE_API_URL}${shot.imageUrl}`, '_blank')}
                                        className="w-full py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink size={14} /> Full View
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-900/40 backdrop-blur-md rounded-xl text-white text-[10px] font-black tracking-widest flex items-center gap-2">
                                    <Clock size={12} />
                                    {new Date(shot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-white text-[10px] font-black tracking-widest flex items-center gap-1.5 ${shot.status === 'Idle' ? 'bg-amber-500/80 shadow-lg shadow-amber-500/20' : 'bg-emerald-500/80 shadow-lg shadow-emerald-500/20'
                                    }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                    {shot.status || 'Active'}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Activity Score</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full transition-all duration-1000 ${shot.activityPercentage > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${shot.activityPercentage || 0}%` }}></div>
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{shot.activityPercentage || 0}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Layout size={12} /> Target Focus
                                    </p>
                                    <p className="text-sm font-bold text-slate-800 truncate" title={shot.activeApp}>{shot.activeApp || 'Operating System'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkDiary;
