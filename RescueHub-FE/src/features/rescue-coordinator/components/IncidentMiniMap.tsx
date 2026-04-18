import React, { useEffect, useRef } from "react";
import vietmapgl from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";
import { MapPin } from "lucide-react";

interface IncidentMiniMapProps {
  lat: number;
  lng: number;
  addressText?: string;
}

export const IncidentMiniMap: React.FC<IncidentMiniMapProps> = ({
  lat,
  lng,
  addressText,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<vietmapgl.Map | null>(null);
  const markerRef = useRef<vietmapgl.Marker | null>(null);

  const vietmapApiKey = (import.meta.env.VITE_VIETMAP_API_KEY ?? "").trim();

  useEffect(() => {
    if (!vietmapApiKey || !mapContainerRef.current) return;

    // Clean up previous map
    if (mapRef.current) {
      markerRef.current?.remove();
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new vietmapgl.Map({
      container: mapContainerRef.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${vietmapApiKey}`,
      center: [lng, lat],
      zoom: 15,
      fadeDuration: 0,
      interactive: false,
    });

    mapRef.current = map;

    map.once("load", () => {
      // Custom marker element
      const el = document.createElement("div");
      el.style.width = "36px";
      el.style.height = "36px";
      el.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
      el.style.borderRadius = "50% 50% 50% 0";
      el.style.transform = "rotate(-45deg)";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 4px 12px rgba(239,68,68,0.5)";

      const dot = document.createElement("div");
      dot.style.width = "10px";
      dot.style.height = "10px";
      dot.style.background = "white";
      dot.style.borderRadius = "50%";
      dot.style.position = "absolute";
      dot.style.top = "50%";
      dot.style.left = "50%";
      dot.style.transform = "translate(-50%, -50%)";
      el.appendChild(dot);

      const marker = new vietmapgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lng, lat])
        .addTo(map);

      markerRef.current = marker;
    });

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, vietmapApiKey]);

  if (!vietmapApiKey) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg gap-2">
        <MapPin className="text-gray-400" size={24} />
        <p className="text-xs text-gray-500 text-center px-4">
          Chưa cấu hình VITE_VIETMAP_API_KEY
        </p>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />;
};
