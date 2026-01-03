import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  Star,
  Loader2,
  Calendar,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--info))"];

export default function SellerAnalytics() {
  const navigate = useNavigate();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [period, setPeriod] = useState<"week" | "month">("week");

  // Fetch seller info
  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ["seller", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    if (period === "week") {
      return { start: subDays(now, 7), end: now };
    }
    return { start: startOfMonth(now), end: endOfMonth(now) };
  };

  const dateRange = getDateRange();

  // Fetch orders for analytics
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["seller-analytics-orders", seller?.id, period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", seller!.id)
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!seller?.id,
  });

  // Fetch all-time orders for comparison
  const { data: allTimeOrders } = useQuery({
    queryKey: ["seller-all-orders", seller?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at")
        .eq("seller_id", seller!.id);

      if (error) throw error;
      return data;
    },
    enabled: !!seller?.id,
  });

  // Fetch top products
  const { data: topProducts } = useQuery({
    queryKey: ["seller-top-products", seller?.id],
    queryFn: async () => {
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select(`
          product_id,
          product_name,
          quantity,
          subtotal,
          orders!inner(seller_id, status)
        `)
        .eq("orders.seller_id", seller!.id)
        .eq("orders.status", "delivered");

      if (error) throw error;

      // Aggregate by product
      const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
      orderItems?.forEach((item) => {
        const existing = productMap.get(item.product_id) || { name: item.product_name, quantity: 0, revenue: 0 };
        productMap.set(item.product_id, {
          name: item.product_name,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.subtotal,
        });
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
    enabled: !!seller?.id,
  });

  // Fetch reviews
  const { data: reviews } = useQuery({
    queryKey: ["seller-reviews", seller?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("seller_id", seller!.id);

      if (error) throw error;
      return data;
    },
    enabled: !!seller?.id,
  });

  // Redirect non-sellers
  if (!authLoading && (!user || (userRole !== "seller" && userRole !== "admin"))) {
    navigate("/auth");
    return null;
  }

  if (!authLoading && !sellerLoading && !seller) {
    navigate("/seller/register");
    return null;
  }

  const isLoading = sellerLoading || ordersLoading;

  // Calculate stats
  const calculateStats = () => {
    if (!orders) return { totalSales: 0, totalOrders: 0, avgOrderValue: 0, deliveredOrders: 0 };

    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    const totalSales = deliveredOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = deliveredOrders.length > 0 ? totalSales / deliveredOrders.length : 0;

    return { totalSales, totalOrders, avgOrderValue, deliveredOrders: deliveredOrders.length };
  };

  const stats = calculateStats();

  // Calculate previous period for comparison
  const calculateGrowth = () => {
    if (!allTimeOrders) return { salesGrowth: 0, ordersGrowth: 0 };
    
    const previousStart = period === "week" ? subDays(dateRange.start, 7) : subDays(dateRange.start, 30);
    const previousEnd = dateRange.start;

    const currentOrders = allTimeOrders.filter(
      (o) => new Date(o.created_at) >= dateRange.start && new Date(o.created_at) <= dateRange.end
    );
    const previousOrders = allTimeOrders.filter(
      (o) => new Date(o.created_at) >= previousStart && new Date(o.created_at) < previousEnd
    );

    const currentSales = currentOrders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total_amount, 0);
    const previousSales = previousOrders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total_amount, 0);

    const salesGrowth = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;
    const ordersGrowth = previousOrders.length > 0 ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;

    return { salesGrowth, ordersGrowth };
  };

  const growth = calculateGrowth();

  // Prepare chart data - Sales by day
  const prepareSalesChartData = () => {
    if (!orders) return [];

    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return days.map((day) => {
      const dayOrders = orders.filter(
        (o) => format(new Date(o.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd") && o.status === "delivered"
      );
      return {
        date: format(day, period === "week" ? "EEE" : "MMM d"),
        sales: dayOrders.reduce((sum, o) => sum + o.total_amount, 0),
        orders: dayOrders.length,
      };
    });
  };

  const salesChartData = prepareSalesChartData();

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

  // Rating distribution
  const prepareRatingData = () => {
    if (!reviews) return [];

    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
    });

    return Object.entries(ratingCounts).map(([rating, count]) => ({
      rating: `${rating} Star`,
      count,
    }));
  };

  const ratingData = prepareRatingData();
  const avgRating = reviews?.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  return (
    <DashboardLayout userRole="seller">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your shop's performance</p>
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
                    <Badge variant={growth.salesGrowth >= 0 ? "success" : "destructive"} className="text-xs">
                      {growth.salesGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(growth.salesGrowth).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">₹{stats.totalSales.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
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
                      <Package className="w-5 h-5 text-success" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">₹{stats.avgOrderValue.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-warning" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{avgRating}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating ({reviews?.length || 0} reviews)</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sales Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>Daily revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {salesChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                        <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`₹${value}`, "Sales"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No sales data for this period
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Orders by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>Distribution of orders by status</CardDescription>
                </CardHeader>
                <CardContent>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {statusData.map((_, index) => (
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
                      No orders for this period
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best selling products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  {topProducts && topProducts.length > 0 ? (
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                            </div>
                          </div>
                          <p className="font-semibold">₹{product.revenue.toLocaleString()}</p>
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

              {/* Rating Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>Customer ratings breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {ratingData.some((r) => r.count > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={ratingData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                        <YAxis dataKey="rating" type="category" width={60} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                      No reviews yet
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
