import React from "react";
import { Mission, MissionStatus } from "../types/mission";

interface MissionsViewProps {
  missions: Mission[];
  statusMap: Record<string, MissionStatus>;
  priorityStyles: Record<string, string>;
  statusStyles: Record<string, string>;
  onAcceptMission: (missionId: string) => void;
  onViewMission: (missionId: string, status: MissionStatus) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  missions,
  statusMap,
  priorityStyles,
  statusStyles,
  onAcceptMission,
  onViewMission,
}) => {
  return (
    <div className="col-span-1 xl:col-span-2 rounded-2xl bg-white border border-[#c8ced6] p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-blue-950 font-primary">
          Danh sách nhiệm vụ hiện tại
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Quản lý và theo dõi các nhiệm vụ cứu hộ / cứu trợ
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#c7ced7]">
        <table className="w-full text-sm">
          <thead className="bg-[#f0f2f5] text-on-surface-variant">
            <tr className="text-left border-b border-[#c7ced7]">
              <th className="px-4 py-3 font-primary font-bold">Mã</th>
              <th className="px-4 py-3 font-primary font-bold">Loại</th>
              <th className="px-4 py-3 font-primary font-bold">Nhiệm vụ</th>
              <th className="px-4 py-3 font-primary font-bold">Địa chỉ</th>
              <th className="px-4 py-3 font-primary font-bold">Yêu cầu</th>
              <th className="px-4 py-3 font-primary font-bold">Ưu tiên</th>
              <th className="px-4 py-3 font-primary font-bold">Trạng thái</th>
              <th className="px-4 py-3 font-primary font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => {
              const missionStatus = statusMap[mission.id] ?? "Chờ nhận";

              return (
                <tr
                  key={mission.id}
                  className="border-t border-[#c7ced7] hover:bg-[#f9fafb]"
                >
                  <td className="px-4 py-3 font-primary font-black text-blue-950">
                    {mission.code}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        mission.type === "Cứu hộ"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {mission.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-on-surface">
                      {mission.title}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">
                    {mission.address}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {mission.requester}
                    <br />
                    <span className="text-xs text-on-surface-variant">
                      {mission.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${priorityStyles[mission.priority]}`}
                    >
                      {mission.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-semibold ${statusStyles[missionStatus]}`}
                    >
                      {missionStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {missionStatus === "Chờ nhận" ? (
                      <button
                        type="button"
                        onClick={() => {
                          onAcceptMission(mission.id);
                        }}
                        className="text-xs bg-blue-950 text-white px-3 py-1.5 rounded-lg font-bold font-primary hover:bg-blue-900"
                      >
                        Nhận và xem
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onViewMission(mission.id, missionStatus);
                        }}
                        className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold"
                      >
                        Xem chi tiết
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm font-semibold text-blue-900">Tổng nhiệm vụ</p>
          <p className="text-3xl font-black text-blue-950 mt-1">
            {missions.length}
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm font-semibold text-amber-900">Chờ nhận</p>
          <p className="text-3xl font-black text-amber-700 mt-1">
            {
              missions.filter(
                (m) => (statusMap[m.id] ?? "Chờ nhận") === "Chờ nhận",
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
};
