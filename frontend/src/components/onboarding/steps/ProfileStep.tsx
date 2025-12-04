import React, { useState } from 'react';
import Card from '../../ui/Card';
import Input from '../../ui/Input';

interface ProfileStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface ProfileData {
  fullName: string;
  email: string;
  organization: string;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState<ProfileData>({
    fullName: '',
    email: '',
    organization: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Store profile data in localStorage or state management
      localStorage.setItem('onboarding:profile', JSON.stringify(formData));
      onNext();
    }
  };

  return (
    <Card variant="default" padding="lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Set Up Your Profile</h2>
          <p className="text-muted-foreground mt-1">
            Tell us a bit about yourself
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="John Doe"
            autoComplete="name"
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />

          <Input
            label="Organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            error={errors.organization}
            placeholder="Acme Corporation"
            autoComplete="organization"
            required
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-2.5 border border-border rounded-sm font-medium hover:bg-muted/50 transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-sm font-medium hover:opacity-90 transition-all"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
};

ProfileStep.displayName = 'ProfileStep';

export default ProfileStep;
