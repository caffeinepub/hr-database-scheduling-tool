import React, { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Shield } from "lucide-react";

export const ADMIN_LOGIN_PENDING_KEY = "adminLoginPending";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const isLoggingIn = loginStatus === "logging-in";

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    let valid = true;
    if (!username.trim()) {
      setUsernameError("Username is required.");
      valid = false;
    } else {
      setUsernameError("");
    }
    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError("");
    }
    if (!valid) return;

    if (username === "Admin" && password === "MagnumSal123") {
      // Mark that after login we need to call markAdminLoggedInSuccessfully
      sessionStorage.setItem(ADMIN_LOGIN_PENDING_KEY, "true");
      try {
        await login();
      } catch (err: any) {
        sessionStorage.removeItem(ADMIN_LOGIN_PENDING_KEY);
        toast.error("Login failed. Please try again.");
      }
    } else {
      toast.error("Invalid credentials. Please check your username and password.");
    }
  };

  const handleStaffLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/generated/hr-hub-logo.dim_128x128.png"
              alt="Magnum HR"
              className="w-20 h-20 rounded-xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Magnum HR</h1>
          <p className="text-muted-foreground mt-2">Company Dashboard & HR Management</p>
        </div>

        {/* Admin Login */}
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-primary" />
            <h2 className="font-semibold text-foreground">Admin Login</h2>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-foreground text-sm">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError("");
                }}
                placeholder="Enter username"
                className="bg-input border-border text-foreground mt-1"
                autoComplete="username"
              />
              {usernameError && (
                <p className="text-destructive text-xs mt-1">{usernameError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-foreground text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                placeholder="Enter password"
                className="bg-input border-border text-foreground mt-1"
                autoComplete="current-password"
              />
              {passwordError && (
                <p className="text-destructive text-xs mt-1">{passwordError}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={16} />
                  Admin Sign In
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Staff Login */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogIn size={18} className="text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Staff Login</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Staff members can sign in using their Internet Identity account.
          </p>
          <Button
            onClick={handleStaffLogin}
            variant="outline"
            className="w-full border-border text-foreground hover:bg-secondary"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Sign In with Internet Identity"}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          New staff? Sign in to create your account and request access.
        </p>
      </div>
    </div>
  );
}
