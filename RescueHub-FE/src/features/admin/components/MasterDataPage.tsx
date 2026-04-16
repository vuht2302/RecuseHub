import React, { useEffect, useState } from "react";
import { Plus, AlertTriangle, Wrench, Truck } from "lucide-react";
import MasterDataModal from "../components/MasterDataModal";
import { getMasterDataBootstrap } from "@/src/shared/services/masterData.service";

type TabType = "incident" | "skill" | "vehicle";

const tabs = [
  { key: "incident", label: "Loại sự cố", icon: AlertTriangle },
  { key: "skill", label: "Kỹ năng", icon: Wrench },
  { key: "vehicle", label: "Phương tiện", icon: Truck },
];

const MasterDataPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("incident");
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    incident: [],
    skill: [],
    vehicle: [],
    priorityLevels: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getMasterDataBootstrap();

      setData({
        incident: res.incidentTypes || [],
        skill: res.skills || [],
        vehicle: res.vehicleTypes || [],
        priorityLevels: res.priorityLevels || [],
      });
    } catch (err) {
      console.error(err);
      alert("Load dữ liệu thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCurrentData = () => data[activeTab];

  const handleAdd = (item: any) => {
    setData((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], item],
    }));
  };

  const getPriorityColor = (code: string) => {
    switch (code) {
      case "CRITICAL":
        return "bg-red-100 text-red-600";
      case "HIGH":
        return "bg-orange-100 text-orange-600";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-600";
      case "LOW":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black">
            Danh mục hệ thống
          </h1>
          <p className="text-gray-500 text-sm">
            Quản lý các danh mục phục vụ hệ thống cứu hộ
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-950 hover:bg-blue-800 text-white px-4 py-2 rounded-xl shadow transition"
        >
          <Plus size={18} /> Thêm mới
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-3 bg-white p-2 rounded-xl shadow">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                isActive
                  ? "bg-blue-950 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-100 animate-pulse rounded"
              />
            ))}
          </div>
        ) : getCurrentData().length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Không có dữ liệu
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-600">
              <tr>
                <th className="text-left py-3 px-4">Code</th>
                <th className="text-left py-3 px-4">Tên</th>
                {activeTab === "incident" && (
                  <th className="text-left py-3 px-4">
                    Độ ưu tiên
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {getCurrentData().map((item: any, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {item.code}
                  </td>

                  <td className="px-4">{item.name}</td>

                  {activeTab === "incident" && (
                    <td className="px-4">
                      {(() => {
                        const priority = data.priorityLevels.find(
                          (p) => p.code === item.priority
                        );

                        return priority ? (
                          <span
                            className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                              priority.code
                            )}`}
                          >
                            {priority.name}
                          </span>
                        ) : (
                          "-"
                        );
                      })()}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <MasterDataModal
          type={activeTab}
          priorities={data.priorityLevels}
          onClose={() => setShowModal(false)}
          onSubmit={handleAdd}
        />
      )}
    </div>
  );
};

export default MasterDataPage;