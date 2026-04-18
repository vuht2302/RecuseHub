import React, { useEffect, useState, useCallback } from "react";
import { Search, PackageSearch, AlertCircle, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";
import { getStocks, type StockLine, type StockListParams } from "../services/warehouseService";
import { getAuthSession } from "../../../features/auth/services/authStorage";

export const StockTab: React.FC = () => {
  const [data, setData] = useState<StockLine[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<StockListParams>({
    warehouseId: "", itemId: "", lotNo: "", nearExpiry: false, page: 1, pageSize: 20,
  });

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = getAuthSession()?.accessToken ?? "";
      const cleanParams: StockListParams = {
        ...(params.warehouseId ? { warehouseId: params.warehouseId } : {}),
        ...(params.itemId ? { itemId: params.itemId } : {}),
        ...(params.lotNo ? { lotNo: params.lotNo } : {}),
        nearExpiry: params.nearExpiry,
        page: params.page,
        pageSize: params.pageSize,
      };
      const res = await getStocks(token, cleanParams);
      setData(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (e) { setError(e instanceof Error ? e.message : "Lỗi tải tồn kho"); }
    finally { setLoading(false); }
  }, [params]);

  useEffect(() => { void load(); }, [load]);

  const set = (key: keyof StockListParams) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setParams(p => ({ ...p, [key]: e.target.value, page: 1 }));

  const pageCount = Math.ceil(total / (params.pageSize ?? 20));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={params.warehouseId} onChange={set("warehouseId")} placeholder="ID Kho..." className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <input value={params.itemId} onChange={set("itemId")} placeholder="ID Hàng hóa..." className="px-3 py-2 text-sm border border-gray-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input value={params.lotNo} onChange={set("lotNo")} placeholder="Số lô..." className="px-3 py-2 text-sm border border-gray-200 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button
          onClick={() => setParams(p => ({ ...p, nearExpiry: !p.nearExpiry, page: 1 }))}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${params.nearExpiry ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-600"}`}
        >
          {params.nearExpiry ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          Gần hết hạn
        </button>
        <button onClick={() => void load()} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2"><AlertCircle size={16} />{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Kho", "Hàng hóa", "Mã hàng", "Lô", "Tồn thực", "Đã đặt", "Khả dụng", "Đơn vị"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-sm">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <PackageSearch size={32} className="text-gray-300" />
                    <p className="text-gray-400 text-sm">Không có dữ liệu tồn kho</p>
                  </div>
                </td>
              </tr>
            ) : data.map(s => (
              <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">{s.warehouse?.warehouseName || "—"}</td>
                <td className="px-4 py-3 text-gray-800 font-semibold">{s.item?.itemName || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-700">{s.item?.itemCode || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.lot?.lotNo || <span className="text-gray-400">—</span>}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-gray-900">{s.qtyOnHand.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold text-amber-600">{s.qtyReserved.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${s.qtyAvailable <= 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {s.qtyAvailable.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{s.unitCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Tổng {total} dòng</span>
          <div className="flex gap-2">
            <button disabled={(params.page ?? 1) <= 1} onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) - 1 }))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40">← Trước</button>
            <span className="px-3 py-1.5 text-gray-700 font-medium">Trang {params.page} / {pageCount}</span>
            <button disabled={(params.page ?? 1) >= pageCount} onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) + 1 }))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40">Sau →</button>
          </div>
        </div>
      )}
    </div>
  );
};
