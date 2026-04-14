import React from "react";
import { BookText } from "lucide-react";

export const ReportsView: React.FC = () => {
  return (
    <div className="col-span-1 xl:col-span-2 rounded-2xl bg-white border border-[#c8ced6] p-6 flex items-center justify-center h-full">
      <div className="text-center">
        <BookText size={48} className="mx-auto text-blue-950 mb-3" />
        <p className="text-lg font-black text-blue-950 font-primary">Báo cáo</p>
        <p className="text-sm text-on-surface-variant mt-2">
          Xem chi tiết báo cáo hoạt động của đội
        </p>
      </div>
    </div>
  );
};
