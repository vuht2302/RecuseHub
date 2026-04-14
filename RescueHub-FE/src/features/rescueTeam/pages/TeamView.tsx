import React from "react";
import { Users } from "lucide-react";
import { TeamMember } from "../types/mission";

interface TeamViewProps {
  teamMembers: TeamMember[];
}

export const TeamView: React.FC<TeamViewProps> = ({ teamMembers }) => {
  return (
    <div className="col-span-1 xl:col-span-2 rounded-2xl bg-white border border-[#c8ced6] p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-blue-950 font-primary flex items-center gap-2">
          <Users size={24} />
          Trạng thái đội ngũ
        </h2>
        <p className="text-sm text-on-surface-variant mt-2">
          Quản lý và theo dõi tình trạng của các thành viên trong đội
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-sm font-semibold text-emerald-900">Sẵn sàng</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {teamMembers.filter((m) => m.status === "Available").length}
          </p>
        </div>
        <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
          <p className="text-sm font-semibold text-purple-900">Đang nhiệm vụ</p>
          <p className="text-3xl font-black text-purple-600 mt-1">
            {teamMembers.filter((m) => m.status === "On Mission").length}
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm font-semibold text-blue-900">Đang nghỉ ngơi</p>
          <p className="text-3xl font-black text-blue-600 mt-1">
            {teamMembers.filter((m) => m.status === "Rest").length}
          </p>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="overflow-x-auto rounded-xl border border-[#c7ced7]">
        <table className="w-full text-sm">
          <thead className="bg-[#f0f2f5] text-on-surface-variant">
            <tr className="text-left border-b border-[#c7ced7]">
              <th className="px-4 py-3 font-primary font-bold">Thành viên</th>
              <th className="px-4 py-3 font-primary font-bold">Vai trò</th>
              <th className="px-4 py-3 font-primary font-bold">Trạng thái</th>
              <th className="px-4 py-3 font-primary font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr
                key={member.id}
                className="border-t border-[#c7ced7] hover:bg-[#f9fafb]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-950 text-white grid place-items-center text-xs font-bold">
                      {member.avatar}
                    </div>
                    <span className="font-semibold text-on-surface">
                      {member.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-on-surface-variant">
                  {member.role}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      member.status === "Available"
                        ? "bg-emerald-100 text-emerald-700"
                        : member.status === "On Mission"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {member.status === "Available"
                      ? "Sẵn sàng"
                      : member.status === "On Mission"
                        ? "Đang nhiệm vụ"
                        : "Đang nghỉ"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-xs bg-blue-950 text-white px-3 py-1.5 rounded-lg font-bold font-primary hover:bg-blue-900"
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
