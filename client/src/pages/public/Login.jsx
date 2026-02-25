import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
    const { t } = useLanguage();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 pt-20 px-6 transition-colors duration-500">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] -left-[10%] w-[35%] h-[35%] bg-primary-theme/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[20%] -right-[10%] w-[35%] h-[35%] bg-accent-theme/10 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-700">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary-theme rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-theme/20">
                            <LogIn className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{t.auth.loginTitle}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t.auth.loginSubtitle}</p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl text-[10px] font-bold border border-amber-100 dark:border-amber-900/50 flex flex-col items-center gap-2 mb-6">
                        <ShieldCheck className="w-5 h-5 mb-1" />
                        <p className="text-center">USER LOGIN IS CURRENTLY DISABLED</p>
                        <p className="text-center font-normal opacity-80 uppercase tracking-tighter">Only Admin access is permitted at this time.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 opacity-50 pointer-events-none">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold border border-red-100 dark:border-red-900/50 flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">{t.auth.email}</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" aria-hidden="true" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-12 h-12 rounded-2xl border-slate-200 dark:border-slate-700 focus:ring-blue-600 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">{t.auth.password}</Label>
                                <a href="#" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">{t.auth.forgotPassword}</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" aria-hidden="true" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-12 h-12 rounded-2xl border-slate-200 dark:border-slate-700 focus:ring-blue-600 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    disabled
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={true}
                            className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 font-bold transition-all"
                        >
                            {t.auth.loginBtn}
                        </Button>
                    </form>

                    {/* 
                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-700/50 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 ">
                            {t.auth.noAccount}
                        </p>
                        <Link to="/register">
                            <Button variant="outline" className="w-full h-12 rounded-2xl border-2 font-bold group">
                                {t.auth.registerBtn} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                    */}

                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        Secure Encrypted Session
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;