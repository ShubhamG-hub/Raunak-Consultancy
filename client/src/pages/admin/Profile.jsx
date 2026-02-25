import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock, Save, Edit2, Shield, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        joinedDate: new Date().toISOString()
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });


    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/admin/profile');
                if (res.data) {
                    setProfileData(prev => ({
                        ...prev,
                        name: res.data.name || 'Admin',
                        email: res.data.email || user?.email,
                        phone: res.data.phone || '',
                        role: res.data.role || 'Administrator',
                        joinedDate: res.data.created_at || new Date().toISOString()
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };
        fetchProfile();
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const _res = await api.put('/admin/profile', {
                name: profileData.name,
                phone: profileData.phone,
                email: profileData.email
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);

            if (updateUser) {
                updateUser({
                    name: profileData.name,
                    email: profileData.email
                });
            }
        } catch (error) {
            console.error("Update error:", error);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
            setLoading(false);
            return;
        }

        try {
            const res = await api.put('/admin/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setMessage({ type: 'success', text: res.data.message || 'Password changed successfully!' });
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Password Update Error:", error);
            setMessage({ type: 'error', text: error.response?.data?.details || 'Failed to change password.' });
        } finally {
            setLoading(false);
        }

    };


    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-5xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account information</p>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Personal Information
                                </CardTitle>
                                {!isEditing && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                        <Input
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            disabled={!isEditing}
                                            className={!isEditing ? 'bg-slate-50 dark:bg-slate-800' : ''}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                        <Input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            disabled={!isEditing}
                                            className={!isEditing ? 'bg-slate-50 dark:bg-slate-800' : ''}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                                        <Input
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            disabled={!isEditing}
                                            className={!isEditing ? 'bg-slate-50 dark:bg-slate-800' : ''}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                                        <Input
                                            value={profileData.role}
                                            disabled
                                            className="bg-slate-50 dark:bg-slate-800"
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-2 pt-2">
                                        <Button type="submit" disabled={loading} className="gap-2">
                                            <Save className="w-4 h-4" />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-blue-600" />
                                Change Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!isChangingPassword ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsChangingPassword(true)}
                                >
                                    Change Password
                                </Button>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                                        <Input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                        <Input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                                        <Input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Account Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Account Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-3xl">
                                        {profileData.name ? profileData.name.charAt(0) : 'A'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="font-semibold text-slate-900 dark:text-white">{profileData.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{profileData.role}</p>
                            </div>
                            <div className="pt-4 border-t dark:border-slate-700 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Member since:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {new Date(profileData.joinedDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Status:</span>
                                    <span className="font-medium text-green-600">Active</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;