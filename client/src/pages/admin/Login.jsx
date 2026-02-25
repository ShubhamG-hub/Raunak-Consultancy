import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        const result = await login(data.email, data.password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
                    <CardHeader className="text-center space-y-4 pb-8">
                        {/* Logo */}
                        {/* Logo */}
                        <div className="mx-auto w-24 h-24 flex items-center justify-center animate-scale-in mb-4">
                            <img src="/Logo.png" alt="Raunak Consultancy" className="w-full h-full object-contain filter drop-shadow-lg" />
                        </div>

                        {/* Title */}
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-900">Admin Portal</CardTitle>
                            <p className="text-slate-600 text-sm mt-2">Sign in to manage your platform</p>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <Input
                                        type="email"
                                        {...register('email', { required: true })}
                                        placeholder="admin@example.com"
                                        className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password', { required: true })}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-slide-down">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-500/50 transition-all duration-300"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-500">
                                © {new Date().getFullYear()} Raunak Consultancy. All rights reserved.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};

export default Login;