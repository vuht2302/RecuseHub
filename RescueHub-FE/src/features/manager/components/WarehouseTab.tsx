import React, { useEffect, useState, useCallback } from "react";
import {
  Plus, Search, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Warehouse, MapPin, User, Layers, Package,
} from "lucide-react";
import {
  getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse,
  type Warehouse as WH, type WarehousePayload,
} from "../services/warehouseService";
import { getAuthSession } from "../../../features/auth/services/authStorage";

const EMPTY_FORM: WarehousePayload = {
  warehouseCode: "", warehouseName: "", statusCode: "ACTIVE",
  address: "", adminAreaId: "", managerId: "",
  location: { lat: 0, lng: 0 },
};

function Badge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
      {active ? "Hoạt động" : "Ngừng"}
    </span>
  );
}

interface ConfirmDeleteProps { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean; }
function ConfirmDelete({ name, onConfirm, onCancel, loading }: ConfirmDeleteProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-center text-gray-900 mb-1">Xác nhận xóa</h3>
        <p className="text-sm text-gray-600 text-center mb-6">Xóa kho <strong>{name}</strong>? Thao tác không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50">Hủy</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm disabled:opacity-60">
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FormModalProps { wh?: WH | null; onClose: () => void; onSaved: () => void; }
function FormModal({ wh, onClose, onSaved }: FormModalProps) {
  const [form, setForm] = useState<WarehousePayload>(wh ? {
    warehouseCode: wh.warehouseCode, warehouseName: wh.warehouseName,
    statusCode: wh.status?.code ?? "ACTIVE", address: wh.address,
    adminAreaId: wh.adminArea?.id ?? "", managerId: wh.manager?.id ?? "",
    location: wh.location ?? { lat: 0, lng: 0 },
  } : { ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.warehouseCode.trim() || !form.warehouseName.trim()) {
      setError("Vui lòng điền mã và tên kho.");
      return;
    }
    setLoading(true); setError(null);
    try {
      const token = getAuthSession()?.accessToken ?? "";
      if (wh) await updateWarehouse(wh.id, form, token);
      else await createWarehouse(form, token);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally { setLoading(false); }
  };

  const F = (key: keyof WarehousePayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{wh ? "Chỉnh sửa kho" : "Tạo kho mới"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Mã kho *</label>
              <input value={form.warehouseCode} onChange={F("warehouseCode")} placeholder="KHO-001" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Tên kho *</label>
              <input value={form.warehouseName} onChange={F("warehouseName")} placeholder="Kho trung tâm..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Địa chỉ</label>
            <input value={form.address} onChange={F("address")} placeholder="123 Đường ABC..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
              <label className="text-xs font-semibold text-gray-500 block mb-1">ID Khu vực hành chính</label>
              <input value={form.adminAreaId ?? ""} onChange={F("adminAreaId")} placeholder="UUID..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">ID Quản lý kho</label>
              <input value={form.managerId ?? ""} onChange={F("managerId")} placeholder="UUID..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Trạng thái</label>
            <select value={form.statusCode} onChange={F("statusCode")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm">Hủy</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ background: loading ? "#9ca3af" : "linear-gradient(135deg,#1e3a5f,#1e40af)" }}>
            {loading ? "Đang lưu..." : wh ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const WarehouseTab: React.FC = () => {
  const [data, setData] = useState<WH[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<WH | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WH | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = getAuthSession()?.accessToken ?? "";
      const res = await getWarehouses(token, { keyword: keyword || undefined, statusCode: statusFilter || undefined });
      setData(res);
    } catch (e) { setError(e instanceof Error ? e.message : "Lỗi tải kho"); }
    finally { setLoading(false); }
  }, [keyword, statusFilter]);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteWarehouse(deleteTarget.id, getAuthSession()?.accessToken ?? "");
      setDeleteTarget(null);
      void load();
    } catch (e) { alert(e instanceof Error ? e.message : "Lỗi xóa"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tìm theo tên, mã kho..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Ngừng</option>
        </select>
        <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)" }}>
          <Plus size={15} /> Tạo kho
        </button>
      </div>

      {/* Error */}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2"><AlertCircle size={16} />{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Mã kho", "Tên kho", "Trạng thái", "Địa chỉ", "Khu vực", "Quản lý", "Khu", "Tồn", "Ngày tạo", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={10} className="py-12 text-center text-gray-400 text-sm">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={10} className="py-12 text-center"><div className="flex flex-col items-center gap-2"><Warehouse size={32} className="text-gray-300" /><p className="text-gray-400 text-sm">Chưa có kho nào</p></div></td></tr>
            ) : data.map(wh => (
              <tr key={wh.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">{wh.warehouseCode}</td>
                <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{wh.warehouseName}</td>
                <td className="px-4 py-3"><Badge active={wh.status?.code === "ACTIVE"} /></td>
                <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{wh.address || "—"}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{wh.adminArea?.name || "—"}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{wh.manager?.displayName || "—"}</td>
                <td className="px-4 py-3 text-center"><span className="font-semibold text-gray-800">{wh.zoneCount}</span></td>
                <td className="px-4 py-3 text-center"><span className="font-semibold text-gray-800">{wh.stockLineCount}</span></td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{new Date(wh.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditTarget(wh); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteTarget(wh)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <FormModal wh={editTarget} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); void load(); }} />}
      {deleteTarget && <ConfirmDelete name={deleteTarget.warehouseName} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
      <p className="text-xs text-gray-400 text-right">{data.length} kho</p>
    </div>
  );
};
