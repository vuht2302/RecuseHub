import React, { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, X, AlertCircle, Package } from "lucide-react";
import {
  getItems, createItem, updateItem, deleteItem,
  type Item, type ItemPayload,
} from "../services/warehouseService";
import { getAuthSession } from "../../../features/auth/services/authStorage";

const EMPTY: ItemPayload = {
  itemCode: "", itemName: "", itemCategoryCode: "ESSENTIAL",
  unitCode: "THUNG", requiresLotTracking: true,
  requiresExpiryTracking: true, issuePolicyCode: "FEFO", isActive: true,
};

function ConfirmDelete({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-600" /></div>
        <h3 className="text-lg font-bold text-center mb-1">Xóa hàng hóa?</h3>
        <p className="text-sm text-gray-600 text-center mb-6">Xóa <strong>{name}</strong>? Thao tác không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-sm">Hủy</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm disabled:opacity-60">{loading ? "Đang xóa..." : "Xóa"}</button>
        </div>
      </div>
    </div>
  );
}

function FormModal({ item, onClose, onSaved }: { item?: Item | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<ItemPayload>(item ? {
    itemCode: item.itemCode, itemName: item.itemName,
    itemCategoryCode: item.itemCategory?.code ?? "ESSENTIAL",
    unitCode: item.unit?.code ?? "THUNG",
    requiresLotTracking: item.requiresLotTracking,
    requiresExpiryTracking: item.requiresExpiryTracking,
    issuePolicyCode: item.issuePolicyCode, isActive: item.isActive,
  } : { ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.itemCode.trim() || !form.itemName.trim()) { setError("Vui lòng điền mã và tên hàng hóa."); return; }
    setLoading(true); setError(null);
    try {
      const token = getAuthSession()?.accessToken ?? "";
      if (item) await updateItem(item.id, form, token);
      else await createItem(form, token);
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Lỗi không xác định"); }
    finally { setLoading(false); }
  };

  const F = (key: keyof ItemPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));
  const BoolF = (key: keyof ItemPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.checked }));

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{item ? "Chỉnh sửa hàng hóa" : "Thêm hàng hóa"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Mã hàng *</label>
              <input value={form.itemCode} onChange={F("itemCode")} placeholder="NUOC-500ML" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Tên hàng hóa *</label>
              <input value={form.itemName} onChange={F("itemName")} placeholder="Nước uống 500ml" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Danh mục</label>
              <input value={form.itemCategoryCode} onChange={F("itemCategoryCode")} placeholder="ESSENTIAL" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Đơn vị</label>
              <input value={form.unitCode} onChange={F("unitCode")} placeholder="THUNG" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Chính sách xuất (FEFO/FIFO)</label>
            <select value={form.issuePolicyCode} onChange={F("issuePolicyCode")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="FEFO">FEFO — Hết hạn trước xuất trước</option>
              <option value="FIFO">FIFO — Nhập trước xuất trước</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { key: "requiresLotTracking" as const, label: "Theo dõi lô" },
              { key: "requiresExpiryTracking" as const, label: "Theo dõi hạn" },
              { key: "isActive" as const, label: "Đang hoạt động" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form[key] as boolean} onChange={BoolF(key)} className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-sm">Hủy</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)" }}>
            {loading ? "Đang lưu..." : item ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const ItemTab: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await getItems(getAuthSession()?.accessToken ?? "")); }
    catch (e) { setError(e instanceof Error ? e.message : "Lỗi tải hàng hóa"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true);
    try { await deleteItem(deleteTarget.id, getAuthSession()?.accessToken ?? ""); setDeleteTarget(null); void load(); }
    catch (e) { alert(e instanceof Error ? e.message : "Lỗi xóa"); }
    finally { setDeleting(false); }
  };

  const BoolBadge = (v: boolean) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${v ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{v ? "Có" : "Không"}</span>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)" }}>
          <Plus size={15} /> Thêm hàng hóa
        </button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Mã hàng", "Tên hàng hóa", "Danh mục", "Đơn vị", "Chính sách", "Theo lô", "Theo hạn", "Trạng thái", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={9} className="py-12 text-center text-gray-400">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={9} className="py-12 text-center"><div className="flex flex-col items-center gap-2"><Package size={32} className="text-gray-300" /><p className="text-gray-400 text-sm">Chưa có hàng hóa</p></div></td></tr>
            ) : data.map(item => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold">{item.itemCode}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{item.itemName}</td>
                <td className="px-4 py-3 text-gray-600">{item.itemCategory?.name || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{item.unit?.name || "—"}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">{item.issuePolicyCode}</span></td>
                <td className="px-4 py-3">{BoolBadge(item.requiresLotTracking)}</td>
                <td className="px-4 py-3">{BoolBadge(item.requiresExpiryTracking)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {item.isActive ? "Hoạt động" : "Ngừng"}
                  </span>
                </td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <button onClick={() => { setEditTarget(item); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && <FormModal item={editTarget} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); void load(); }} />}
      {deleteTarget && <ConfirmDelete name={deleteTarget.itemName} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
      <p className="text-xs text-gray-400 text-right">{data.length} hàng hóa</p>
    </div>
  );
};
