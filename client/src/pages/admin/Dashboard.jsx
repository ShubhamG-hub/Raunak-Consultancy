import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    MessageSquare,
    FileText,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Calendar
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
    const [recentLeads, setRecentLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [areaChartRef, areaSize] = useContainerSize();
    const [pieChartRef, pieSize] = useContainerSize();

    // Mock Chart Data (Replacing with real data in future)
    const chartData = [
        { name: 'Jan', leads: 4 },
        { name: 'Feb', leads: 7 },
        { name: 'Mar', leads: 5 },
        { name: 'Apr', leads: 12 },
        { name: 'May', leads: 18 },
        { name: 'Jun', leads: 24 },
        { name: 'Jul', leads: stats.leads || 30 },
    ];

    const pieData = [
        { name: 'New', value: 35, color: '#3b82f6' },
        { name: 'Contacted', value: 45, color: '#8b5cf6' },
        { name: 'Converted', value: 15, color: '#10b981' },
        { name: 'Lost', value: 5, color: '#ef4444' },
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [leadsRes, claimsRes, testRes] = await Promise.all([
                api.get('/leads').catch(() => ({ data: [] })),
                api.get('/claims').catch(() => ({ data: [] })),
                api.get('/testimonials/admin').catch(() => ({ data: [] }))
            ]);

            setStats({
                leads: leadsRes.data ? leadsRes.data.length : 0,
                claims: claimsRes.data ? claimsRes.data.length : 0,
                testimonials: testRes.data ? testRes.data.length : 0
            });

            if (leadsRes.data) {
                setRecentLeads(leadsRes.data.slice(0, 5));
            }
        } catch (err) {
            console.error("Failed to fetch dashboard stats", err);
        } finally {
            setLoading(false);
        }
    };

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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                            +12% <ArrowUpRight className="w-3 h-3" />
                        </span>
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
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                            +5% <ArrowUpRight className="w-3 h-3" />
                        </span>
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
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-full">
                            0% <Activity className="w-3 h-3" />
                        </span>
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
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Latest leads and inquiries</p>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading activity...</div>
                    ) : recentLeads.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No recent activity</div>
                    ) : (
                        recentLeads.map((lead, index) => (
                            <motion.div
                                key={lead.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{lead.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{lead.service || 'General Inquiry'} • {new Date(lead.created_at || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${lead.status === 'New' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
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
        </motion.div>
    );
};

export default Dashboard;
