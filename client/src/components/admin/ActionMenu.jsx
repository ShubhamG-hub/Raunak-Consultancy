import { useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ActionMenu = ({ actions, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);

    const iconMap = {
        view: Eye,
        edit: Edit,
        delete: Trash2,
        approve: Check,
        reject: X,
    };

    const handleAction = (actionType) => {
        setIsOpen(false);
        onAction(actionType);
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="h-8 w-8 p-0"
            >
                <MoreVertical className="h-4 w-4" />
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-white/10 py-1 z-20">
                        {actions.map((action) => {
                            const Icon = action.icon || iconMap[action.type] || Eye;
                            return (
                                <button
                                    key={action.type}
                                    onClick={() => handleAction(action.type)}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${action.danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{action.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default ActionMenu;
