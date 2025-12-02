import React, { useState } from 'react';
import Card from '../../ui/Card';
import Input from '../../ui/Input';

interface TeamStepProps {
  onNext: () => void;
  onBack: () => void;
}

const TeamStep: React.FC<TeamStepProps> = ({ onNext, onBack }) => {
  const [teamMembers, setTeamMembers] = useState<string[]>(['']);

  const handleEmailChange = (index: number, email: string) => {
    const newEmails = [...teamMembers];
    newEmails[index] = email;
    setTeamMembers(newEmails);
  };

  const handleAddField = () => {
    setTeamMembers([...teamMembers, '']);
  };

  const handleRemoveField = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding:team', JSON.stringify([]));
    onNext();
  };

  const handleContinue = () => {
    const validEmails = teamMembers.filter(
      (email) => email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
    localStorage.setItem('onboarding:team', JSON.stringify(validEmails));
    onNext();
  };

  return (
    <Card variant="default" padding="lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Invite Team Members</h2>
          <p className="text-muted-foreground mt-1">
            Add your team members to get started together
          </p>
        </div>

        <div className="space-y-4">
          {teamMembers.map((email, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                />
              </div>
              {teamMembers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="px-3 py-2.5 text-destructive hover:bg-destructive/10 rounded-sm transition-all"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddField}
            className="text-primary hover:underline text-sm font-medium"
          >
            + Add another team member
          </button>
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
            onClick={handleSkip}
            className="flex-1 px-4 py-2.5 text-primary border border-primary rounded-sm font-medium hover:bg-primary/10 transition-all"
          >
            Skip for Now
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

TeamStep.displayName = 'TeamStep';

export default TeamStep;
