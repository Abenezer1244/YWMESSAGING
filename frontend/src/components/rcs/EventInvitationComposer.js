import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Image, Loader, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { SoftCard, SoftButton } from '../SoftUI';
import Input from '../ui/Input';
import { sendEventInvitation } from '../../api/rcs';
export function EventInvitationComposer({ onSuccess, onCancel }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showLocationFields, setShowLocationFields] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        date: '',
        startTime: '',
        endTime: '',
        location: {
            latitude: 0,
            longitude: 0,
            label: '',
        },
    });
    const handleSend = async () => {
        if (!formData.title.trim()) {
            toast.error('Event title is required');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Event description is required');
            return;
        }
        if (!formData.date) {
            toast.error('Event date is required');
            return;
        }
        if (!formData.startTime || !formData.endTime) {
            toast.error('Start and end times are required');
            return;
        }
        try {
            setIsLoading(true);
            // Build ISO datetime strings
            const startDateTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
            const endDateTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();
            const data = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                startTime: startDateTime,
                endTime: endDateTime,
            };
            if (formData.imageUrl?.trim())
                data.imageUrl = formData.imageUrl.trim();
            if (formData.location.latitude && formData.location.longitude && formData.location.label) {
                data.location = formData.location;
            }
            const result = await sendEventInvitation(data);
            toast.success(`Event invitation sent! RCS: ${result.results.rcs}, SMS: ${result.results.sms}`);
            // Reset form
            setFormData({
                title: '',
                description: '',
                imageUrl: '',
                date: '',
                startTime: '',
                endTime: '',
                location: { latitude: 0, longitude: 0, label: '' },
            });
            onSuccess?.();
        }
        catch (error) {
            toast.error(error.message || 'Failed to send event invitation');
        }
        finally {
            setIsLoading(false);
        }
    };
    // Format date for display
    const formatDateDisplay = () => {
        if (!formData.date)
            return 'Select a date';
        const date = new Date(formData.date + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };
    // Format time for display
    const formatTimeDisplay = () => {
        if (!formData.startTime || !formData.endTime)
            return '';
        const formatTime = (time) => {
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        };
        return `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20", children: _jsx(CalendarCheck, { className: "w-5 h-5 text-primary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-foreground", children: "Event Invitation" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Send an event card with RSVP and \"Add to Calendar\" button" })] })] }), _jsxs(SoftCard, { variant: "gradient", className: "border-2 border-dashed border-primary/30", children: [_jsxs("div", { className: "text-xs text-muted-foreground mb-2 flex items-center gap-1", children: [_jsx(CalendarCheck, { className: "w-3 h-3" }), "Preview (iMessage-style)"] }), _jsxs("div", { className: "bg-card rounded-xl overflow-hidden shadow-lg max-w-sm mx-auto", children: [formData.imageUrl && (_jsx("div", { className: "h-32 bg-muted flex items-center justify-center", children: _jsx("img", { src: formData.imageUrl, alt: "Event", className: "w-full h-full object-cover", onError: (e) => {
                                        e.target.style.display = 'none';
                                    } }) })), _jsxs("div", { className: "p-4", children: [_jsx("h4", { className: "font-bold text-foreground text-lg", children: formData.title || 'Event Title' }), _jsx("p", { className: "text-sm text-muted-foreground mt-1 line-clamp-2", children: formData.description || 'Event description...' }), _jsxs("div", { className: "flex items-center gap-2 mt-3 text-sm text-foreground/80", children: [_jsx(Calendar, { className: "w-4 h-4 text-primary" }), _jsx("span", { children: formatDateDisplay() })] }), formatTimeDisplay() && (_jsxs("div", { className: "flex items-center gap-2 mt-1 text-sm text-foreground/80", children: [_jsx(Clock, { className: "w-4 h-4 text-primary" }), _jsx("span", { children: formatTimeDisplay() })] })), _jsxs("div", { className: "flex flex-wrap gap-2 mt-3", children: [_jsx("span", { className: "px-3 py-1 text-xs bg-primary/10 text-primary rounded-full", children: "Add to Calendar" }), formData.location.label && (_jsx("span", { className: "px-3 py-1 text-xs bg-primary/10 text-primary rounded-full", children: "Get Directions" }))] })] }), _jsxs("div", { className: "px-4 pb-4 flex flex-wrap gap-2", children: [_jsx("span", { className: "px-3 py-1.5 text-sm bg-muted text-foreground rounded-full border border-border", children: "I'll be there!" }), _jsx("span", { className: "px-3 py-1.5 text-sm bg-muted text-foreground rounded-full border border-border", children: "Can't make it" }), _jsx("span", { className: "px-3 py-1.5 text-sm bg-muted text-foreground rounded-full border border-border", children: "Maybe" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Event Title *", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), placeholder: "Sunday Worship Service", maxLength: 200 }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Description *" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Join us for a special worship service with guest speaker...", className: "w-full px-4 py-3 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none", rows: 3, maxLength: 1000 })] }), _jsxs(SoftCard, { children: [_jsxs("h4", { className: "font-medium text-foreground mb-4 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Date & Time *"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Date" }), _jsx("input", { type: "date", value: formData.date, onChange: (e) => setFormData({ ...formData, date: e.target.value }), className: "w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Start Time" }), _jsx("input", { type: "time", value: formData.startTime, onChange: (e) => setFormData({ ...formData, startTime: e.target.value }), className: "w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "End Time" }), _jsx("input", { type: "time", value: formData.endTime, onChange: (e) => setFormData({ ...formData, endTime: e.target.value }), className: "w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" })] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-foreground mb-2 flex items-center gap-2", children: [_jsx(Image, { className: "w-4 h-4" }), "Event Image URL (optional)"] }), _jsx("input", { type: "url", value: formData.imageUrl, onChange: (e) => setFormData({ ...formData, imageUrl: e.target.value }), placeholder: "https://example.com/event-image.jpg", className: "w-full px-4 py-2.5 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs(SoftCard, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h4", { className: "font-medium text-foreground flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4" }), "Location", _jsx("span", { className: "text-xs text-muted-foreground", children: "(optional - adds Directions button)" })] }), _jsx(SoftButton, { variant: showLocationFields ? 'primary' : 'secondary', size: "sm", onClick: () => setShowLocationFields(!showLocationFields), children: showLocationFields ? 'Hide' : 'Add Location' })] }), showLocationFields && (_jsxs(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Input, { label: "Latitude", type: "number", step: "any", value: formData.location.latitude || '', onChange: (e) => setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                latitude: parseFloat(e.target.value) || 0,
                                            },
                                        }), placeholder: "47.6062" }), _jsx(Input, { label: "Longitude", type: "number", step: "any", value: formData.location.longitude || '', onChange: (e) => setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                longitude: parseFloat(e.target.value) || 0,
                                            },
                                        }), placeholder: "-122.3321" }), _jsx(Input, { label: "Location Name", value: formData.location.label, onChange: (e) => setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                label: e.target.value,
                                            },
                                        }), placeholder: "Grace Church" })] }))] })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [onCancel && (_jsx(SoftButton, { variant: "secondary", onClick: onCancel, children: "Cancel" })), _jsx(SoftButton, { variant: "primary", fullWidth: true, onClick: handleSend, disabled: isLoading || !formData.title.trim() || !formData.description.trim() || !formData.date || !formData.startTime || !formData.endTime, icon: isLoading ? (_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, children: _jsx(Loader, { className: "w-4 h-4" }) })) : (_jsx(CalendarCheck, { className: "w-4 h-4" })), children: isLoading ? 'Sending...' : 'Send Event Invitation' })] }), _jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Recipients can tap \"Add to Calendar\" to save the event. RSVP replies will appear in your conversations." })] }));
}
export default EventInvitationComposer;
//# sourceMappingURL=EventInvitationComposer.js.map