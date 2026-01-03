import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  IndianRupee,
  Percent,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Total Sales",
    value: "₹45,231",
    change: "+12.5%",
    trend: "up",
    icon: IndianRupee,
  },
  {
    title: "Orders",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    value: "48",
    change: "+3",
    trend: "up",
    icon: Package,
  },
  {
    title: "Commission Due",
    value: "₹452",
    change: "1%",
    trend: "neutral",
    icon: Percent,
  },
];

const recentOrders = [
  { id: "ORD-001", customer: "Raj Kumar", items: 3, total: 456, status: "delivered", time: "2 hours ago" },
  { id: "ORD-002", customer: "Priya Singh", items: 1, total: 199, status: "out_for_delivery", time: "3 hours ago" },
  { id: "ORD-003", customer: "Amit Patel", items: 5, total: 1250, status: "packed", time: "5 hours ago" },
  { id: "ORD-004", customer: "Sneha Sharma", items: 2, total: 389, status: "accepted", time: "6 hours ago" },
];

const statusColors: Record<string, "success" | "warning" | "info" | "secondary"> = {
  delivered: "success",
  out_for_delivery: "info",
  packed: "warning",
  accepted: "secondary",
};

const statusLabels: Record<string, string> = {
  delivered: "Delivered",
  out_for_delivery: "Out for Delivery",
  packed: "Packed",
  accepted: "Accepted",
};

export default function SellerDashboard() {
  return (
    <DashboardLayout
      userRole="seller"
      userName="Ramesh Kumar"
      shopName="Green Valley Grocers"
    >
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back, Ramesh!</h1>
        <p className="text-muted-foreground">Here's what's happening with your shop today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <Badge
                  variant={stat.trend === "up" ? "success" : stat.trend === "down" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {stat.trend === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
                  {stat.trend === "down" && <TrendingDown className="w-3 h-3 mr-1" />}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
          <Link to="/seller/products/new">
            <Package className="w-5 h-5" />
            <span>Add Product</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
          <Link to="/seller/orders">
            <ShoppingCart className="w-5 h-5" />
            <span>View Orders</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
          <Link to="/seller/analytics">
            <TrendingUp className="w-5 h-5" />
            <span>Analytics</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
          <Link to="/seller/analytics">
            <Percent className="w-5 h-5" />
            <span>Pay Commission</span>
          </Link>
        </Button>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest customer orders</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/seller/orders">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer} • {order.items} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">₹{order.total}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {order.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
