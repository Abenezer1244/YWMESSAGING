import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Image,
  Loader,
  CalendarCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SoftCard, SoftButton } from '../SoftUI';
import Input from '../ui/Input';
import { EventInvitationData, sendEventInvitation } from '../../api/rcs';

interface EventInvitationComposerProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventInvitationComposer({ onSuccess, onCancel }: EventInvitationComposerProps) {
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

      const data: EventInvitationData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: startDateTime,
        endTime: endDateTime,
      };

      if (formData.imageUrl?.trim()) data.imageUrl = formData.imageUrl.trim();
      if (formData.location.latitude && formData.location.longitude && formData.location.label) {
        data.location = formData.location;
      }

      const result = await sendEventInvitation(data);

      toast.success(
        `Event invitation sent! RCS: ${result.results.rcs}, SMS: ${result.results.sms}`
      );

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
    } catch (error) {
      toast.error((error as Error).message || 'Failed to send event invitation');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDateDisplay = () => {
    if (!formData.date) return 'Select a date';
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
    if (!formData.startTime || !formData.endTime) return '';
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    };
    return `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
          <CalendarCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Event Invitation</h3>
          <p className="text-sm text-muted-foreground">
            Send an event card with RSVP and "Add to Calendar" button
          </p>
        </div>
      </div>

      {/* Preview Card */}
      <SoftCard variant="gradient" className="border-2 border-dashed border-primary/30">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <CalendarCheck className="w-3 h-3" />
          Preview (iMessage-style)
        </div>
        <div className="bg-card rounded-xl overflow-hidden shadow-lg max-w-sm mx-auto">
          {formData.imageUrl && (
            <div className="h-32 bg-muted flex items-center justify-center">
              <img
                src={formData.imageUrl}
                alt="Event"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="p-4">
            <h4 className="font-bold text-foreground text-lg">
              {formData.title || 'Event Title'}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {formData.description || 'Event description...'}
            </p>

            {/* Date/Time Badge */}
            <div className="flex items-center gap-2 mt-3 text-sm text-foreground/80">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formatDateDisplay()}</span>
            </div>
            {formatTimeDisplay() && (
              <div className="flex items-center gap-2 mt-1 text-sm text-foreground/80">
                <Clock className="w-4 h-4 text-primary" />
                <span>{formatTimeDisplay()}</span>
              </div>
            )}

            {/* Action buttons preview */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">
                Add to Calendar
              </span>
              {formData.location.label && (
                <span className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">
                  Get Directions
                </span>
              )}
            </div>
          </div>
          {/* Quick replies preview */}
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 text-sm bg-muted text-foreground rounded-full border border-border">
              I'll be there!
            </span>
            <span className="px-3 py-1.5 text-sm bg-muted text-foreground rounded-full border border-border">
              Can't make it
            </span>
            <span className="px-3 py-1.5 text-sm bg-muted text-foreground rounded-full border border-border">
              Maybe
            </span>
          </div>
        </div>
      </SoftCard>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Title */}
        <Input
          label="Event Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Sunday Worship Service"
          maxLength={200}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Join us for a special worship service with guest speaker..."
            className="w-full px-4 py-3 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
            maxLength={1000}
          />
        </div>

        {/* Date and Time */}
        <SoftCard>
          <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date & Time *
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </SoftCard>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Image className="w-4 h-4" />
            Event Image URL (optional)
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/event-image.jpg"
            className="w-full px-4 py-2.5 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Location */}
        <SoftCard>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
              <span className="text-xs text-muted-foreground">(optional - adds Directions button)</span>
            </h4>
            <SoftButton
              variant={showLocationFields ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowLocationFields(!showLocationFields)}
            >
              {showLocationFields ? 'Hide' : 'Add Location'}
            </SoftButton>
          </div>

          {showLocationFields && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Input
                label="Latitude"
                type="number"
                step="any"
                value={formData.location.latitude || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  location: {
                    ...formData.location,
                    latitude: parseFloat(e.target.value) || 0,
                  },
                })}
                placeholder="47.6062"
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                value={formData.location.longitude || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  location: {
                    ...formData.location,
                    longitude: parseFloat(e.target.value) || 0,
                  },
                })}
                placeholder="-122.3321"
              />
              <Input
                label="Location Name"
                value={formData.location.label}
                onChange={(e) => setFormData({
                  ...formData,
                  location: {
                    ...formData.location,
                    label: e.target.value,
                  },
                })}
                placeholder="Grace Church"
              />
            </motion.div>
          )}
        </SoftCard>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <SoftButton variant="secondary" onClick={onCancel}>
            Cancel
          </SoftButton>
        )}
        <SoftButton
          variant="primary"
          fullWidth
          onClick={handleSend}
          disabled={isLoading || !formData.title.trim() || !formData.description.trim() || !formData.date || !formData.startTime || !formData.endTime}
          icon={isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Loader className="w-4 h-4" />
            </motion.div>
          ) : (
            <CalendarCheck className="w-4 h-4" />
          )}
        >
          {isLoading ? 'Sending...' : 'Send Event Invitation'}
        </SoftButton>
      </div>

      {/* Info Note */}
      <p className="text-xs text-muted-foreground text-center">
        Recipients can tap "Add to Calendar" to save the event. RSVP replies will appear in your conversations.
      </p>
    </div>
  );
}

export default EventInvitationComposer;
