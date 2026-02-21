import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    FileText,
    Award,
    Image,
    LogOut,
    Menu,
    X,
    ChevronRight,
    User,
    Search,
    Video,
    BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import NotificationDropdown from '@/components/admin/NotificationDropdown';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Update browser tab title based on current page
    useEffect(() => {
        const page = menuItems.find(item => item.path === location.pathname);
        document.title = page ? `${page.label} | Admin Panel` : 'Admin Panel';
    }, [location.pathname]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/bookings', icon: FileText, label: 'Bookings' },
        { path: '/admin/leads', icon: Users, label: 'Leads' },
        { path: '/admin/testimonials', icon: MessageSquare, label: 'Testimonials' },
        { path: '/admin/claims', icon: FileText, label: 'Claims' },
        { path: '/admin/certificates', icon: Award, label: 'Certificates' },
        { path: '/admin/gallery', icon: Image, label: 'Gallery' },
        { path: '/admin/blogs', icon: FileText, label: 'Blogs' },
        { path: '/admin/awards', icon: Award, label: 'Awards' },
        { path: '/admin/chat', icon: MessageSquare, label: 'Chat' },
        { path: '/admin/virtual-office', icon: Video, label: 'Virtual Office' },
        { path: '/admin/virtual-office/analytics', icon: BarChart2, label: 'VO Analytics' },
        { path: '/admin/profile', icon: User, label: 'Profile' },
    ];

    const currentPage = menuItems.find(item => item.path === location.pathname);

    // Animation Variants
    const sidebarVariants = {
        open: { width: 280, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { width: 80, transition: { type: "spring", stiffness: 300, damping: 30 } }
    };

    // Shared sidebar content (used for both desktop and mobile)
    const SidebarContent = ({ isMobile = false }) => {
        const isOpen = isMobile ? true : sidebarOpen;

        return (
            <>
                {/* Logo Section */}
                <div className={`h-20 flex items-center justify-between ${isOpen ? 'px-6' : 'px-2'} border-b border-slate-200 dark:border-white/10 transition-all duration-300`}>
                    <div className={`flex items-center gap-3 overflow-hidden ${!isOpen && 'hidden'}`}>
                        <div className="w-8 h-8 flex-shrink-0">
                            <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-lg whitespace-nowrap bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                            Admin Panel
                        </span>
                    </div>

                    {!isOpen && (
                        <div className="w-8 h-8 flex-shrink-0 mx-auto">
                            <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    )}

                    {isMobile ? (
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${!isOpen && 'mx-auto'}`}
                        >
                            {sidebarOpen ? <ChevronRight className="w-5 h-5 rotate-180" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link key={item.path} to={item.path}>
                                <motion.div
                                    className={`relative flex items-center gap-3 ${isOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-xl transition-all group ${isActive
                                        ? 'text-blue-600 dark:text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId={isMobile ? "activeTabMobile" : "activeTab"}
                                            className="absolute inset-0 bg-blue-100/50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 rounded-xl"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={`${isOpen ? 'w-5 h-5' : 'w-8 h-8'} z-10 relative transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />

                                    {isOpen && (
                                        <span className="font-medium z-10 relative whitespace-nowrap overflow-hidden">
                                            {item.label}
                                        </span>
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 ${isOpen ? 'px-4' : 'px-2 justify-center'} py-3 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all group`}
                    >
                        <LogOut className={`${isOpen ? 'w-5 h-5' : 'w-8 h-8'} flex-shrink-0 transition-transform group-hover:-translate-x-1`} />
                        {isOpen && (
                            <span className="font-medium whitespace-nowrap overflow-hidden">
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden relative selection:bg-blue-500/30 transition-colors duration-300">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px]" />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                        />
                        {/* Mobile Sidebar */}
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 w-[280px] z-50 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 md:hidden"
                        >
                            <SidebarContent isMobile={true} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={sidebarOpen ? "open" : "closed"}
                variants={sidebarVariants}
                className="relative z-20 hidden md:flex flex-col h-full border-r border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl transition-colors duration-300"
            >
                <SidebarContent isMobile={false} />
            </motion.aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col relative z-20 min-w-0">
                {/* Header */}
                <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300">
                    {/* Left: Hamburger + Breadcrumbs / Page Title */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors md:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white transition-colors">{currentPage?.label || 'Overview'}</h1>
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <span>Admin</span>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-blue-600 dark:text-blue-400">{currentPage?.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions & Profile */}
                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Search Bar */}
                        <div className="relative hidden lg:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 transition-all focus:w-80"
                            />
                        </div>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* Profile Dropdown */}
                        <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-slate-200 dark:border-white/10">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'Admin User'}</p>
                                <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
                            </div>
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] ring-2 ring-slate-100 dark:ring-white/10">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-white font-bold text-sm">
                                        {user?.name ? user.name.charAt(0) : 'A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full max-w-7xl mx-auto"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
