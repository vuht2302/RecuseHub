import React from "react";
import { BadgeCheck, CalendarClock, Phone, ShieldUser, UserRound } from "lucide-react";
import { getAuthSession } from "../../auth/services/authStorage";

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const roleLabelMap: Record<string, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý",
  COORDINATOR: "Điều phối viên",
  TEAM_LEADER: "Đội trưởng cứu hộ",
  TEAM_MEMBER: "Thành viên cứu hộ",
};

export const CitizenProfilePage: React.FC = () => {
  const authSession = getAuthSession();
  const user = authSession?.user;

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Hồ sơ công dân
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            {user?.displayName || "Công dân"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Quản lý thông tin tài khoản và phiên đăng nhập.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
          <BadgeCheck size={16} />
          Đang hoạt động
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <UserRound size={14} />
            Họ và tên
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">
            {user?.displayName || "-"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <Phone size={14} />
            Số điện thoại
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">
            {user?.phone || "-"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <ShieldUser size={14} />
            Vai trò
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">
            {user?.roles?.length
              ? user.roles.map((role) => roleLabelMap[role] || role).join(", ")
              : "Công dân"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <CalendarClock size={14} />
            Hết hạn phiên
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">
            {formatDateTime(authSession?.expiresAt || "")}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Mã tài khoản
        </p>
        <p className="mt-1 break-all text-sm font-semibold text-slate-800">
          {user?.id || "-"}
        </p>
      </div>
    </section>
  );
};
