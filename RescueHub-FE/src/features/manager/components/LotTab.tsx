import React, { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, X, AlertCircle, Box } from "lucide-react";
import {
  getLots, createLot, updateLot, deleteLot,
  type Lot, type LotPayload,
} from "../services/warehouseService";
import { getAuthSession } from "../../../features/auth/services/authStorage";

const EMPTY: LotPayload = {
  itemId: "", lotNo: "", mfgDate: "", expDate: "", donorName: "", statusCode: "AVAILABLE",
};

function ConfirmDelete({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-600" /></div>
        <h3 className="text-lg font-bold text-center mb-1">Xóa lô hàng?</h3>
        <p className="text-sm text-gray-600 text-center mb-6">Xóa lô <strong>{name}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-sm">Hủy</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm disabled:opacity-60">{loading ? "Đang xóa..." : "Xóa"}</button>
        </div>
      </div>
    </div>
  );
}

function FormModal({ lot, onClose, onSaved }: { lot?: Lot | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<LotPayload>(lot ? {
    itemId: lot.item?.id ?? "", lotNo: lot.lotNo,
    mfgDate: lot.mfgDate ?? "", expDate: lot.expDate ?? "",
    donorName: lot.donorName ?? "", statusCode: lot.statusCode || "AVAILABLE",
  } : { ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.itemId.trim() || !form.lotNo.trim()) { setError("Vui lòng điền ID hàng hóa và số lô."); return; }
    setLoading(true); setError(null);
    try {
      const token = getAuthSession()?.accessToken ?? "";
      const payload = { ...form, mfgDate: form.mfgDate || undefined, expDate: form.expDate || undefined, donorName: form.donorName || undefined };
      if (lot) await updateLot(lot.id, payload, token);
      else await createLot(payload, token);
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Lỗi không xác định"); }
    finally { setLoading(false); }
  };

  const F = (key: keyof LotPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{lot ? "Chỉnh sửa lô hàng" : "Tạo lô hàng mới"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">ID Hàng hóa *</label>
            <input value={form.itemId} onChange={F("itemId")} placeholder="UUID của hàng hóa..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Số lô *</label>
            <input value={form.lotNo} onChange={F("lotNo")} placeholder="WATER-LOT-002" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Ngày sản xuất</label>
              <input type="date" value={form.mfgDate} onChange={F("mfgDate")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Ngày hết hạn</label>
              <input type="date" value={form.expDate} onChange={F("expDate")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Nhà tài trợ</label>
            <input value={form.donorName} onChange={F("donorName")} placeholder="Nhà tài trợ A" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Trạng thái</label>
            <select value={form.statusCode} onChange={F("statusCode")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="AVAILABLE">Có sẵn</option>
              <option value="RESERVED">Đã đặt</option>
              <option value="EXPIRED">Hết hạn</option>
              <option value="QUARANTINE">Cách ly</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-sm">Hủy</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)" }}>
            {loading ? "Đang lưu..." : lot ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

function lotStatusBadge(code: string) {
  const map: Record<string, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-700",
    RESERVED: "bg-blue-100 text-blue-700",
    EXPIRED: "bg-red-100 text-red-700",
    QUARANTINE: "bg-amber-100 text-amber-700",
  };
  const labels: Record<string, string> = {
    AVAILABLE: "Có sẵn", RESERVED: "Đặt trước",
    EXPIRED: "Hết hạn", QUARANTINE: "Cách ly",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[code] ?? "bg-gray-100 text-gray-600"}`}>{labels[code] ?? code}</span>;
}

export const LotTab: React.FC = () => {
  const [data, setData] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Lot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lot | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await getLots(getAuthSession()?.accessToken ?? "")); }
    catch (e) { setError(e instanceof Error ? e.message : "Lỗi tải lô hàng"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true);
    try { await deleteLot(deleteTarget.id, getAuthSession()?.accessToken ?? ""); setDeleteTarget(null); void load(); }
    catch (e) { alert(e instanceof Error ? e.message : "Lỗi xóa"); }
    finally { setDeleting(false); }
  };

  const isNearExpiry = (exp: string | null) => {
    if (!exp) return false;
    const diff = new Date(exp).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)" }}>
          <Plus size={15} /> Tạo lô hàng
        </button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Hàng hóa", "Số lô", "Ngày SX", "Ngày HH", "Nhà tài trợ", "Trạng thái", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center"><div className="flex flex-col items-center gap-2"><Box size={32} className="text-gray-300" /><p className="text-gray-400 text-sm">Chưa có lô hàng</p></div></td></tr>
            ) : data.map(lot => (
              <tr key={lot.id} className={`hover:bg-blue-50/30 transition-colors ${isNearExpiry(lot.expDate) ? "bg-amber-50/40" : ""}`}>
                <td className="px-4 py-3 font-semibold text-gray-800">{lot.item?.name || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold">{lot.lotNo}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{lot.mfgDate ? new Date(lot.mfgDate).toLocaleDateString("vi-VN") : "—"}</td>
                <td className="px-4 py-3 text-xs">
                  <span className={isNearExpiry(lot.expDate) ? "text-amber-600 font-bold" : "text-gray-600"}>
                    {lot.expDate ? new Date(lot.expDate).toLocaleDateString("vi-VN") : "—"}
                    {isNearExpiry(lot.expDate) && " ⚠️"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{lot.donorName || "—"}</td>
                <td className="px-4 py-3">{lotStatusBadge(lot.statusCode || "")}</td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <button onClick={() => { setEditTarget(lot); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteTarget(lot)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && <FormModal lot={editTarget} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); void load(); }} />}
      {deleteTarget && <ConfirmDelete name={deleteTarget.lotNo} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
      <p className="text-xs text-gray-400 text-right">{data.length} lô hàng</p>
    </div>
  );
};
