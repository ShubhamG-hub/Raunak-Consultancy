import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import ActionMenu from '@/components/admin/ActionMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, AlertCircle, Loader2, Edit, ExternalLink, X, Eye } from 'lucide-react';
import api from '@/lib/api';
import StatusBadge from '@/components/admin/StatusBadge';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);
    const [newCert, setNewCert] = useState({
        name: '',
        expiry_date: '',
        image_url: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/certificates');
            setCertificates(res.data);
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (cert, action) => {
        setSelectedCert(cert);
        if (action === 'edit') {
            setIsEditModalOpen(true);
        } else if (action === 'delete') {
            setIsDeleteModalOpen(true);
        } else if (action === 'view') {
            window.open(cert.image_url, '_blank');
        } else if (action === 'toggle_status') {
            handleToggleStatus(cert);
        }
    };

    const handleToggleStatus = async (cert) => {
        try {
            await api.put(`/certificates/${cert.id}`, { active: !cert.active });
            fetchCertificates();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const handleEditCert = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Ensure expiry_date is properly formatted for the backend (YYYY-MM-DD or null)
            const payload = {
                ...selectedCert,
                expiry_date: selectedCert.expiry_date ? selectedCert.expiry_date.split('T')[0] : null
            };
            await api.put(`/certificates/${selectedCert.id}`, payload);
            setIsEditModalOpen(false);
            fetchCertificates();
        } catch (error) {
            console.error('Failed to update certificate:', error);
            alert(error.response?.data?.error || 'Failed to update certificate');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let finalImageUrl = newCert.image_url;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('image', selectedFile);

                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = uploadRes.data.url;
            }

            if (!finalImageUrl) {
                alert('Please upload a file or provide an image URL');
                setSubmitting(false);
                return;
            }

            await api.post('/certificates', {
                ...newCert,
                expiry_date: newCert.expiry_date || null,
                image_url: finalImageUrl,
                active: true
            });

            setNewCert({ name: '', expiry_date: '', image_url: '' });
            setSelectedFile(null);
            setIsAddModalOpen(false);
            fetchCertificates();
        } catch (error) {
            console.error('Failed to add certificate:', error);
            alert(error.response?.data?.error || 'Failed to add certificate');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/certificates/${selectedCert.id}`);
            setIsDeleteModalOpen(false);
            fetchCertificates();
        } catch (error) {
            console.error('Failed to delete certificate:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-6 text-slate-900 dark:text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold">Compliance Certificates</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage regulatory certifications and licensing</p>
                </div>

                <Button
                    className="flex items-center gap-2 bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 rounded-xl px-6 h-12"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus className="w-4 h-4" />
                    Add New Certificate
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <h2 className="font-bold">Active Certificates</h2>
                </div>

                <div className="p-4 md:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                            <p className="text-slate-500">Fetching certificates...</p>
                        </div>
                    ) : certificates.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                            </div>
                            <p className="text-slate-500">No certificates found. Click the button above to add one.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {certificates.map((cert) => (
                                <div
                                    key={cert.id}
                                    className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5 hover:shadow-xl transition-all duration-300 p-5"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 border border-slate-200 dark:border-white/10 shadow-inner">
                                            <img src={cert.image_url} alt={cert.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <ActionMenu
                                            actions={[
                                                { type: 'view', label: 'View Large', icon: ExternalLink },
                                                { type: 'edit', label: 'Edit', icon: Edit },
                                                { type: 'toggle_status', label: cert.active ? 'Hide from Public' : 'Show to Public', icon: Eye },
                                                { type: 'delete', label: 'Delete', danger: true }
                                            ]}
                                            onAction={(action) => handleAction(cert, action)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{cert.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={cert.active ? 'Approved' : 'Rejected'} />
                                            {cert.expiry_date && (
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                    Exp: {new Date(cert.expiry_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-2 h-9 rounded-lg font-bold"
                                            onClick={() => window.open(cert.image_url, '_blank')}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Open Document
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Certificate Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Compliance Certificate"
            >
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Certificate Name</label>
                        <Input
                            required
                            placeholder="e.g. AMFI ARN Card"
                            value={newCert.name}
                            onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expiry Date (Optional)</label>
                        <Input
                            type="date"
                            value={newCert.expiry_date}
                            onChange={(e) => setNewCert({ ...newCert, expiry_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Document</label>
                        <div className="flex flex-col gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium text-slate-900 dark:text-white"
                            />
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center italic">OR provide a URL below</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document URL</label>
                        <Input
                            placeholder="https://..."
                            value={newCert.image_url}
                            onChange={(e) => setNewCert({ ...newCert, image_url: e.target.value })}
                            disabled={!!selectedFile}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1 bg-primary text-white" type="submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Certificate'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Certificate Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Certificate"
            >
                {selectedCert && (
                    <form onSubmit={handleEditCert} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Certificate Name</label>
                            <Input
                                required
                                value={selectedCert.name}
                                onChange={(e) => setSelectedCert({ ...selectedCert, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expiry Date</label>
                            <Input
                                type="date"
                                value={selectedCert.expiry_date ? selectedCert.expiry_date.split('T')[0] : ''}
                                onChange={(e) => setSelectedCert({ ...selectedCert, expiry_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document URL</label>
                            <Input
                                required
                                value={selectedCert.image_url}
                                onChange={(e) => setSelectedCert({ ...selectedCert, image_url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                            <select
                                value={selectedCert.active ? 'true' : 'false'}
                                onChange={(e) => setSelectedCert({ ...selectedCert, active: e.target.value === 'true' })}
                                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white"
                            >
                                <option value="true">Visible</option>
                                <option value="false">Hidden</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button className="flex-1 bg-primary text-white" type="submit" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400">
                        Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selectedCert?.name}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete Certificate'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Certificates;
