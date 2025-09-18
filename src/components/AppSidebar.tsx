import { NavLink, useLocation } from "react-router-dom";
import { Settings, CreditCard, CheckCircle2, Clock, BarChart3, Trophy, Crown, Lock, Image, Coins } from "lucide-react";
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

const navigationItems = [
  { 
    title: "Overview", 
    url: "/dashboard", 
    icon: BarChart3,
    exact: true
  },
  { 
    title: "Attempted Tests", 
    url: "/dashboard/attempted", 
    icon: CheckCircle2 
  },
  { 
    title: "Pending Tests", 
    url: "/dashboard/pending", 
    icon: Clock 
  },
  { 
    title: "Results & Analysis", 
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
    title: "Settings", 
    url: "/dashboard/settings", 
    icon: Settings 
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isPro, loading } = useUserData();
  const { activeTest, isTestActive } = useTestContext();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

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
        {!isCollapsed && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-saffron rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
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
        {isTestActive && activeTest && !isCollapsed && (
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
                      {!isCollapsed && <span>{item.title}</span>}
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
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Upgrade CTA for Free Users */}
        {!isCollapsed && !isPro && !loading && (
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

        {/* Sidebar Toggle */}
        <div className="mt-auto p-2">
          <SidebarTrigger className="w-full" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}