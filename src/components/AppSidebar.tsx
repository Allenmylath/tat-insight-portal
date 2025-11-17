import { NavLink, useLocation } from "react-router-dom";
import { Settings, CreditCard, CheckCircle2, Clock, XCircle, BarChart3, Trophy, Crown, Lock, Image, Coins, LogOut, RefreshCw, Receipt, Star, Zap, Mail } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/hooks/useUserData";
import { useTestContext } from "@/contexts/TestContext";
import { CreditHeader } from "@/components/CreditHeader";
import { AdminCheck } from "@/components/AdminCheck";

const navigationItems = [
  { 
    title: "Overview", 
    url: "/dashboard", 
    icon: BarChart3,
    exact: true
  },
  { 
    title: "Detailed Test Analysis", 
    url: "/dashboard/attempted", 
    icon: CheckCircle2 
  },
  { 
    title: "Pending Tests", 
    url: "/dashboard/pending", 
    icon: Clock 
  },
  { 
    title: "Abandoned Tests", 
    url: "/dashboard/abandoned", 
    icon: XCircle 
  },
  { 
    title: "Overall Summary", 
    url: "/dashboard/results", 
    icon: Trophy 
  },
];

const settingsItems = [
  { 
    title: "Pricing & Plans", 
    url: "/dashboard/pricing", 
    icon: CreditCard 
  },
  { 
    title: "Transactions", 
    url: "/dashboard/transactions", 
    icon: Receipt 
  },
  { 
    title: "Payment Reconciliation", 
    url: "/dashboard/reconciliation", 
    icon: RefreshCw 
  },
  { 
    title: "Settings", 
    url: "/dashboard/settings", 
    icon: Settings 
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isPro, loading, userData } = useUserData();
  const { activeTest, isTestActive } = useTestContext();
  const { signOut } = useClerk();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (active: boolean) =>
    active 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r">
        {/* Header */}
        {(!isCollapsed || isMobile) && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-saffron rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-gradient-foreground" />
              </div>
              <h2 className="font-semibold text-foreground">TAT Portal</h2>
            </div>
            <div className="space-y-2">
              {!loading && (
                <Badge variant={isPro ? "default" : "secondary"} className="gap-1">
                  {isPro ? <Crown className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {isPro ? "Pro Member" : "Free Plan"}
                </Badge>
              )}
              <CreditHeader />
            </div>
          </div>
        )}

        {/* Active Test Image */}
        {isTestActive && activeTest && (!isCollapsed || isMobile) && (
          <div className="p-4 border-b">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Active Test</h3>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img 
                  src={activeTest.image_url} 
                  alt={activeTest.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">{activeTest.title}</p>
                <p className="line-clamp-2">{activeTest.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={() => getNavCls(isActive(item.url, item.exact))}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={() => getNavCls(isActive(item.url))}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => signOut()}
                  className="hover:bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {(!isCollapsed || isMobile) && <span>Sign Out</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Earn Free Credits CTA - Show when credits = 0 */}
        {(!isCollapsed || isMobile) && !loading && userData && userData.credit_balance === 0 && (
          <div className="mt-auto p-4 border-t">
            <div className="bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-yellow-400/10 border-2 border-yellow-500/40 rounded-lg p-3 relative overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent animate-shimmer"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-pulse">
                    <Star className="h-4 w-4 text-white fill-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Earn ₹100 Free!</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Share tattests.me on social media & get instant credits
                </p>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-1 font-semibold shadow-md"
                  onClick={() => {
                    const message = `Hi! I want to earn ₹100 credits.\n\nEmail: ${userData?.email}`;
                    window.open(`https://wa.me/918921635144?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  <Zap className="h-3 w-3" />
                  Claim Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA for Free Users */}
        {(!isCollapsed || isMobile) && !isPro && !loading && (
          <div className="mt-auto p-4 border-t">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Unlock all tests and detailed analysis
              </p>
              <NavLink 
                to="/dashboard/pricing"
                className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground h-8 px-3 w-full"
              >
                View Plans
              </NavLink>
            </div>
          </div>
        )}

      </SidebarContent>
    </Sidebar>
  );
}