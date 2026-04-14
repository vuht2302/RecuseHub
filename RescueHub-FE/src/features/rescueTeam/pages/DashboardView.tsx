import React from "react";
import {
  FolderKanban,
  AlertCircle,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";
import { Mission, MissionStatus } from "../types/mission";

interface DashboardViewProps {
  missions: Mission[];
  statusMap: Record<string, MissionStatus>;
  priorityStyles: Record<string, string>;
  statusStyles: Record<string, string>;
  onMissionClick: (missionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  missions,
  statusMap,
  priorityStyles,
  statusStyles,
  onMissionClick,
}) => {
  return (
    <div className="col-span-1 xl:col-span-2 space-y-4 overflow-auto">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-semibold">Tổng nhiệm vụ</p>
              <p className="text-4xl font-black mt-2">{missions.length}</p>
            </div>
            <FolderKanban size={40} className="opacity-20" />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-semibold">Chưa nhận</p>
              <p className="text-4xl font-black mt-2">
                {
                  missions.filter(
                    (m) => (statusMap[m.id] ?? "Chờ nhận") === "Chờ nhận",
                  ).length
                }
              </p>
            </div>
            <AlertCircle size={40} className="opacity-20" />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-semibold">Đang thực hiện</p>
              <p className="text-4xl font-black mt-2">
                {
                  missions.filter((m) =>
                    ["Đang di chuyển", "Đang xử lý"].includes(
                      statusMap[m.id] ?? "Chờ nhận",
                    ),
                  ).length
                }
              </p>
            </div>
            <Clock size={40} className="opacity-20" />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-semibold">Hoàn tất</p>
              <p className="text-4xl font-black mt-2">
                {
                  missions.filter(
                    (m) => (statusMap[m.id] ?? "Chờ nhận") === "Đã hoàn tất",
                  ).length
                }
              </p>
            </div>
            <CheckCircle size={40} className="opacity-20" />
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* New Missions */}
        <div className="rounded-2xl bg-white border border-[#c8ced6] p-6 shadow-md">
          <h3 className="text-lg font-black text-blue-950 font-primary flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            Nhiệm vụ mới
          </h3>

          <div className="mt-4 space-y-3">
            {missions
              .filter((m) => statusMap[m.id] === "Chờ nhận")
              .map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => onMissionClick(mission.id)}
                  className="w-full text-left rounded-xl border border-amber-200 bg-amber-50 p-3 hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm text-blue-950 truncate">
                        {mission.code}
                      </p>
                      <p className="text-xs text-amber-700 mt-1 line-clamp-2">
                        {mission.title}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap ${priorityStyles[mission.priority]}`}
                    >
                      {mission.priority}
                    </span>
                  </div>
                </button>
              ))}

            {missions.filter((m) => statusMap[m.id] === "Chờ nhận").length ===
              0 && (
              <p className="text-sm text-on-surface-variant text-center py-4">
                Không có nhiệm vụ mới
              </p>
            )}
          </div>
        </div>

        {/* Running Missions */}
        <div className="rounded-2xl bg-white border border-[#c8ced6] p-6 shadow-md">
          <h3 className="text-lg font-black text-blue-950 font-primary flex items-center gap-2">
            <Activity size={20} className="text-purple-500" />
            Đang thực hiện
          </h3>

          <div className="mt-4 space-y-3">
            {missions
              .filter((m) =>
                ["Đang di chuyển", "Đang xử lý"].includes(
                  statusMap[m.id] ?? "Chờ nhận",
                ),
              )
              .map((mission) => {
                const mStatus = statusMap[mission.id] ?? "Chờ nhận";
                return (
                  <button
                    key={mission.id}
                    onClick={() => onMissionClick(mission.id)}
                    className="w-full text-left rounded-xl border border-purple-200 bg-purple-50 p-3 hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-sm text-blue-950 truncate">
                          {mission.code}
                        </p>
                        <p className="text-xs text-purple-700 mt-1">
                          {mStatus}
                        </p>
                      </div>
                      <div
                        className={`text-[10px] px-2 py-1 rounded-md font-semibold whitespace-nowrap ${statusStyles[mStatus]}`}
                      >
                        {mStatus}
                      </div>
                    </div>
                  </button>
                );
              })}

            {missions.filter((m) =>
              ["Đang di chuyển", "Đang xử lý"].includes(
                statusMap[m.id] ?? "Chờ nhận",
              ),
            ).length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-4">
                Không có nhiệm vụ đang chạy
              </p>
            )}
          </div>
        </div>

        {/* Completed Missions */}
        <div className="rounded-2xl bg-white border border-[#c8ced6] p-6 shadow-md">
          <h3 className="text-lg font-black text-blue-950 font-primary flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" />
            Hoàn tất
          </h3>

          <div className="mt-4 space-y-3">
            {missions
              .filter((m) => statusMap[m.id] === "Đã hoàn tất")
              .map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => onMissionClick(mission.id)}
                  className="w-full text-left rounded-xl border border-green-200 bg-green-50 p-3 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm text-blue-950 truncate">
                        {mission.code}
                      </p>
                      <p className="text-xs text-green-700 mt-1 line-clamp-2">
                        {mission.title}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

            {missions.filter((m) => statusMap[m.id] === "Đã hoàn tất")
              .length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-4">
                Không có nhiệm vụ hoàn tất
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
