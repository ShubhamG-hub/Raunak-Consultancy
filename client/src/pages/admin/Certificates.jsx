import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Upload, AlertCircle, Loader2, Eye, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let finalImageUrl = newCert.image_url;

            // 1. Upload file if selected
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

            // 2. Save to database
            await api.post('/certificates', {
                ...newCert,
                image_url: finalImageUrl,
                active: true
            });

            setNewCert({ name: '', expiry_date: '', image_url: '' });
            setSelectedFile(null);
            fetchCertificates();
        } catch (error) {
            console.error('Failed to add certificate:', error);
            alert(error.response?.data?.error || 'Failed to add certificate');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this certificate?')) return;
        try {
            await api.delete(`/certificates/${id}`);
            fetchCertificates();
        } catch (error) {
            console.error('Failed to delete certificate:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Compliance Certificates</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" /> Upload New Certificate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Certificate Name</label>
                                <Input
                                    required
                                    placeholder="e.g. AMFI ARN Card"
                                    value={newCert.name}
                                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Expiry Date (Optional)</label>
                                <Input
                                    type="date"
                                    value={newCert.expiry_date}
                                    onChange={(e) => setNewCert({ ...newCert, expiry_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Browse Device</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 italic">OR Image URL</label>
                                <Input
                                    placeholder="https://..."
                                    value={newCert.image_url}
                                    onChange={(e) => setNewCert({ ...newCert, image_url: e.target.value })}
                                    disabled={!!selectedFile}
                                />
                            </div>
                            <Button className="w-full" type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : 'Upload & Save'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900 font-bold">
                            <AlertCircle className="w-5 h-5 text-blue-500" /> Active Certificates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : certificates.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No certificates found.</p>
                        ) : (
                            <div className="space-y-4">
                                {certificates.map((cert) => (
                                    <div key={cert.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                                <img src={cert.image_url} alt={cert.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{cert.name}</h4>
                                                <p className="text-xs text-slate-500">
                                                    {cert.expiry_date ? `Expires: ${new Date(cert.expiry_date).toLocaleDateString()}` : 'No expiry date'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-blue-600 h-8 w-8"
                                                onClick={() => window.open(cert.image_url, '_blank')}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(cert.id)}
                                                className="text-slate-400 hover:text-red-500 h-8 w-8"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Certificates;
