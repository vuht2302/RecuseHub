import React, { useEffect, useRef, useState } from "react";
import vietmapgl from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";
  import {
  AlertTriangle,
  MapPin,
  TrendingUp,
  Clock,
  RefreshCw,
  Filter,
} from "lucide-react";
import { getAuthSession } from "../../../features/auth/services/authStorage";
import {
  getReliefHotspots,
  type ReliefHotspotItem,
} from "../services/incidentServices";

interface ReliefHotspotMapProps {
  className?: string;
}

const DAYS_OPTIONS = [
  { value: 1, label: "1 ngày" },
  { value: 3, label: "3 ngày" },
  { value: 7, label: "7 ngày" },
  { value: 14, label: "14 ngày" },
  { value: 30, label: "30 ngày" },
];

const TOP_OPTIONS = [
  { value: 5, label: "Top 5" },
  { value: 10, label: "Top 10" },
  { value: 15, label: "Top 15" },
  { value: 20, label: "Top 20" },
];

const ReliefHotspotMap: React.FC<ReliefHotspotMapProps> = ({ className = "" }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<vietmapgl.Map | null>(null);
  const markersRef = useRef<vietmapgl.Marker[]>([]);
  const circlesRef = useRef<vietmapgl.Marker[]>([]);

  const [hotspots, setHotspots] = useState<ReliefHotspotItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [days, setDays] = useState(7);
  const [top, setTop] = useState(10);
  const [selectedHotspot, setSelectedHotspot] = useState<ReliefHotspotItem | null>(null);

  const vietmapApiKey = (import.meta.env.VITE_VIETMAP_API_KEY ?? "").trim();
  const canUseVietmap = vietmapApiKey.length > 0;

  const fetchHotspots = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authSession = getAuthSession();
      if (!authSession?.accessToken) {
        throw new Error("Không có token xác thực.");
      }

      const data = await getReliefHotspots(authSession.accessToken, { days, top });
      setHotspots(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu vùng cứu trợ");
    } finally {
      setIsLoading(false);
    }
  }, [days, top]);

  useEffect(() => {
    void fetchHotspots();
  }, [fetchHotspots]);

  // Initialize Map
  useEffect(() => {
    if (!canUseVietmap || !mapContainerRef.current || mapRef.current) return;

    const map = new vietmapgl.Map({
      container: mapContainerRef.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${vietmapApiKey}`,
      center: [105.767, 10.03], // Can Tho center
      zoom: 11,
    });

    map.addControl(new vietmapgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      circlesRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      circlesRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [canUseVietmap, vietmapApiKey]);

  // Update markers on map
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    circlesRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    circlesRef.current = [];

    hotspots.forEach((hotspot) => {
      if (!hotspot.center) return;

      const { lat, lng } = hotspot.center;
      const maxCount = hotspots.reduce((max, h) => Math.max(max, h.requestCount), 1);
      const intensity = hotspot.requestCount / maxCount;

      // Color based on pending ratio (higher = more urgent)
      const pendingRatio = hotspot.pendingCount / Math.max(hotspot.requestCount, 1);
      let markerColor = "#16a34a"; // green - low urgency
      if (pendingRatio > 0.5) markerColor = "#ea580c"; // orange - medium
      if (pendingRatio > 0.8) markerColor = "#dc2626"; // red - high urgency
      if (hotspot.requestCount >= maxCount * 0.8) markerColor = "#dc2626"; // red for top hotspots

      // Size based on request count
      const baseSize = 28;
      const scaledSize = baseSize + Math.round(intensity * 24);

      // Create circle marker element
      const el = document.createElement("div");
      el.style.width = `${scaledSize}px`;
      el.style.height = `${scaledSize}px`;
      el.style.borderRadius = "50%";
      el.style.background = markerColor;
      el.style.border = "3px solid white";
      el.style.boxShadow = `0 2px 8px ${markerColor}80`;
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.cursor = "pointer";
      el.style.transition = "transform 0.2s ease";

      // Inner dot
      const dot = document.createElement("div");
      dot.style.width = "10px";
      dot.style.height = "10px";
      dot.style.borderRadius = "50%";
      dot.style.background = "white";
      el.appendChild(dot);

      // Hover effect
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.15)";
        el.style.zIndex = "10";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.zIndex = "1";
      });

      const marker = new vietmapgl.Marker({ element: el, anchor: "center" })
        .setLngLat([lng, lat])
        .addTo(map);

      const popup = new vietmapgl.Popup({ offset: 20, closeButton: false }).setHTML(
        `<div style="font-family:sans-serif;padding:4px;min-width:160px">
          <strong style="font-size:13px;color:#1f2937">${hotspot.areaName}</strong><br/>
          <span style="font-size:12px;color:#6b7280">Yêu cầu: <b style="color:#dc2626">${hotspot.requestCount}</b></span><br/>
          <span style="font-size:12px;color:#6b7280">Chờ xử lý: <b>${hotspot.pendingCount}</b></span>
        </div>`
      );
      marker.setPopup(popup);

      el.addEventListener("click", () => {
        setSelectedHotspot(hotspot);
        map.flyTo({
          center: [lng, lat],
          zoom: 13,
          essential: true,
          duration: 800,
        });
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if hotspots exist
    if (hotspots.length > 0 && hotspots.some((h) => h.center)) {
      const validHotspots = hotspots.filter((h) => h.center);
      if (validHotspots.length > 0) {
        const bounds = new vietmapgl.LngLatBounds();
        validHotspots.forEach((h) => {
          if (h.center) bounds.extend([h.center.lng, h.center.lat]);
        });
        map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 800 });
      }
    }
  }, [hotspots]);

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--";
    }
  };

  const getUrgencyColor = (hotspot: ReliefHotspotItem) => {
    const ratio = hotspot.pendingCount / Math.max(hotspot.requestCount, 1);
    if (ratio > 0.8 || hotspot.requestCount >= 3) return "text-red-600 bg-red-50";
    if (ratio > 0.5) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  const totalPending = hotspots.reduce((sum, h) => sum + h.pendingCount, 0);
  const totalRequests = hotspots.reduce((sum, h) => sum + h.requestCount, 0);

  return (
    <div className={`flex flex-col md:flex-row h-full ${className}`}>
      {/* MAP AREA */}
      <article className="relative rounded-2xl overflow-hidden bg-[#cfd4db] flex-1 min-h-0">
        {canUseVietmap ? (
          <div
            ref={mapContainerRef}
            className="w-full h-full"
            aria-label="Bản đồ vùng cứu trợ"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <div className="rounded-xl bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm">
              Không có khóa API Vietmap, không thể tải bản đồ.
            </div>
          </div>
        )}

        {/* Selected Hotspot Info Overlay */}
        {selectedHotspot && selectedHotspot.center && (
          <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/70 max-w-xs z-10">
            <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant flex items-center gap-1.5 mb-1">
              <MapPin size={12} className="text-blue-950" /> Vùng chọn
            </p>
            <p className="text-base font-black text-on-surface truncate">{selectedHotspot.areaName}</p>
            <p className="text-xs text-[#3f4650] mt-1">
              Mã khu vực: <span className="font-mono font-semibold">{selectedHotspot.areaCode}</span>
            </p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="bg-red-50 rounded-lg py-1.5 px-1">
                <p className="text-lg font-black text-red-600">{selectedHotspot.requestCount}</p>
                <p className="text-[9px] text-red-500 font-semibold uppercase tracking-wide">Tổng</p>
              </div>
              <div className="bg-orange-50 rounded-lg py-1.5 px-1">
                <p className="text-lg font-black text-orange-600">{selectedHotspot.pendingCount}</p>
                <p className="text-[9px] text-orange-500 font-semibold uppercase tracking-wide">Chờ</p>
              </div>
              <div className="bg-green-50 rounded-lg py-1.5 px-1">
                <p className="text-lg font-black text-green-600">{selectedHotspot.fulfilledCount}</p>
                <p className="text-[9px] text-green-500 font-semibold uppercase tracking-wide">Hoàn</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <Clock size={10} />
              Cập nhật: {formatTime(selectedHotspot.latestRequestedAt)}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow-md border border-white/70 z-10">
          <p className="text-[9px] uppercase tracking-widest font-bold text-gray-500 mb-2">Mức độ ưu tiên</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm flex-shrink-0" />
              <span className="text-xs text-gray-600 font-medium">Khẩn cấp (&gt;80% chờ)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm flex-shrink-0" />
              <span className="text-xs text-gray-600 font-medium">Trung bình (50-80% chờ)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm flex-shrink-0" />
              <span className="text-xs text-gray-600 font-medium">Bình thường (&lt;50% chờ)</span>
            </div>
          </div>
        </div>
      </article>

      {/* SIDEBAR */}
      <aside className="rounded-2xl bg-[#d7dce2] border border-[#c8ced6] p-4 md:p-5 overflow-auto w-full md:w-[400px] flex flex-col">
        {/* Header + Stats */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant font-primary">
              Vùng cần cứu trợ
            </h3>
            <button
              onClick={() => void fetchHotspots()}
              className="p-1.5 rounded-lg hover:bg-white/60 transition-colors text-blue-950"
              title="Làm mới"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-white">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Tổng yêu cầu</p>
              <p className="text-xl font-black text-gray-900">{totalRequests}</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-white">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Chờ xử lý</p>
              <p className="text-xl font-black text-red-600">{totalPending}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-white space-y-2.5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-1.5">
              <Filter size={10} /> Bộ lọc
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 font-semibold block mb-1">Thời gian</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:border-blue-400 bg-white"
                >
                  {DAYS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 font-semibold block mb-1">Hiển thị</label>
                <select
                  value={top}
                  onChange={(e) => setTop(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:border-blue-400 bg-white"
                >
                  {TOP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2 mb-4">
            <AlertTriangle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Hotspot List */}
        {isLoading && hotspots.length === 0 ? (
          <div className="flex items-center justify-center p-6 flex-1">
            <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-800 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {hotspots.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <MapPin size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Chưa có vùng cứu trợ nào</p>
                <p className="text-xs text-gray-400 mt-1">trong khoảng thời gian này</p>
              </div>
            )}

            {hotspots.map((hotspot, idx) => {
              const isSelected = selectedHotspot?.areaCode === hotspot.areaCode;
              const urgencyClass = getUrgencyColor(hotspot);

              return (
                <div
                  key={`${hotspot.areaCode}-${idx}`}
                  onClick={() => {
                    setSelectedHotspot(hotspot);
                    if (mapRef.current && hotspot.center) {
                      mapRef.current.flyTo({
                        center: [hotspot.center.lng, hotspot.center.lat],
                        zoom: 13,
                        essential: true,
                        duration: 800,
                      });
                    }
                  }}
                  className={`rounded-xl p-3 cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-white border-[#007399] shadow-sm transform scale-[1.02]"
                      : "bg-[#e7ebef] border-[#d4dbe3] hover:border-[#007399]/50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? "bg-red-500 text-white" : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        <TrendingUp size={13} />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-sm font-bold truncate ${isSelected ? "text-blue-950" : "text-[#1f2329]"}`}>
                          {hotspot.areaName}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-mono">{hotspot.areaCode}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap flex-shrink-0 ${urgencyClass}`}>
                      {hotspot.pendingCount} chờ
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-1.5 mt-1">
                    <div className="bg-white rounded-md py-1 px-1 text-center shadow-sm">
                      <p className="text-xs font-black text-gray-800">{hotspot.requestCount}</p>
                      <p className="text-[9px] text-gray-400 font-semibold uppercase">Tổng</p>
                    </div>
                    <div className="bg-white rounded-md py-1 px-1 text-center shadow-sm">
                      <p className="text-xs font-black text-orange-600">{hotspot.pendingCount}</p>
                      <p className="text-[9px] text-gray-400 font-semibold uppercase">Chờ</p>
                    </div>
                    <div className="bg-white rounded-md py-1 px-1 text-center shadow-sm">
                      <p className="text-xs font-black text-green-600">{hotspot.fulfilledCount}</p>
                      <p className="text-[9px] text-gray-400 font-semibold uppercase">Hoàn</p>
                    </div>
                    <div className="bg-white rounded-md py-1 px-1 text-center shadow-sm">
                      <p className="text-xs font-black text-gray-500">{hotspot.rejectedCount}</p>
                      <p className="text-[9px] text-gray-400 font-semibold uppercase">Từ chối</p>
                    </div>
                  </div>

                  {/* Latest Update */}
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                    <Clock size={9} />
                    <span className="truncate">
                      Mới nhất: {formatTime(hotspot.latestRequestedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
};

export { ReliefHotspotMap };
