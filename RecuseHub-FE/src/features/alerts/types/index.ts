export interface AlertItem {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
}
