import { useState, useMemo } from "react";
import { useUserData } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpCircle, ArrowDownCircle, Calendar as CalendarIcon, Download, Search, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CreditTransaction {
  id: string;
  transaction_type: string;
  credits_change: number;
  balance_after: number;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
  payment_metadata: any;
}

export default function Transactions() {
  const { userData } = useUserData();
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["credit-transactions", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];
      
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CreditTransaction[];
    },
    enabled: !!userData?.id,
  });

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(t => t.transaction_type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.transaction_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.created_at);
        const fromDate = new Date(dateRange.from!);
        fromDate.setHours(0, 0, 0, 0);
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          return transactionDate >= fromDate && transactionDate <= toDate;
        }
        
        return transactionDate >= fromDate;
      });
    }

    return filtered;
  }, [transactions, filterType, searchQuery, dateRange]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalCredits = transactions
      .filter(t => t.transaction_type === 'purchase')
      .reduce((sum, t) => sum + t.credits_change, 0);
    
    const totalSpent = Math.abs(
      transactions
        .filter(t => t.transaction_type === 'test_usage')
        .reduce((sum, t) => sum + t.credits_change, 0)
    );
    
    return {
      totalCredits,
      totalSpent,
      netBalance: totalCredits - totalSpent,
    };
  }, [transactions]);

  const getTransactionIcon = (type: string, change: number) => {
    if (change > 0) {
      return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
    }
    return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Purchase</Badge>;
      case 'test_usage':
        return <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Test Usage</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
        <p className="text-muted-foreground mt-1">View all your credit purchases and usage</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.credit_balance || 0}</div>
            <p className="text-xs text-muted-foreground">Available credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.totalCredits}</div>
            <p className="text-xs text-muted-foreground">Credits purchased</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{stats.totalSpent}</div>
            <p className="text-xs text-muted-foreground">Credits used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.netBalance}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings - usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Filter and search through your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    "Filter by date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                  onSelect={(range) => setDateRange(range || {})}
                  initialFocus
                  className="pointer-events-auto"
                />
                <div className="p-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDateRange({})}
                    className="w-full"
                  >
                    Clear dates
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tabs for filtering */}
          <Tabs value={filterType} onValueChange={setFilterType} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="purchase">Purchases</TabsTrigger>
              <TabsTrigger value="test_usage">Deductions</TabsTrigger>
            </TabsList>

            <TabsContent value={filterType} className="mt-6">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Credits Change</TableHead>
                        <TableHead className="text-right">Balance After</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {format(new Date(transaction.created_at), "MMM dd, yyyy 'at' h:mm a")}
                          </TableCell>
                          <TableCell>
                            {getTransactionBadge(transaction.transaction_type)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.transaction_type, transaction.credits_change)}
                              <span className="text-sm">{transaction.description || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-semibold",
                              transaction.credits_change > 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {transaction.credits_change > 0 ? "+" : ""}{transaction.credits_change}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {transaction.balance_after}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
