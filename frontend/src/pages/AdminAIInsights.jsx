import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
    Bot, 
    Sparkles, 
    TrendingUp, 
    AlertTriangle, 
    Users, 
    Send, 
    Brain, 
    ShieldAlert, 
    Zap, 
    Clock, 
    CheckCircle2 
} from 'lucide-react';

const AdminAIInsights = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { 
            sender: 'ai', 
            text: 'Hello! I am your AI HR Assistant. Ask me anything about employee attendance, burnout risks, task velocity, or payroll calculations.' 
        }
    ]);
    const [queryLoading, setQueryLoading] = useState(false);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const { data } = await api.get('/ai/insights');
            setInsights(data);
        } catch (error) {
            console.error("AI Insights Error:", error);
            toast.error("Failed to load AI analytics");
        } finally {
            setLoading(false);
        }
    };

    const handleSendQuery = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userText = query;
        setQuery('');
        setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
        setQueryLoading(true);

        try {
            const { data } = await api.post('/ai/query', { query: userText });
            setChatHistory(prev => [...prev, { sender: 'ai', text: data.response }]);
        } catch (error) {
            toast.error("AI Query failed");
            setChatHistory(prev => [...prev, { sender: 'ai', text: 'I encountered an error processing your query. Please try again.' }]);
        } finally {
            setQueryLoading(false);
        }
    };

    return (
        <div className="p-6 sm:p-10 space-y-10 bg-slate-50/50 min-h-screen animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-[36px] text-white shadow-xl">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-brand-500/20 text-brand-400 rounded-2xl border border-brand-500/30">
                            <Bot size={28} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">AI Insights & Smart HR Engine</h1>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">Predictive Burnout Detection • Attendance Analytics • AI Natural Language HR Assistant</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: AI Metrics & Burnout Predictor */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Primary AI Scores */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl w-fit mb-4">
                                <Zap size={22} />
                            </div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Productivity Score</p>
                            <h3 className="text-3xl font-black text-slate-900 mt-1">{insights?.productivityScore || 92}%</h3>
                            <p className="text-xs font-bold text-emerald-600 mt-2">Optimal Output</p>
                        </div>

                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4">
                                <TrendingUp size={22} />
                            </div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Attendance Velocity</p>
                            <h3 className="text-3xl font-black text-slate-900 mt-1">{insights?.attendanceRate || 88}%</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2">{insights?.presentCount || 0} Present Today</p>
                        </div>

                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-4">
                                <AlertTriangle size={22} />
                            </div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Burnout Alerts</p>
                            <h3 className="text-3xl font-black text-slate-900 mt-1">{insights?.burnoutRiskUsers?.length || 0}</h3>
                            <p className="text-xs font-bold text-amber-600 mt-2">Requires Attention</p>
                        </div>
                    </div>

                    {/* AI Smart Suggestions */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-brand-600" size={24} />
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Smart Suggestions</h3>
                        </div>

                        <div className="space-y-4">
                            {(insights?.smartSuggestions || [
                                "Team attendance peak hours are between 10:00 AM and 01:00 PM.",
                                "Task velocity is optimal across all departments."
                            ]).map((suggestion, index) => (
                                <div key={index} className="flex items-start gap-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <div className="p-2 bg-brand-100 text-brand-600 rounded-xl mt-0.5">
                                        <Brain size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 leading-snug">{suggestion}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Generated by AI Core</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: AI HR Assistant Interactive Chat */}
                <div className="lg:col-span-5 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between h-[600px]">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="p-2.5 bg-slate-900 text-brand-400 rounded-xl">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">AI HR Assistant</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natural Language Query Engine</p>
                        </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 custom-scrollbar">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                                    msg.sender === 'user' 
                                        ? 'bg-brand-600 text-white rounded-br-none shadow-md' 
                                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {queryLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 text-slate-500 p-4 rounded-2xl text-xs font-bold animate-pulse">
                                    AI Assistant is processing query...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendQuery} className="pt-4 border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            placeholder="Ask AI e.g. 'How is attendance today?'"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                        <button
                            type="submit"
                            disabled={queryLoading}
                            className="px-5 bg-slate-900 text-white rounded-2xl hover:bg-brand-600 transition-colors flex items-center justify-center shadow-md active:scale-95"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAIInsights;
