import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api/tickets/";

function App() {
  // --- STATES ---
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'low'
  });
  
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // --- API CALLS ---
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}stats/`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterStatus) params.append('status', filterStatus);

      const res = await axios.get(`${API_BASE}?${params.toString()}`);
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  // Fetch initial stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch tickets whenever filters change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchTickets();
    }, 300); // Slight delay so it doesn't spam the API while typing
    return () => clearTimeout(delaySearch);
  }, [searchTerm, filterCategory, filterPriority, filterStatus]);

  // --- HANDLERS ---
  const handleAIClassify = async () => {
    if (!formData.description) return;
    setIsClassifying(true);
    try {
      const res = await axios.post(`${API_BASE}classify/`, {
        description: formData.description
      });
      setFormData(prev => ({
        ...prev,
        category: res.data.suggested_category || prev.category,
        priority: res.data.suggested_priority || prev.priority
      }));
    } catch (err) {
      console.error("AI Classification failed, using defaults.", err);
    }
    setIsClassifying(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(API_BASE, formData);
      setFormData({ title: '', description: '', category: 'general', priority: 'low' });
      fetchTickets();
      fetchStats();
    } catch (err) {
      console.error("Error creating ticket:", err);
    }
    setIsSubmitting(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE}${id}/`, { status: newStatus });
      fetchTickets();
      fetchStats();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // --- UI RENDERING ---
  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER & STATS DASHBOARD */}
        <div>
          <h1 className="text-3xl font-bold mb-6 text-blue-600">TicketHub AI</h1>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 font-medium">Total Tickets</p>
                <p className="text-2xl font-bold">{stats.total_tickets}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 font-medium">Open Tickets</p>
                <p className="text-2xl font-bold">{stats.open_tickets}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 font-medium">Avg Per Day</p>
                <p className="text-2xl font-bold">{stats.avg_tickets_per_day}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 font-medium">Top Priority</p>
                <p className="text-sm font-medium mt-1">
                  High: {stats.priority_breakdown?.high || 0} | Crit: {stats.priority_breakdown?.critical || 0}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NEW TICKET FORM */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-xl font-bold mb-4">Submit a Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  type="text" 
                  maxLength="200"
                  required
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  onBlur={handleAIClassify}
                  placeholder="Describe your issue. AI will auto-classify when you click away..."
                />
                {isClassifying && <p className="text-sm text-blue-500 mt-1 animate-pulse">🤖 AI is thinking...</p>}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-slate-50 outline-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                    <option value="account">Account</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-slate-50 outline-none"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || isClassifying}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Create Ticket'}
              </button>
            </form>
          </div>

          {/* TICKET BROWSER */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* SEARCH & FILTERS */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4">
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="flex-1 min-w-[200px] p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select className="p-2 border rounded-lg outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="">All Categories</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
                <option value="account">Account</option>
                <option value="general">General</option>
              </select>
              <select className="p-2 border rounded-lg outline-none" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select className="p-2 border rounded-lg outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* TICKET LIST */}
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No tickets found.</p>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">#{ticket.id}</span>
                        <h3 className="font-bold text-lg">{ticket.title}</h3>
                      </div>
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                      <div className="flex gap-2 text-xs font-medium">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">{ticket.category}</span>
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">{ticket.priority}</span>
                        <span className="text-slate-400 py-1">{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* STATUS UPDATER */}
                    <div className="w-full md:w-auto mt-2 md:mt-0">
                      <select 
                        className={`p-1.5 text-sm font-bold rounded-lg border outline-none ${ticket.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;