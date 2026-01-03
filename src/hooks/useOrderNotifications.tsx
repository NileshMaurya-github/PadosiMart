import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type OrderStatus = "pending" | "accepted" | "packed" | "out_for_delivery" | "delivered" | "cancelled";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusEmojis: Record<OrderStatus, string> = {
  pending: "🕐",
  accepted: "✅",
  packed: "📦",
  out_for_delivery: "🚚",
  delivered: "🎉",
  cancelled: "❌",
};

const statusMessages: Record<OrderStatus, string> = {
  pending: "Your order has been placed",
  accepted: "Your order has been accepted by the seller",
  packed: "Your order has been packed and is ready",
  out_for_delivery: "Your order is out for delivery",
  delivered: "Your order has been delivered",
  cancelled: "Your order has been cancelled",
};

export function useOrderNotifications() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const processedUpdates = useRef<Set<string>>(new Set());
  const permissionGranted = useRef(false);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      permissionGranted.current = true;
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      permissionGranted.current = permission === "granted";
      return permission === "granted";
    }

    return false;
  }, []);

  // Show both toast and browser notification
  const showNotification = useCallback((title: string, body: string) => {
    // Always show toast
    toast({
      title,
      description: body,
      duration: 5000,
    });

    // Show browser notification if permitted and tab is not focused
    if (
      permissionGranted.current && 
      "Notification" in window && 
      Notification.permission === "granted" &&
      document.hidden
    ) {
      try {
        const notification = new Notification(title, {
          body,
          icon: "/favicon.ico",
          tag: "order-update",
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.log("Notification error:", err);
      }
    }
  }, [toast]);

  // Get seller ID if user is a seller
  const { data: seller } = useQuery({
    queryKey: ["seller-for-notifications", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("sellers")
        .select("id, shop_name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && userRole === "seller",
  });

  useEffect(() => {
    if (!user) return;

    // Request permission on mount
    requestNotificationPermission();

    console.log("Setting up order notifications for user:", user.id, "role:", userRole);

    const channel = supabase
      .channel("order-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newOrder = payload.new as {
            id: string;
            order_number: string;
            status: OrderStatus;
            customer_id: string;
            seller_id: string;
          };
          const oldOrder = payload.old as { status: OrderStatus };

          // Prevent duplicate notifications
          const updateKey = `${newOrder.id}-${newOrder.status}`;
          if (processedUpdates.current.has(updateKey)) {
            return;
          }
          processedUpdates.current.add(updateKey);

          // Clean up old entries after some time
          setTimeout(() => {
            processedUpdates.current.delete(updateKey);
          }, 5000);

          // Only show notification if status actually changed
          if (oldOrder.status === newOrder.status) return;

          const isCustomer = newOrder.customer_id === user.id;
          const isSeller = seller?.id === newOrder.seller_id;

          console.log("Order update:", { 
            orderNumber: newOrder.order_number, 
            oldStatus: oldOrder.status, 
            newStatus: newOrder.status,
            isCustomer,
            isSeller 
          });

          // Notify customer about their order status
          if (isCustomer) {
            const emoji = statusEmojis[newOrder.status];
            const message = statusMessages[newOrder.status];
            showNotification(
              `${emoji} Order ${newOrder.order_number}`,
              message
            );
          }

          // Notify seller about new orders or cancellations
          if (isSeller && (newOrder.status === "pending" || newOrder.status === "cancelled")) {
            if (newOrder.status === "pending") {
              showNotification(
                "🔔 New Order!",
                `Order ${newOrder.order_number} has been placed`
              );
            } else if (newOrder.status === "cancelled") {
              showNotification(
                "❌ Order Cancelled",
                `Order ${newOrder.order_number} was cancelled`
              );
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newOrder = payload.new as {
            id: string;
            order_number: string;
            seller_id: string;
          };

          // Notify seller about new orders
          if (seller?.id === newOrder.seller_id) {
            console.log("New order for seller:", newOrder.order_number);
            showNotification(
              "🔔 New Order!",
              `Order ${newOrder.order_number} has been placed`
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("Order notifications subscription status:", status);
      });

    return () => {
      console.log("Cleaning up order notifications subscription");
      supabase.removeChannel(channel);
    };
  }, [user, userRole, seller, showNotification, requestNotificationPermission]);

  return { requestNotificationPermission };
}
