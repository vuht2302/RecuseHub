import React, { useEffect, useState } from "react";
import { getWorkflow } from "@/src/shared/services/workflow.service";

const WorkflowPage = () => {
  const [entityType, setEntityType] = useState<"INCIDENT" | "MISSION">(
    "INCIDENT"
  );
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const res = await getWorkflow(entityType);
      setData(res);
    } catch (err) {
      console.error(err);
      alert("Load workflow thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, [entityType]);

  if (loading || !data) return <div>Loading...</div>;

  const normalize = (t: any) => ({
    from: t.fromStateCode || "START",
    to: t.toStateCode,
    action: t.actionCode,
    count: t.usedCount,
  });

  // 🔥 group theo FROM
  const grouped = data.transitions.reduce((acc: any, t: any) => {
    const row = normalize(t);
    if (!acc[row.from]) acc[row.from] = [];
    acc[row.from].push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black">Workflow hệ thống</h1>
        <p className="text-gray-600 text-sm">
          Luồng xử lý trạng thái Incident / Mission
        </p>
      </div>

      {/* SWITCH */}
      <div className="flex gap-3">
        {["INCIDENT", "MISSION"].map((type) => (
          <button
            key={type}
            onClick={() => setEntityType(type as any)}
            className={`px-5 py-2 rounded-full font-semibold transition ${
              entityType === type
                ? "bg-blue-950 text-white shadow"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* STATES */}
      <div className="bg-white p-5 rounded-2xl shadow">
        <h2 className="font-bold mb-4">States</h2>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
            START
          </span>

          {data.states.map((s: string) => (
            <span
              key={s}
              className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* FLOW VISUAL */}
      <div className="space-y-4">
        {Object.keys(grouped).map((from) => (
          <div
            key={from}
            className="bg-white p-5 rounded-2xl shadow"
          >
            {/* FROM */}
            <div className="mb-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                {from}
              </span>
            </div>

            {/* TRANSITIONS */}
            <div className="space-y-3">
              {grouped[from].map((row: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:shadow-sm transition"
                >
                  {/* ACTION */}
                  <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-semibold">
                    {row.action}
                  </span>

                  <span className="text-gray-400">→</span>

                  {/* TO */}
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {row.to}
                  </span>

                  {/* COUNT */}
                  <span className="ml-auto text-xs text-gray-400">
                    Used: {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowPage;