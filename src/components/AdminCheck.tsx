import { useAdminCheck } from "@/hooks/useAdminCheck";

interface AdminCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminCheck = ({ children, fallback = null }: AdminCheckProps) => {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};