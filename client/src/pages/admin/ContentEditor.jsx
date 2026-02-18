import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileEdit, Save, Check } from 'lucide-react';

const ContentEditor = () => {
    // Mock State for CMS content representing Home Page text
    const [content, setContent] = useState({
        heroTitle: 'Secure Your Future with Expert Financial Planning',
        heroSubtitle: 'Trusted by 30,000+ families. We help you grow wealth, save tax, and protect your loved ones.',
        trustFamilies: '30,000+',
        trustAssets: '₹2500 Cr+',
        trustExperience: '15+ Years',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1000);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Content Management System</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileEdit className="w-5 h-5" /> Home Page Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Hero Title</label>
                            <textarea
                                name="heroTitle"
                                value={content.heroTitle}
                                onChange={handleChange}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Hero Subtitle</label>
                            <textarea
                                name="heroSubtitle"
                                value={content.heroSubtitle}
                                onChange={handleChange}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Families Count</label>
                                <Input name="trustFamilies" value={content.trustFamilies} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assets Count</label>
                                <Input name="trustAssets" value={content.trustAssets} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Experience</label>
                                <Input name="trustExperience" value={content.trustExperience} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                                {isSaving ? 'Saving...' : saved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholders for other sections */}
                <div className="space-y-6">
                    <Card className="opacity-75">
                        <CardHeader>
                            <CardTitle>Service Pages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-4">Manage content for individual service pages.</p>
                            <Button variant="outline" disabled>Coming Soon</Button>
                        </CardContent>
                    </Card>
                    <Card className="opacity-75">
                        <CardHeader>
                            <CardTitle>Advisor Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-4">Update "About Advisor" section.</p>
                            <Button variant="outline" disabled>Coming Soon</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ContentEditor;
