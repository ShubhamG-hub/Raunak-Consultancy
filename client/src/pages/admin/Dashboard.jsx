import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    MessageSquare,
    FileText,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Calendar,
    Search,
    X,
    Filter
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/Modal';

// Custom hook to track container size and avoid ResponsiveContainer issues
const useContainerSize = () => {
    const ref = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setSize({ width: Math.floor(width), height: Math.floor(height) });
                }
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return [ref, size];
};

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2 }) => {
    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {value}
        </motion.span>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        leads: 0,
        testimonials: 0,
        claims: 0
    });
    const [allLeads, setAllLeads] = useState([]);
    const [recentLeads, setRecentLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [areaChartRef, areaSize] = useContainerSize();
    const [pieChartRef, pieSize] = useContainerSize();

    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            const [leadsRes, claimsRes, testRes] = await Promise.all([
                api.get('/leads').catch(() => ({ data: [] })),
                api.get('/claims').catch(() => ({ data: [] })),
                api.get('/testimonials/admin').catch(() => ({ data: [] }))
            ]);

            const leads = Array.isArray(leadsRes.data) ? leadsRes.data : [];
            const claims = Array.isArray(claimsRes.data) ? claimsRes.data : [];
            const testimonials = Array.isArray(testRes.data) ? testRes.data : [];

            setAllLeads(leads);
            setStats({
                leads: leads.length,
                claims: claims.length,
                testimonials: testimonials.length
            });

            // Default to latest 5 if no date selected
            if (!selectedDate) {
                setRecentLeads(leads.slice(0, 5));
            } else {
                filterByDate(selectedDate, leads);
            }

            // Process Chart Data (Last 7 Months)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const last7Months = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                last7Months.push({
                    name: months[d.getMonth()],
                    monthNum: d.getMonth(),
                    year: d.getFullYear(),
                    leads: 0
                });
            }

            leads.forEach(lead => {
                const date = new Date(lead.created_at);
                const leadMonth = date.getMonth();
                const leadYear = date.getFullYear();
                const chartPoint = last7Months.find(m => m.monthNum === leadMonth && m.year === leadYear);
                if (chartPoint) chartPoint.leads++;
            });
            setChartData(last7Months);

            // Process Pie Data
            const statusCounts = {
                'New': 0,
                'Contacted': 0,
                'Converted': 0,
                'Lost': 0
            };
            leads.forEach(lead => {
                const status = lead.status || 'New';
                if (statusCounts.hasOwnProperty(status)) {
                    statusCounts[status]++;
                } else {
                    statusCounts['New']++;
                }
            });

            const totalLeads = leads.length || 1;
            setPieData([
                { name: 'New', value: Math.round((statusCounts['New'] / totalLeads) * 100), color: '#3b82f6' },
                { name: 'Contacted', value: Math.round((statusCounts['Contacted'] / totalLeads) * 100), color: '#8b5cf6' },
                { name: 'Converted', value: Math.round((statusCounts['Converted'] / totalLeads) * 100), color: '#10b981' },
                { name: 'Lost', value: Math.round((statusCounts['Lost'] / totalLeads) * 100), color: '#ef4444' },
            ]);

            setLastUpdated(new Date());
        } catch (err) {
            console.error("Failed to fetch dashboard stats", err);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    const filterByDate = (dateVal, sourceData = allLeads) => {
        if (!dateVal) {
            setRecentLeads(sourceData.slice(0, 5));
            return;
        }
        const filtered = sourceData.filter(lead => {
            const leadDate = new Date(lead.created_at).toISOString().split('T')[0];
            return leadDate === dateVal;
        });
        setRecentLeads(filtered);
    };

    const handleDateChange = (e) => {
        const val = e.target.value;
        setSelectedDate(val);
        filterByDate(val);
        setIsCalendarOpen(false);
    };

    const resetDateFilter = () => {
        setSelectedDate(null);
        setRecentLeads(allLeads.slice(0, 5));
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header with Refresh */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Welcome back to your overview.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Last Updated</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Leads</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                            <AnimatedCounter value={stats.leads} />
                        </h3>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/20" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                            <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Testimonials</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                            <AnimatedCounter value={stats.testimonials} />
                        </h3>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-orange-500/20" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                            <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Claims</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                            <AnimatedCounter value={stats.claims} />
                        </h3>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Area Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lead Growth</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Monthly lead acquisition overview</p>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                    <div ref={areaChartRef} className="h-[300px] w-full">
                        {areaSize.width > 0 && areaSize.height > 0 && (
                            <AreaChart width={areaSize.width} height={areaSize.height} data={chartData}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
                                        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
                                    }}
                                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="leads"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorLeads)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        )}
                    </div>
                </motion.div>

                {/* Pie Chart / Status */}
                <motion.div variants={itemVariants} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lead Status</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Distribution by category</p>
                    </div>
                    <div ref={pieChartRef} className="h-[200px] w-full relative">
                        {pieSize.width > 0 && pieSize.height > 0 && (
                            <PieChart width={pieSize.width} height={pieSize.height}>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationDuration={1500}
                                    animationBegin={200}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        )}
                        {/* Center Stats */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.leads}</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        {pieData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                                </div>
                                <span className="font-medium text-slate-900 dark:text-white">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Leads Activity */}
            <motion.div variants={itemVariants} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-uppercase">Recent Activity</h3>
                            {selectedDate && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold flex items-center gap-1">
                                    <Filter className="w-3 h-3" /> {new Date(selectedDate).toLocaleDateString()}
                                    <button onClick={resetDateFilter} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Latest leads and inquiries</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCalendarOpen(true)}
                        className={`bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-all cursor-pointer border-2 ${selectedDate ? 'border-blue-500' : 'border-transparent'} group relative`}
                        title="Filter by Date"
                    >
                        <Calendar className={`w-5 h-5 ${selectedDate ? 'text-blue-500' : 'group-hover:text-blue-500'} transition-colors`} />
                        {selectedDate && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />}
                    </Button>
                </div>

                <div className="space-y-4">
                    {loading && stats.leads === 0 ? (
                        <div className="text-center py-10 text-slate-500 font-medium">Loading activity...</div>
                    ) : recentLeads.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl py-12 text-center border-2 border-dashed border-slate-200 dark:border-white/5">
                            <Activity className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No activity found{selectedDate ? ` for ${new Date(selectedDate).toLocaleDateString()}` : ''}</p>
                            {selectedDate && (
                                <Button variant="link" onClick={resetDateFilter} className="text-blue-600 mt-2">View all activity</Button>
                            )}
                        </div>
                    ) : (
                        recentLeads.map((lead, index) => (
                            <motion.div
                                key={lead.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => navigate('/admin/leads')}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors uppercase">{lead.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{lead.type || 'General Inquiry'} • {new Date(lead.created_at || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lead.status === 'New' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        lead.status === 'Contacted' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}>
                                        {lead.status || 'New'}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Calendar Filter Modal */}
            <Modal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                title="Filter Activity by Date"
            >
                <div className="space-y-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center uppercase font-bold tracking-tight">Select a date to view activity logged on that day.</p>
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate || ''}
                            onChange={handleDateChange}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-white/10 rounded-2xl focus:border-blue-500 focus:ring-0 transition-all outline-none text-slate-900 dark:text-white font-medium"
                        />
                    </div>
                    {selectedDate && (
                        <Button
                            variant="destructive"
                            onClick={resetDateFilter}
                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            Clear Filter
                        </Button>
                    )}
                </div>
            </Modal>
        </motion.div>
    );
};

export default Dashboard;
