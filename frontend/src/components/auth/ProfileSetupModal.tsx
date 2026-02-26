import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success('Profile created! Welcome to ESC-HR.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="border-0 max-w-md"
        style={{ backgroundColor: 'white' }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle
            className="font-display text-2xl tracking-wide"
            style={{ color: 'oklch(0.1 0.005 0)' }}
          >
            Welcome to ESC-HR
          </DialogTitle>
          <DialogDescription style={{ color: 'oklch(0.45 0.005 0)' }}>
            Please enter your name to set up your profile and get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="name" className="text-sm font-medium" style={{ color: 'oklch(0.2 0.005 0)' }}>
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-1 bg-white border-gray-300"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full text-white font-semibold"
            style={{ backgroundColor: 'oklch(0.48 0.22 27)' }}
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Setting up...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
