import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveCallerUserProfile, useRequestApproval } from "../../hooks/useQueries";
import { toast } from "sonner";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const saveProfile = useSaveCallerUserProfile();
  const requestApproval = useRequestApproval();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      await requestApproval.mutateAsync();
      toast.success("Profile created! Your account is pending approval.");
    } catch (err: any) {
      toast.error(err.message || "Failed to create profile");
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="bg-card border-border" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Welcome to Magnum HR</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please enter your name to set up your profile. Your account will need to be approved by an administrator before you can access the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name" className="text-foreground">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-input border-border text-foreground mt-1"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={saveProfile.isPending || requestApproval.isPending}
          >
            {saveProfile.isPending || requestApproval.isPending ? "Setting up..." : "Create Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
