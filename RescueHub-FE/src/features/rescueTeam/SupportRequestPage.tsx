import React, { useState } from "react";
import { createSupportRequest } from "@/src/shared/services/supportRequest.service";
import { Send } from "lucide-react";

const SupportRequestPage = () => {
  const [missionId, setMissionId] = useState("");
  const [supportTypeCode, setSupportTypeCode] = useState("");
  const [detailNote, setDetailNote] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!missionId || !supportTypeCode) {
      alert("Nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);

      await createSupportRequest(missionId, {
        supportTypeCode,
        detailNote,
      });

      alert("Gửi yêu cầu hỗ trợ thành công!");

      // reset
      setSupportTypeCode("");
      setDetailNote("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black">
          Yêu cầu hỗ trợ nhiệm vụ
        </h1>
        <p className="text-gray-500 text-sm">
          Gửi yêu cầu hỗ trợ cho mission đang thực hiện
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        {/* MISSION ID */}
        <div>
          <label className="text-sm text-gray-600">
            Mission ID
          </label>
          <input
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
            placeholder="Nhập missionId..."
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* SUPPORT TYPE */}
        <div>
          <label className="text-sm text-gray-600">
            Loại hỗ trợ
          </label>
          <input
            value={supportTypeCode}
            onChange={(e) => setSupportTypeCode(e.target.value)}
            placeholder="VD: FOOD, MEDICAL..."
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* NOTE */}
        <div>
          <label className="text-sm text-gray-600">
            Ghi chú
          </label>
          <textarea
            value={detailNote}
            onChange={(e) => setDetailNote(e.target.value)}
            placeholder="Mô tả chi tiết..."
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* ACTION */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-blue-950 hover:bg-blue-800 text-white py-2 rounded-lg transition disabled:opacity-50"
        >
          <Send size={16} />
          {loading ? "Đang gửi..." : "Gửi yêu cầu"}
        </button>
      </div>
    </div>
  );
};

export default SupportRequestPage;