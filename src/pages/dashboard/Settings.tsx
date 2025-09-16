import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Bell, Shield, Trash2, Crown, Calendar } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useUser } from "@clerk/clerk-react";

const Settings = () => {
  const { userData, isPro } = useUserData();
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and account settings
        </p>
      </div>

      {/* Profile Information */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and profile settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                placeholder="Enter your first name"
                defaultValue={user?.firstName || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Enter your last name"
                defaultValue={user?.lastName || ""}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email"
              defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email address is managed by your authentication provider
            </p>
          </div>

          <Button variant="government">Update Profile</Button>
        </CardContent>
      </Card>

      {/* Membership Status */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Membership Status
          </CardTitle>
          <CardDescription>
            Your current subscription and membership details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              {isPro ? (
                <Crown className="h-6 w-6 text-primary" />
              ) : (
                <Calendar className="h-6 w-6 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {isPro ? "Pro Member" : "Free Plan"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPro 
                    ? userData?.membership_expires_at 
                      ? `Expires: ${new Date(userData.membership_expires_at).toLocaleDateString()}`
                      : "Active subscription"
                    : "Limited access to basic features"
                  }
                </p>
              </div>
            </div>
            <Badge variant={isPro ? "default" : "secondary"}>
              {isPro ? "Active" : "Free"}
            </Badge>
          </div>
          
          {!isPro && (
            <Button variant="hero" className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how you receive updates and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your test results and progress
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional emails and special offers
                </p>
              </div>
              <Switch id="marketing-emails" />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="test-reminders">Test Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders to complete pending assessments
                </p>
              </div>
              <Switch id="test-reminders" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Manage your privacy settings and account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Make your profile and results visible to others
                </p>
              </div>
              <Switch id="profile-visibility" />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="data-analytics">Anonymous Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve our service with anonymous usage data
                </p>
              </div>
              <Switch id="data-analytics" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full">
              Download My Data
            </Button>
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-elegant border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
              Delete All Test Data
            </Button>
            <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
              Delete Account
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            These actions cannot be undone. Please be certain before proceeding.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;