import React, { useEffect, useState } from "react";
import {
  getSystemSettings,
  updateSystemSettings,
} from "@/src/shared/services/systemSetting.service";

const SystemSettingsPage = () => {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ===== LOAD =====
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getSystemSettings();
      setForm(data);
    } catch (err) {
      console.error(err);
      alert("Load settings thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===== HANDLE CHANGE =====
  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ===== SAVE =====
  const handleSave = async () => {
    try {
      setSaving(true);

      await updateSystemSettings({
        otpTtlMinutes: Number(form.otpTtlMinutes),
        accessTokenExpiryMinutes: Number(form.accessTokenExpiryMinutes),
        refreshTokenExpiryHours: Number(form.refreshTokenExpiryHours),
        publicMapCacheSeconds: Number(form.publicMapCacheSeconds),
        publicHotline: form.publicHotline,
      });

      alert("Lưu thành công");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black">Cấu hình hệ thống</h1>
        <p className="text-gray-600 text-sm">
          Quản lý các thông số vận hành hệ thống
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow space-y-6 max-w-2xl">
        {/* OTP */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            OTP TTL (phút)
          </label>
          <input
            type="number"
            value={form.otpTtlMinutes}
            onChange={(e) =>
              handleChange("otpTtlMinutes", e.target.value)
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* ACCESS TOKEN */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Access Token Expiry (phút)
          </label>
          <input
            type="number"
            value={form.accessTokenExpiryMinutes}
            onChange={(e) =>
              handleChange(
                "accessTokenExpiryMinutes",
                e.target.value
              )
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* REFRESH TOKEN */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Refresh Token Expiry (giờ)
          </label>
          <input
            type="number"
            value={form.refreshTokenExpiryHours}
            onChange={(e) =>
              handleChange(
                "refreshTokenExpiryHours",
                e.target.value
              )
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* CACHE */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Map Cache (giây)
          </label>
          <input
            type="number"
            value={form.publicMapCacheSeconds}
            onChange={(e) =>
              handleChange(
                "publicMapCacheSeconds",
                e.target.value
              )
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* HOTLINE */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Hotline công khai
          </label>
          <input
            value={form.publicHotline}
            onChange={(e) =>
              handleChange("publicHotline", e.target.value)
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* UPDATED */}
        <div className="text-xs text-gray-400">
          Cập nhật lần cuối:{" "}
          {new Date(form.updatedAt).toLocaleString()}
        </div>

        {/* ACTION */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-950 text-white px-4 py-2 rounded-lg"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;