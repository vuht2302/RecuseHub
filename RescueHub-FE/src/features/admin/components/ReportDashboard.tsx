import React, { useEffect, useState } from "react";
import {
  getReportOverview,
  getIncidentByStatus,
  getMissionByStatus,
  getReliefByStatus,
  getHotspots,
} from "@/src/shared/services/report.service";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#1E3A8A", "#2563EB", "#60A5FA", "#93C5FD"];

const ReportDashboard = () => {
  const [overview, setOverview] = useState<any>(null);
  const [incident, setIncident] = useState<any>(null);
  const [mission, setMission] = useState<any>(null);
  const [relief, setRelief] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        overviewRes,
        incidentRes,
        missionRes,
        reliefRes,
        hotspotRes,
      ] = await Promise.all([
        getReportOverview(),
        getIncidentByStatus(),
        getMissionByStatus(),
        getReliefByStatus(),
        getHotspots(),
      ]);

      setOverview(overviewRes);
      setIncident(incidentRes);
      setMission(missionRes);
      setRelief(reliefRes);
      setHotspots(hotspotRes);
    } catch (err) {
      console.error(err);
      alert("Load report thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !overview) return <div>Loading...</div>;

  // ===== FORMAT DATA =====
  const incidentChart =
    incident?.items.map((i: any) => ({
      name: i.statusCode,
      value: i.count,
    })) || [];

  const missionChart =
    mission?.items.map((i: any) => ({
      name: i.statusCode,
      value: i.count,
    })) || [];

  // ===== COMPONENT =====
  const Card = ({ title, value }: any) => (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-black text-blue-950">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black">Dashboard báo cáo</h1>
        <p className="text-gray-600 text-sm">
          Tổng quan hệ thống cứu hộ
        </p>
      </div>

      {/* OVERVIEW */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Tổng sự cố" value={overview.incidents.total} />
        <Card title="SOS" value={overview.incidents.sos} />
        <Card title="Đang xử lý" value={overview.incidents.open} />

        <Card title="Nhiệm vụ" value={overview.missions.total} />
        <Card title="Đang làm" value={overview.missions.inProgress} />
        <Card title="Hoàn thành" value={overview.missions.completed} />

        <Card title="Yêu cầu cứu trợ" value={overview.relief.requestsTotal} />
        <Card title="Chờ duyệt" value={overview.relief.pending} />
        <Card title="Đã duyệt" value={overview.relief.approved} />
      </div>

      {/* CHART */}
      <div className="grid grid-cols-2 gap-4">
        {/* INCIDENT BAR */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-bold mb-3">Incident Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incidentChart}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1E3A8A" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MISSION PIE */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-bold mb-3">Mission Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={missionChart}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
              >
                {missionChart.map((_: any, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HOTSPOTS */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-3">Hotspots</h2>

        <table className="w-full text-sm">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="text-left py-2">Khu vực</th>
              <th className="text-left py-2">Số sự cố</th>
            </tr>
          </thead>

          <tbody>
            {hotspots?.items.map((h: any, index: number) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="py-2">
                  {h.adminAreaName || h.fallbackAddress}
                </td>
                <td className="font-semibold">{h.incidentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportDashboard;