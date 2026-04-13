export interface RescueRequestForm {
  incidentType: "medical" | "lost";
  urgency: "routine" | "high" | "critical";
}
