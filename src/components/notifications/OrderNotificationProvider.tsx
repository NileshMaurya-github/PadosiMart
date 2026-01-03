import { useOrderNotifications } from "@/hooks/useOrderNotifications";

export function OrderNotificationProvider() {
  useOrderNotifications();
  return null;
}
