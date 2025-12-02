import React, { useState } from 'react';
import Card from '../../ui/Card';

interface PreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface Preferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ onNext, onBack }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
  });

  const handleToggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    localStorage.setItem('onboarding:preferences', JSON.stringify(preferences));
    onNext();
  };

  return (
    <Card variant="default" padding="lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Customize Your Experience</h2>
          <p className="text-muted-foreground mt-1">
            Choose how you want to interact with Koinonia Connect
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-sm">
            <div className="space-y-1">
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <label className="flex cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="sr-only"
              />
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-sm">
            <div className="space-y-1">
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Get real-time alerts on your device
              </p>
            </div>
            <label className="flex cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                className="sr-only"
              />
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.pushNotifications ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-sm">
            <div className="space-y-1">
              <h3 className="font-medium">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">
                Use dark theme for better visibility
              </p>
            </div>
            <label className="flex cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.darkMode}
                onChange={() => handleToggle('darkMode')}
                className="sr-only"
              />
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.darkMode ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2.5 border border-border rounded-sm font-medium hover:bg-muted/50 transition-all"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-sm font-medium hover:opacity-90 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </Card>
  );
};

PreferencesStep.displayName = 'PreferencesStep';

export default PreferencesStep;
