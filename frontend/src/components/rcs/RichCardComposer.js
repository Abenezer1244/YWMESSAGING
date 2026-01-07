import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, MapPin, Phone, Globe, Calendar, MessageSquare, X, Plus, Loader, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { SoftCard, SoftButton } from '../SoftUI';
import Input from '../ui/Input';
import { sendRichAnnouncement } from '../../api/rcs';
export function RichCardComposer({ onSuccess, onCancel }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showLocationFields, setShowLocationFields] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        rsvpUrl: '',
        websiteUrl: '',
        phoneNumber: '',
        quickReplies: [],
    });
    const [newQuickReply, setNewQuickReply] = useState('');
    const handleAddQuickReply = () => {
        if (!newQuickReply.trim())
            return;
        if ((formData.quickReplies?.length || 0) >= 5) {
            toast.error('Maximum 5 quick replies allowed');
            return;
        }
        setFormData({
            ...formData,
            quickReplies: [...(formData.quickReplies || []), newQuickReply.trim()],
        });
        setNewQuickReply('');
    };
    const handleRemoveQuickReply = (index) => {
        setFormData({
            ...formData,
            quickReplies: formData.quickReplies?.filter((_, i) => i !== index),
        });
    };
    const handleSend = async () => {
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!formData.description?.trim()) {
            toast.error('Description is required');
            return;
        }
        try {
            setIsLoading(true);
            // Build the data object, only including non-empty fields
            const data = {
                title: formData.title.trim(),
                description: formData.description?.trim(),
            };
            if (formData.imageUrl?.trim())
                data.imageUrl = formData.imageUrl.trim();
            if (formData.rsvpUrl?.trim())
                data.rsvpUrl = formData.rsvpUrl.trim();
            if (formData.websiteUrl?.trim())
                data.websiteUrl = formData.websiteUrl.trim();
            if (formData.phoneNumber?.trim())
                data.phoneNumber = formData.phoneNumber.trim();
            if (formData.location?.latitude && formData.location?.longitude) {
                data.location = formData.location;
            }
            if (formData.quickReplies && formData.quickReplies.length > 0) {
                data.quickReplies = formData.quickReplies;
            }
            const result = await sendRichAnnouncement(data);
            toast.success(`Announcement sent! RCS: ${result.results.rcs}, SMS: ${result.results.sms}, MMS: ${result.results.mms}`);
            // Reset form
            setFormData({
                title: '',
                description: '',
                imageUrl: '',
                rsvpUrl: '',
                websiteUrl: '',
                phoneNumber: '',
                quickReplies: [],
            });
            onSuccess?.();
        }
        catch (error) {
            toast.error(error.message || 'Failed to send announcement');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20", children: _jsx(Sparkles, { className: "w-5 h-5 text-primary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-foreground", children: "Rich Card Announcement" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Send a beautiful card with images, buttons, and quick replies" })] })] }), _jsxs(SoftCard, { variant: "gradient", className: "border-2 border-dashed border-primary/30", children: [_jsxs("div", { className: "text-xs text-muted-foreground mb-2 flex items-center gap-1", children: [_jsx(Sparkles, { className: "w-3 h-3" }), "Preview (iMessage-style)"] }), _jsxs("div", { className: "bg-card rounded-xl overflow-hidden shadow-lg max-w-sm mx-auto", children: [formData.imageUrl && (_jsx("div", { className: "h-40 bg-muted flex items-center justify-center", children: _jsx("img", { src: formData.imageUrl, alt: "Preview", className: "w-full h-full object-cover", onError: (e) => {
                                        e.target.style.display = 'none';
                                    } }) })), _jsxs("div", { className: "p-4", children: [_jsx("h4", { className: "font-bold text-foreground text-lg", children: formData.title || 'Card Title' }), _jsx("p", { className: "text-sm text-muted-foreground mt-1 line-clamp-3", children: formData.description || 'Your announcement description will appear here...' }), _jsxs("div", { className: "flex flex-wrap gap-2 mt-3", children: [formData.rsvpUrl && (_jsx("span", { className: "px-3 py-1 text-xs bg-primary/10 text-primary rounded-full", children: "RSVP" })), formData.websiteUrl && (_jsx("span", { className: "px-3 py-1 text-xs bg-primary/10 text-primary rounded-full", children: "Website" })), formData.phoneNumber && (_jsx("span", { className: "px-3 py-1 text-xs bg-primary/10 text-primary rounded-full", children: "Call" })), formData.location && (_jsx("span", { className: "px-3 py-1 text-xs bg-primary/10 text-primary rounded-full", children: "Directions" }))] })] }), formData.quickReplies && formData.quickReplies.length > 0 && (_jsx("div", { className: "px-4 pb-4 flex flex-wrap gap-2", children: formData.quickReplies.map((reply, index) => (_jsx("span", { className: "px-3 py-1.5 text-sm bg-muted text-foreground rounded-full border border-border", children: reply }, index))) }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Title *", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), placeholder: "Sunday Service Announcement", maxLength: 200 }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Description *" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Join us this Sunday for a special service...", className: "w-full px-4 py-3 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none", rows: 3, maxLength: 2000 }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [formData.description?.length || 0, " / 2000"] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-foreground mb-2 flex items-center gap-2", children: [_jsx(Image, { className: "w-4 h-4" }), "Image URL (optional)"] }), _jsx("input", { type: "url", value: formData.imageUrl, onChange: (e) => setFormData({ ...formData, imageUrl: e.target.value }), placeholder: "https://example.com/image.jpg", className: "w-full px-4 py-2.5 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs(SoftCard, { children: [_jsxs("h4", { className: "font-medium text-foreground mb-4 flex items-center gap-2", children: ["Action Buttons", _jsx("span", { className: "text-xs text-muted-foreground", children: "(appear on the card)" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-foreground mb-2 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), "RSVP Link"] }), _jsx("input", { type: "url", value: formData.rsvpUrl, onChange: (e) => setFormData({ ...formData, rsvpUrl: e.target.value }), placeholder: "https://yourchurch.com/rsvp", className: "w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-foreground mb-2 flex items-center gap-2", children: [_jsx(Globe, { className: "w-4 h-4" }), "Website"] }), _jsx("input", { type: "url", value: formData.websiteUrl, onChange: (e) => setFormData({ ...formData, websiteUrl: e.target.value }), placeholder: "https://yourchurch.com", className: "w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-foreground mb-2 flex items-center gap-2", children: [_jsx(Phone, { className: "w-4 h-4" }), "Call Button"] }), _jsx("input", { type: "tel", value: formData.phoneNumber, onChange: (e) => setFormData({ ...formData, phoneNumber: e.target.value }), placeholder: "+12025551234", className: "w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-foreground mb-2 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4" }), "Directions"] }), _jsx(SoftButton, { variant: showLocationFields ? 'primary' : 'secondary', size: "sm", onClick: () => setShowLocationFields(!showLocationFields), className: "w-full", children: showLocationFields ? 'Hide Location' : 'Add Location' })] })] }), showLocationFields && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "mt-4 pt-4 border-t border-border/40", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Input, { label: "Latitude", type: "number", step: "any", value: formData.location?.latitude || '', onChange: (e) => setFormData({
                                                ...formData,
                                                location: {
                                                    ...formData.location,
                                                    latitude: parseFloat(e.target.value) || 0,
                                                    longitude: formData.location?.longitude || 0,
                                                    label: formData.location?.label || '',
                                                },
                                            }), placeholder: "47.6062" }), _jsx(Input, { label: "Longitude", type: "number", step: "any", value: formData.location?.longitude || '', onChange: (e) => setFormData({
                                                ...formData,
                                                location: {
                                                    ...formData.location,
                                                    latitude: formData.location?.latitude || 0,
                                                    longitude: parseFloat(e.target.value) || 0,
                                                    label: formData.location?.label || '',
                                                },
                                            }), placeholder: "-122.3321" }), _jsx(Input, { label: "Location Name", value: formData.location?.label || '', onChange: (e) => setFormData({
                                                ...formData,
                                                location: {
                                                    ...formData.location,
                                                    latitude: formData.location?.latitude || 0,
                                                    longitude: formData.location?.longitude || 0,
                                                    label: e.target.value,
                                                },
                                            }), placeholder: "Grace Church" })] }) }))] }), _jsxs(SoftCard, { children: [_jsxs("h4", { className: "font-medium text-foreground mb-4 flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-4 h-4" }), "Quick Replies", _jsx("span", { className: "text-xs text-muted-foreground", children: "(tap-to-respond buttons)" })] }), _jsxs("div", { className: "flex gap-2 mb-3", children: [_jsx("input", { type: "text", value: newQuickReply, onChange: (e) => setNewQuickReply(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleAddQuickReply(), placeholder: "Add a quick reply...", maxLength: 50, className: "flex-1 px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm" }), _jsx(SoftButton, { variant: "secondary", size: "sm", onClick: handleAddQuickReply, disabled: (formData.quickReplies?.length || 0) >= 5, children: _jsx(Plus, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: formData.quickReplies?.map((reply, index) => (_jsxs(motion.span, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, className: "px-3 py-1.5 bg-muted rounded-full flex items-center gap-2 text-sm", children: [reply, _jsx("button", { onClick: () => handleRemoveQuickReply(index), className: "text-muted-foreground hover:text-foreground", children: _jsx(X, { className: "w-3 h-3" }) })] }, index))) }), (!formData.quickReplies || formData.quickReplies.length === 0) && (_jsx("p", { className: "text-sm text-muted-foreground", children: "Suggestions: \"I'll be there!\", \"Can't make it\", \"Tell me more\"" }))] })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [onCancel && (_jsx(SoftButton, { variant: "secondary", onClick: onCancel, children: "Cancel" })), _jsx(SoftButton, { variant: "primary", fullWidth: true, onClick: handleSend, disabled: isLoading || !formData.title.trim() || !formData.description?.trim(), icon: isLoading ? (_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, children: _jsx(Loader, { className: "w-4 h-4" }) })) : (_jsx(Sparkles, { className: "w-4 h-4" })), children: isLoading ? 'Sending...' : 'Send Rich Announcement' })] }), _jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Recipients with RCS-enabled phones will see the rich card. Others will receive SMS/MMS fallback." })] }));
}
export default RichCardComposer;
//# sourceMappingURL=RichCardComposer.js.map