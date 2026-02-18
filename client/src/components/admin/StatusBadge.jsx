const StatusBadge = ({ status, pulse = false }) => {
    const variants = {
        // Lead statuses
        'New': 'bg-green-100 text-green-800 border-green-200',
        'Contacted': 'bg-blue-100 text-blue-800 border-blue-200',
        'Closed': 'bg-slate-100 text-slate-800 border-slate-200',

        // Testimonial statuses
        'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Approved': 'bg-green-100 text-green-800 border-green-200',
        'Rejected': 'bg-red-100 text-red-800 border-red-200',

        // Claim statuses
        'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
        'Settled': 'bg-green-100 text-green-800 border-green-200',

        // Generic
        'Active': 'bg-green-100 text-green-800 border-green-200',
        'Inactive': 'bg-slate-100 text-slate-800 border-slate-200',
    };

    const colorClass = variants[status] || 'bg-slate-100 text-slate-800 border-slate-200';

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass} ${pulse ? 'animate-pulse' : ''}`}>
            {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
            {status}
        </span>
    );
};

export default StatusBadge;
