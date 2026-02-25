import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatCard = ({
    title,
    value,
    description,
    // eslint-disable-next-line no-unused-vars
    icon: Icon,
    trend,
    trendValue,
    color = 'blue',
    to
}) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
        green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
        orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
        purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
        red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    };

    const CardWrapper = to ? Link : 'div';
    const wrapperProps = to ? { to, className: 'block' } : {};

    return (
        <CardWrapper {...wrapperProps}>
            <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${to ? 'cursor-pointer' : ''}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5`}></div>

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>

                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">{description}</p>
                        {trend && (
                            <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {trend === 'up' ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                <span>{trendValue}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </CardWrapper>
    );
};

export default StatCard;
