import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { UserPlus, Mail, Lock, User, Phone, ArrowLeft, CheckCircle } from 'lucide-react';

const Register = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        mobile: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/register', formData);
            if (data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700"
                >
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Registration Successful!</h2>
                    <p className="text-slate-500 dark:text-slate-400">Welcome to the family. Redirecting to login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-6 transition-colors duration-500">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700">
                    <div className="mb-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mb-6">
                            <UserPlus className="text-blue-600 dark:text-blue-400 w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{t.auth.registerTitle}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t.auth.registerSubtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold border border-red-100 dark:border-red-900/50">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">{t.auth.fullName}</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <Input
                                        id="fullName"
                                        placeholder="John Doe"
                                        className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-slate-700 transition-all text-sm"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobile">{t.auth.mobile}</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <Input
                                        id="mobile"
                                        placeholder="98765 43210"
                                        className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-slate-700 transition-all text-sm"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t.auth.email}</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-slate-700 transition-all text-sm"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t.auth.password}</Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-slate-700 transition-all text-sm"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold mt-4 shadow-lg shadow-blue-600/10 transition-all"
                        >
                            {loading ? t.auth.registerBtn + '...' : t.auth.registerBtn}
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50 text-center">
                        <span className="text-sm text-slate-500 dark:text-slate-400 mr-2">{t.auth.hasAccount}</span>
                        <Link to="/login" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                            {t.auth.loginBtn}
                        </Link>
                        <div className="mt-6">
                            <Link to="/" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center gap-2">
                                <ArrowLeft className="w-3 h-3" /> Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
