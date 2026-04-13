export type MissionStatus =
  | "assigned"
  | "accepted"
  | "in-progress"
  | "completed";

export interface MissionItem {
  id: string;
  title: string;
  area: string;
  status: MissionStatus;
}
