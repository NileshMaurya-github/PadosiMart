import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingCart,
  Store,
  Users,
  Star,
  Loader2,
  Calendar,
  Package,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--info))"];

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [period, setPeriod] = useState<"week" | "month">("week");

  // Redirect if not admin
  if (!authLoading && (!user || userRole !== "admin")) {
    navigate("/");
    return null;
  }

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    if (period === "week") {
      return { start: subDays(now, 7), end: now };
    }
    return { start: startOfMonth(now), end: endOfMonth(now) };
  };

  const dateRange = getDateRange();

  // Fetch all orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-analytics-orders", period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user && userRole === "admin",
  });

  // Fetch all-time orders for comparison
  const { data: allTimeOrders } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at, seller_id");

      if (error) throw error;
      return data;
    },
    enabled: !!user && userRole === "admin",
  });

  // Fetch sellers
  const { data: sellers } = useQuery({
    queryKey: ["admin-sellers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("id, shop_name, category, rating, review_count, is_approved, is_active, created_at");

      if (error) throw error;
      return data;
    },
    enabled: !!user && userRole === "admin",
  });

  // Fetch products count
  const { data: productsCount } = useQuery({
    queryKey: ["admin-products-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user && userRole === "admin",
  });

  // Fetch users count (profiles)
  const { data: usersCount } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user && userRole === "admin",
  });

  const isLoading = ordersLoading;

  // Calculate stats
  const calculateStats = () => {
    if (!orders) return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, commission: 0 };

    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;
    const commission = totalRevenue * 0.01; // 1% commission

    return { totalRevenue, totalOrders, avgOrderValue, commission };
  };

  const stats = calculateStats();

  // Calculate growth
  const calculateGrowth = () => {
    if (!allTimeOrders) return { revenueGrowth: 0, ordersGrowth: 0 };

    const previousStart = period === "week" ? subDays(dateRange.start, 7) : subDays(dateRange.start, 30);
    const previousEnd = dateRange.start;

    const currentOrders = allTimeOrders.filter(
      (o) => new Date(o.created_at) >= dateRange.start && new Date(o.created_at) <= dateRange.end
    );
    const previousOrders = allTimeOrders.filter(
      (o) => new Date(o.created_at) >= previousStart && new Date(o.created_at) < previousEnd
    );

    const currentRevenue = currentOrders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total_amount, 0);
    const previousRevenue = previousOrders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total_amount, 0);

    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const ordersGrowth = previousOrders.length > 0 ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;

    return { revenueGrowth, ordersGrowth };
  };

  const growth = calculateGrowth();

  // Prepare revenue chart data
  const prepareRevenueChartData = () => {
    if (!orders) return [];

    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return days.map((day) => {
      const dayOrders = orders.filter(
        (o) => format(new Date(o.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd") && o.status === "delivered"
      );
      return {
        date: format(day, period === "week" ? "EEE" : "MMM d"),
        revenue: dayOrders.reduce((sum, o) => sum + o.total_amount, 0),
        orders: dayOrders.length,
      };
    });
  };

  const revenueChartData = prepareRevenueChartData();

  // Category distribution
  const prepareCategoryData = () => {
    if (!sellers) return [];

    const categoryCounts: Record<string, number> = {};
    sellers.filter((s) => s.is_approved && s.is_active).forEach((s) => {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });

    const categoryLabels: Record<string, string> = {
      grocery: "Grocery",
      medical: "Medical",
      electronics: "Electronics",
      clothing: "Clothing",
      food: "Food",
      services: "Services",
      other: "Other",
    };

    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: categoryLabels[category] || category,
      value: count,
    }));
  };

  const categoryData = prepareCategoryData();

  // Top sellers by revenue
  const prepareTopSellers = () => {
    if (!allTimeOrders || !sellers) return [];

    const sellerRevenue: Record<string, { revenue: number; orders: number }> = {};
    allTimeOrders.filter((o) => o.status === "delivered").forEach((o) => {
      const existing = sellerRevenue[o.seller_id] || { revenue: 0, orders: 0 };
      sellerRevenue[o.seller_id] = {
        revenue: existing.revenue + o.total_amount,
        orders: existing.orders + 1,
      };
    });

    return sellers
      .filter((s) => s.is_approved && s.is_active && sellerRevenue[s.id])
      .map((s) => ({
        id: s.id,
        name: s.shop_name,
        rating: s.rating,
        reviewCount: s.review_count,
        ...sellerRevenue[s.id],
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const topSellers = prepareTopSellers();

  // Order status distribution
  const prepareStatusData = () => {
    if (!orders) return [];

    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const statusLabels: Record<string, string> = {
      pending: "Pending",
      accepted: "Accepted",
      packed: "Packed",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }));
  };

  const statusData = prepareStatusData();

  // Active sellers count
  const activeSellers = sellers?.filter((s) => s.is_approved && s.is_active).length || 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Platform Analytics</h1>
            <p className="text-muted-foreground">Monitor platform-wide performance</p>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
            <TabsList>
              <TabsTrigger value="week">
                <Calendar className="w-4 h-4 mr-2" />
                This Week
              </TabsTrigger>
              <TabsTrigger value="month">
                <Calendar className="w-4 h-4 mr-2" />
                This Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant={growth.revenueGrowth >= 0 ? "success" : "destructive"} className="text-xs">
                      {growth.revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(growth.revenueGrowth).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <Badge variant={growth.ordersGrowth >= 0 ? "success" : "destructive"} className="text-xs">
                      {growth.ordersGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(growth.ordersGrowth).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Store className="w-5 h-5 text-success" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{activeSellers}</p>
                  <p className="text-sm text-muted-foreground">Active Sellers</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-warning" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      1% rate
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">₹{stats.commission.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Commission Earned</p>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{usersCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{productsCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹{stats.avgOrderValue.toFixed(0)}</p>
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Platform revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                        <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`₹${value}`, "Revenue"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No revenue data for this period
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Seller Categories</CardTitle>
                  <CardDescription>Distribution of active sellers by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No sellers data
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Sellers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Sellers</CardTitle>
                  <CardDescription>Sellers ranked by total revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  {topSellers.length > 0 ? (
                    <div className="space-y-4">
                      {topSellers.map((seller, index) => (
                        <div key={seller.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium truncate max-w-[180px]">{seller.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{seller.orders} orders</span>
                                {seller.rating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-warning text-warning" />
                                    {seller.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="font-semibold">₹{seller.revenue.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                      No sales data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>Distribution of orders by status</CardDescription>
                </CardHeader>
                <CardContent>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                        <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                      No orders for this period
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
