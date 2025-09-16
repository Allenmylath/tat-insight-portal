import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Mail, Bell, Shield, Trash2, Crown, Calendar, Settings as SettingsIcon } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useUser } from "@clerk/clerk-react";
import { AdminTatTestCreator } from "@/components/AdminTatTestCreator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Settings = () => {
  const { userData, isPro } = useUserData();
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      await user.delete();
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and account settings
        </p>
      </div>

      {/* Admin Tools */}
      <Card className="shadow-elegant border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Admin Tools
          </CardTitle>
          <CardDescription>
            Administrative functions for managing TAT tests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <Button 
              onClick={async () => {
                try {
                  const { data, error } = await supabase
                    .from('tattest')
                    .insert({
                      title: "Debug Test",
                      description: "Testing database connectivity",
                      prompt_text: "Debug test prompt",
                      image_url: "/src/assets/tatim.jpeg",
                      is_active: true
                    })
                    .select()
                    .single();

                  if (error) throw error;
                  alert('Test created successfully!');
                } catch (error: any) {
                  alert('Error: ' + error.message);
                  console.error('Database error:', error);
                }
              }}
              variant="outline"
              size="sm"
            >
              Test Database Connection
            </Button>
          </div>
          <AdminTatTestCreator />
        </CardContent>
      </Card>

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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers, including:
                    <br />
                    <br />
                    • Your profile information
                    <br />
                    • All test results and analysis data
                    <br />
                    • Your membership status and purchase history
                    <br />
                    • All associated preferences and settings
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Yes, delete my account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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