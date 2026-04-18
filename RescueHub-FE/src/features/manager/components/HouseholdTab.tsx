import React, { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, X, AlertCircle, Home } from "lucide-react";
import {
  getHouseholds, createHousehold, updateHousehold, deleteHousehold,
  type Household, type HouseholdPayload,
} from "../services/warehouseService";
import { getAuthSession } from "../../../features/auth/services/authStorage";

const EMPTY: HouseholdPayload = {
  headName: "", phone: "", adminAreaId: "", address: "",
  location: { lat: 0, lng: 0 }, memberCount: 1, vulnerableCount: 0,
};

function ConfirmDelete({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-600" /></div>
        <h3 className="text-lg font-bold text-center mb-1">Xóa hộ dân?</h3>
        <p className="text-sm text-gray-600 text-center mb-6">Xóa hộ dân <strong>{name}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-sm">Hủy</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm disabled:opacity-60">{loading ? "Đang xóa..." : "Xóa"}</button>
        </div>
      </div>
    </div>
  );
}

function FormModal({ hh, onClose, onSaved }: { hh?: Household | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<HouseholdPayload>(hh ? {
    headName: hh.headName, phone: hh.phone, adminAreaId: hh.adminArea?.id ?? "",
    address: hh.address, location: hh.location ?? { lat: 0, lng: 0 },
    memberCount: hh.memberCount, vulnerableCount: hh.vulnerableCount,
  } : { ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.headName.trim() || !form.phone.trim()) { setError("Vui lòng điền tên chủ hộ và số điện thoại."); return; }
    setLoading(true); setError(null);
    try {
      const token = getAuthSession()?.accessToken ?? "";
      if (hh) await updateHousehold(hh.id, form, token);
      else await createHousehold(form, token);
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Lỗi không xác định"); }
    finally { setLoading(false); }
  };

  const F = (key: keyof HouseholdPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));
  const N = (key: keyof HouseholdPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }));

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{hh ? "Chỉnh sửa hộ dân" : "Thêm hộ dân"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Tên chủ hộ *</label>
              <input value={form.headName} onChange={F("headName")} placeholder="Trần Văn D" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Số điện thoại *</label>
              <input value={form.phone} onChange={F("phone")} placeholder="0900000009" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Địa chỉ</label>
            <input value={form.address} onChange={F("address")} placeholder="Ấp 3, Xã B" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">ID Khu vực hành chính</label>
            <input value={form.adminAreaId} onChange={F("adminAreaId")} placeholder="UUID..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Vĩ độ (lat)</label>
              <input type="number" value={form.location?.lat ?? 0} onChange={e => setForm(p => ({ ...p, location: { ...(p.location ?? { lat: 0, lng: 0 }), lat: parseFloat(e.target.value) } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Kinh độ (lng)</label>
              <input type="number" value={form.location?.lng ?? 0} onChange={e => setForm(p => ({ ...p, location: { ...(p.location ?? { lat: 0, lng: 0 }), lng: parseFloat(e.target.value) } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Số thành viên</label>
              <input type="number" value={form.memberCount} onChange={N("memberCount")} min={1} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Số dễ tổn thương</label>
              <input type="number" value={form.vulnerableCount} onChange={N("vulnerableCount")} min={0} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-sm">Hủy</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)" }}>
            {loading ? "Đang lưu..." : hh ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const HouseholdTab: React.FC = () => {
  const [data, setData] = useState<Household[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Household | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Household | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await getHouseholds(getAuthSession()?.accessToken ?? "")); }
    catch (e) { setError(e instanceof Error ? e.message : "Lỗi tải danh sách hộ dân"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true);
    try { await deleteHousehold(deleteTarget.id, getAuthSession()?.accessToken ?? ""); setDeleteTarget(null); void load(); }
    catch (e) { alert(e instanceof Error ? e.message : "Lỗi xóa"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)" }}>
          <Plus size={15} /> Thêm hộ dân
        </button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Chủ hộ", "Số điện thoại", "Địa chỉ", "Khu vực", "Thành viên", "Dễ TT", "Vĩ / Kinh độ", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center"><div className="flex flex-col items-center gap-2"><Home size={32} className="text-gray-300" /><p className="text-gray-400 text-sm">Chưa có hộ dân</p></div></td></tr>
            ) : data.map(hh => (
              <tr key={hh.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{hh.headName}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{hh.phone}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{hh.address || "—"}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{hh.adminArea?.name || "—"}</td>
                <td className="px-4 py-3 text-center"><span className="font-bold text-blue-700">{hh.memberCount}</span></td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${hh.vulnerableCount > 0 ? "text-amber-600" : "text-gray-400"}`}>{hh.vulnerableCount}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {hh.location ? `${hh.location.lat.toFixed(4)}, ${hh.location.lng.toFixed(4)}` : "—"}
                </td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <button onClick={() => { setEditTarget(hh); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteTarget(hh)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && <FormModal hh={editTarget} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); void load(); }} />}
      {deleteTarget && <ConfirmDelete name={deleteTarget.headName} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
      <p className="text-xs text-gray-400 text-right">{data.length} hộ dân</p>
    </div>
  );
};
