import React, { useEffect, useState, useCallback } from "react";
import { Plus, Eye, X, AlertCircle, ArrowRightLeft, Trash2 } from "lucide-react";
import {
  getStockTransactions, createStockTransaction,
  type StockTransaction, type StockTransactionPayload, type TransactionLine,
} from "../services/warehouseService";
import { getAuthSession } from "../../../features/auth/services/authStorage";

const TYPE_OPTIONS = ["RECEIPT", "ISSUE", "TRANSFER", "ADJUSTMENT", "RETURN"];
const REF_OPTIONS = ["MANUAL", "MISSION", "RELIEF_ISSUE", "DISTRIBUTION"];

function DetailModal({ tx, onClose }: { tx: StockTransaction; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{tx.transactionCode}</h2>
            <p className="text-xs text-gray-500">{tx.transactionType?.name} • {new Date(tx.happenedAt).toLocaleString("vi-VN")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-xs text-gray-500 block">Kho</span><p className="font-semibold">{tx.warehouse?.warehouseName}</p></div>
            <div><span className="text-xs text-gray-500 block">Loại tham chiếu</span><p className="font-semibold">{tx.referenceType}</p></div>
            <div className="col-span-2"><span className="text-xs text-gray-500 block">Ghi chú</span><p className="text-gray-700">{tx.note || "—"}</p></div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">Dòng hàng ({tx.lines?.length ?? 0})</h3>
            <div className="rounded-lg border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Hàng hóa</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Lô</th><th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">SL</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">ĐV</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(tx.lines ?? []).map((l, i) => (
                    <tr key={i}><td className="px-3 py-2 font-medium">{l.item?.itemName}</td><td className="px-3 py-2 font-mono text-xs text-blue-700">{l.lot?.lotNo || "—"}</td><td className="px-3 py-2 text-right font-bold">{l.qty}</td><td className="px-3 py-2 text-gray-500">{l.unitCode}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const now = new Date().toISOString().slice(0, 16);
  const [form, setForm] = useState<StockTransactionPayload>({
    transactionTypeCode: "RECEIPT", warehouseId: "", referenceType: "MANUAL",
    referenceId: null, happenedAt: now, note: "", lines: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLine, setNewLine] = useState<TransactionLine>({ itemId: "", lotId: "", qty: 1, unitCode: "THUNG" });

  const addLine = () => {
    if (!newLine.itemId.trim()) return;
    setForm(p => ({ ...p, lines: [...p.lines, { ...newLine }] }));
    setNewLine({ itemId: "", lotId: "", qty: 1, unitCode: "THUNG" });
  };
  const removeLine = (i: number) => setForm(p => ({ ...p, lines: p.lines.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.warehouseId.trim()) { setError("Vui lòng nhập ID kho."); return; }
    if (form.lines.length === 0) { setError("Cần ít nhất 1 dòng hàng."); return; }
    setLoading(true); setError(null);
    try {
      await createStockTransaction({ ...form, happenedAt: new Date(form.happenedAt).toISOString() }, getAuthSession()?.accessToken ?? "");
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Lỗi tạo giao dịch"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Tạo giao dịch kho</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Loại giao dịch</label>
              <select value={form.transactionTypeCode} onChange={e => setForm(p => ({ ...p, transactionTypeCode: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TYPE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Loại tham chiếu</label>
              <select value={form.referenceType} onChange={e => setForm(p => ({ ...p, referenceType: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {REF_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">ID Kho *</label>
            <input value={form.warehouseId} onChange={e => setForm(p => ({ ...p, warehouseId: e.target.value }))} placeholder="UUID kho..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Thời gian</label>
              <input type="datetime-local" value={form.happenedAt} onChange={e => setForm(p => ({ ...p, happenedAt: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">ID Tham chiếu</label>
              <input value={form.referenceId ?? ""} onChange={e => setForm(p => ({ ...p, referenceId: e.target.value || null }))} placeholder="UUID (nếu có)..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Ghi chú</label>
            <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Nhập kho tiếp nhận..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Lines */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">Dòng hàng</h3>
            <div className="flex gap-2 mb-3">
              <input value={newLine.itemId} onChange={e => setNewLine(p => ({ ...p, itemId: e.target.value }))} placeholder="ID Hàng hóa" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={newLine.lotId} onChange={e => setNewLine(p => ({ ...p, lotId: e.target.value }))} placeholder="ID Lô" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" value={newLine.qty} onChange={e => setNewLine(p => ({ ...p, qty: parseInt(e.target.value) || 1 }))} min={1} className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={newLine.unitCode} onChange={e => setNewLine(p => ({ ...p, unitCode: e.target.value }))} placeholder="ĐV" className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addLine} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"><Plus size={16} /></button>
            </div>
            {form.lines.length > 0 && (
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <table className="w-full text-xs"><thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left">ID Hàng</th><th className="px-3 py-2 text-left">ID Lô</th><th className="px-3 py-2 text-right">SL</th><th className="px-3 py-2 text-left">ĐV</th><th className="px-3 py-2" /></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {form.lines.map((l, i) => (
                      <tr key={i}><td className="px-3 py-2 font-mono">{l.itemId.slice(-8)}…</td><td className="px-3 py-2 font-mono">{l.lotId.slice(-8)}…</td><td className="px-3 py-2 text-right font-bold">{l.qty}</td><td className="px-3 py-2">{l.unitCode}</td><td className="px-3 py-2"><button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-sm">Hủy</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)" }}>
            {loading ? "Đang tạo..." : "Tạo giao dịch"}
          </button>
        </div>
      </div>
    </div>
  );
}

function typeBadge(code: string) {
  const colors: Record<string, string> = {
    RECEIPT: "bg-emerald-100 text-emerald-700", ISSUE: "bg-orange-100 text-orange-700",
    TRANSFER: "bg-blue-100 text-blue-700", ADJUSTMENT: "bg-purple-100 text-purple-700", RETURN: "bg-gray-100 text-gray-600",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[code] ?? "bg-gray-100 text-gray-600"}`}>{code}</span>;
}

export const TransactionTab: React.FC = () => {
  const [data, setData] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewTx, setViewTx] = useState<StockTransaction | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await getStockTransactions(getAuthSession()?.accessToken ?? "")); }
    catch (e) { setError(e instanceof Error ? e.message : "Lỗi tải giao dịch"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)" }}>
          <Plus size={15} /> Tạo giao dịch
        </button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Mã GD", "Loại", "Kho", "Tham chiếu", "Thời gian", "Số dòng", "Ghi chú", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center"><div className="flex flex-col items-center gap-2"><ArrowRightLeft size={32} className="text-gray-300" /><p className="text-gray-400 text-sm">Chưa có giao dịch</p></div></td></tr>
            ) : data.map(tx => (
              <tr key={tx.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold whitespace-nowrap">{tx.transactionCode}</td>
                <td className="px-4 py-3">{typeBadge(tx.transactionType?.code ?? "")}</td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{tx.warehouse?.warehouseName}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{tx.referenceType}</td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(tx.happenedAt).toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3 text-center"><span className="font-bold text-gray-700">{tx.lines?.length ?? 0}</span></td>
                <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate text-xs">{tx.note || "—"}</td>
                <td className="px-4 py-3"><button onClick={() => setViewTx(tx)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"><Eye size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewTx && <DetailModal tx={viewTx} onClose={() => setViewTx(null)} />}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); void load(); }} />}
    </div>
  );
};
