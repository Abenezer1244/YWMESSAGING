import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Image,
  MapPin,
  Phone,
  Globe,
  Calendar,
  MessageSquare,
  X,
  Plus,
  Loader,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SoftCard, SoftButton } from '../SoftUI';
import Input from '../ui/Input';
import { RichCardData, sendRichAnnouncement } from '../../api/rcs';

interface RichCardComposerProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RichCardComposer({ onSuccess, onCancel }: RichCardComposerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationFields, setShowLocationFields] = useState(false);
  const [formData, setFormData] = useState<RichCardData>({
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
    if (!newQuickReply.trim()) return;
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

  const handleRemoveQuickReply = (index: number) => {
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
      const data: RichCardData = {
        title: formData.title.trim(),
        description: formData.description?.trim(),
      };

      if (formData.imageUrl?.trim()) data.imageUrl = formData.imageUrl.trim();
      if (formData.rsvpUrl?.trim()) data.rsvpUrl = formData.rsvpUrl.trim();
      if (formData.websiteUrl?.trim()) data.websiteUrl = formData.websiteUrl.trim();
      if (formData.phoneNumber?.trim()) data.phoneNumber = formData.phoneNumber.trim();
      if (formData.location?.latitude && formData.location?.longitude) {
        data.location = formData.location;
      }
      if (formData.quickReplies && formData.quickReplies.length > 0) {
        data.quickReplies = formData.quickReplies;
      }

      const result = await sendRichAnnouncement(data);

      toast.success(
        `Announcement sent! RCS: ${result.results.rcs}, SMS: ${result.results.sms}, MMS: ${result.results.mms}`
      );

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
    } catch (error) {
      toast.error((error as Error).message || 'Failed to send announcement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Rich Card Announcement</h3>
          <p className="text-sm text-muted-foreground">
            Send a beautiful card with images, buttons, and quick replies
          </p>
        </div>
      </div>

      {/* Preview Card */}
      <SoftCard variant="gradient" className="border-2 border-dashed border-primary/30">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Preview (iMessage-style)
        </div>
        <div className="bg-card rounded-xl overflow-hidden shadow-lg max-w-sm mx-auto">
          {formData.imageUrl && (
            <div className="h-40 bg-muted flex items-center justify-center">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="p-4">
            <h4 className="font-bold text-foreground text-lg">
              {formData.title || 'Card Title'}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
              {formData.description || 'Your announcement description will appear here...'}
            </p>
            {/* Action buttons preview */}
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.rsvpUrl && (
                <span className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">RSVP</span>
              )}
              {formData.websiteUrl && (
                <span className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">Website</span>
              )}
              {formData.phoneNumber && (
                <span className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">Call</span>
              )}
              {formData.location && (
                <span className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">Directions</span>
              )}
            </div>
          </div>
          {/* Quick replies preview */}
          {formData.quickReplies && formData.quickReplies.length > 0 && (
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {formData.quickReplies.map((reply, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-sm bg-muted text-foreground rounded-full border border-border"
                >
                  {reply}
                </span>
              ))}
            </div>
          )}
        </div>
      </SoftCard>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Title */}
        <Input
          label="Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Sunday Service Announcement"
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
            placeholder="Join us this Sunday for a special service..."
            className="w-full px-4 py-3 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.description?.length || 0} / 2000
          </p>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Image className="w-4 h-4" />
            Image URL (optional)
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2.5 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Action Buttons Section */}
        <SoftCard>
          <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
            Action Buttons
            <span className="text-xs text-muted-foreground">(appear on the card)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RSVP URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                RSVP Link
              </label>
              <input
                type="url"
                value={formData.rsvpUrl}
                onChange={(e) => setFormData({ ...formData, rsvpUrl: e.target.value })}
                placeholder="https://yourchurch.com/rsvp"
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://yourchurch.com"
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Call Button
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+12025551234"
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            {/* Location Toggle */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Directions
              </label>
              <SoftButton
                variant={showLocationFields ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowLocationFields(!showLocationFields)}
                className="w-full"
              >
                {showLocationFields ? 'Hide Location' : 'Add Location'}
              </SoftButton>
            </div>
          </div>

          {/* Location Fields */}
          {showLocationFields && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/40"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  value={formData.location?.latitude || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      latitude: parseFloat(e.target.value) || 0,
                      longitude: formData.location?.longitude || 0,
                      label: formData.location?.label || '',
                    },
                  })}
                  placeholder="47.6062"
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  value={formData.location?.longitude || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      latitude: formData.location?.latitude || 0,
                      longitude: parseFloat(e.target.value) || 0,
                      label: formData.location?.label || '',
                    },
                  })}
                  placeholder="-122.3321"
                />
                <Input
                  label="Location Name"
                  value={formData.location?.label || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      latitude: formData.location?.latitude || 0,
                      longitude: formData.location?.longitude || 0,
                      label: e.target.value,
                    },
                  })}
                  placeholder="Grace Church"
                />
              </div>
            </motion.div>
          )}
        </SoftCard>

        {/* Quick Replies Section */}
        <SoftCard>
          <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Quick Replies
            <span className="text-xs text-muted-foreground">(tap-to-respond buttons)</span>
          </h4>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newQuickReply}
              onChange={(e) => setNewQuickReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddQuickReply()}
              placeholder="Add a quick reply..."
              maxLength={50}
              className="flex-1 px-3 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <SoftButton
              variant="secondary"
              size="sm"
              onClick={handleAddQuickReply}
              disabled={(formData.quickReplies?.length || 0) >= 5}
            >
              <Plus className="w-4 h-4" />
            </SoftButton>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.quickReplies?.map((reply, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 bg-muted rounded-full flex items-center gap-2 text-sm"
              >
                {reply}
                <button
                  onClick={() => handleRemoveQuickReply(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>

          {(!formData.quickReplies || formData.quickReplies.length === 0) && (
            <p className="text-sm text-muted-foreground">
              Suggestions: "I'll be there!", "Can't make it", "Tell me more"
            </p>
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
          disabled={isLoading || !formData.title.trim() || !formData.description?.trim()}
          icon={isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Loader className="w-4 h-4" />
            </motion.div>
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        >
          {isLoading ? 'Sending...' : 'Send Rich Announcement'}
        </SoftButton>
      </div>

      {/* Info Note */}
      <p className="text-xs text-muted-foreground text-center">
        Recipients with RCS-enabled phones will see the rich card. Others will receive SMS/MMS fallback.
      </p>
    </div>
  );
}

export default RichCardComposer;
