const StatusBadge = ({ status, pulse = false }) => {
    const variants = {
        // Lead statuses
        'New': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'Contacted': 'bg-primary/10 text-primary border-primary/20',
        'Closed': 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',

        // Testimonial statuses
        'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        'Approved': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'Rejected': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',

        // Claim statuses
        'Processing': 'bg-primary/10 text-primary border-primary/20',
        'Settled': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',

        // Generic
        'Active': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'Inactive': 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };

    const colorClass = variants[status] || 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass} ${pulse ? 'animate-pulse' : ''}`}>
            {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
            {status}
        </span>
    );
};

export default StatusBadge;
