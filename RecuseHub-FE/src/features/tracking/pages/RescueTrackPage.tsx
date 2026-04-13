import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock3,
  FileCheck2,
  ListFilter,
  MapPin,
  Navigation,
  Send,
  Siren,
  Timer,
} from "lucide-react";
import { View } from "../../../shared/types";

interface RescueTrackProps {
  onViewChange: (view: View) => void;
}

type MissionStatus = "assigned" | "accepted" | "in-progress" | "completed";

interface Mission {
  id: string;
  title: string;
  area: string;
  priority: "Khan cap" | "Cao" | "Trung binh";
  summary: string;
  requirements: string[];
  coordinates: string;
  eta: string;
  status: MissionStatus;
}

export const RescueTrackPage: React.FC<RescueTrackProps> = ({
  onViewChange,
}) => {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: "RG-9902",
      title: "Cuu ho khu vuc sat lo",
      area: "Phan khu 7-C",
      priority: "Khan cap",
      summary:
        "Nuoc dang len nhanh, 3 nguoi bi mac ket tai khu nha tam. Can tiep can bang duong bo va day neo.",
      requirements: ["Tim kiem", "So cuu", "Van chuyen"],
      coordinates: "46.5782 N, 7.6541 E",
      eta: "4.2 phut",
      status: "assigned",
    },
    {
      id: "RG-8812",
      title: "Va cham nhieu phuong tien",
      area: "Giao lo I-95",
      priority: "Cao",
      summary:
        "2 nan nhan can ho tro y te va co nguy co ket trong xe. Hien truong can phong toa tam thoi.",
      requirements: ["Y te", "Dieu phoi giao thong"],
      coordinates: "46.5810 N, 7.6598 E",
      eta: "7.5 phut",
      status: "accepted",
    },
    {
      id: "RG-7210",
      title: "Tim kiem doi tuong rung",
      area: "Cong vien quoc gia",
      priority: "Trung binh",
      summary:
        "Nan nhan mat lien lac 40 phut. Da co tin hieu yeu tai khu vuc doi doc phia Bac.",
      requirements: ["K-9", "GPS cam tay"],
      coordinates: "46.5691 N, 7.6422 E",
      eta: "12.0 phut",
      status: "in-progress",
    },
  ]);
  const [selectedMissionId, setSelectedMissionId] = useState<string>("RG-9902");
  const [reportText, setReportText] = useState<string>("");
  const [statusNote, setStatusNote] = useState<string>("");

  const selectedMission =
    missions.find((mission) => mission.id === selectedMissionId) ?? missions[0];

  const activeCount = useMemo(
    () => missions.filter((mission) => mission.status !== "completed").length,
    [missions],
  );

  const updateMissionStatus = (missionId: string, status: MissionStatus) => {
    setMissions((current) =>
      current.map((mission) =>
        mission.id === missionId ? { ...mission, status } : mission,
      ),
    );
  };

  const submitReport = () => {
    if (!selectedMission || !reportText.trim()) {
      return;
    }

    updateMissionStatus(selectedMission.id, "completed");
    setStatusNote(
      `Bao cao #${selectedMission.id} da gui luc ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.`,
    );
    setReportText("");
  };

  const getStatusLabel = (status: MissionStatus) => {
    switch (status) {
      case "assigned":
        return "Da phan cong";
      case "accepted":
        return "Da nhan";
      case "in-progress":
        return "Dang thuc hien";
      case "completed":
        return "Hoan tat";
      default:
        return "Khong xac dinh";
    }
  };

  const statusSteps: { label: string; value: MissionStatus }[] = [
    { label: "Da nhan", value: "accepted" },
    { label: "Dang thuc hien", value: "in-progress" },
    { label: "Hoan tat", value: "completed" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            Nhiem vu Cuu ho Dang hoat dong
          </h1>
          <p className="mt-1 flex items-center gap-2 text-on-surface-variant">
            <Siren className="text-error" size={16} />
            {activeCount} nhiem vu dang cho xu ly uu tien
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high">
            <ListFilter size={16} />
            Bo loc
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high">
            <Timer size={16} />
            Sap xep uu tien
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="xl:col-span-5 rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-headline font-extrabold">
              Danh sach nhiem vu
            </h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Rescue Team
            </span>
          </div>

          <div className="space-y-4">
            {missions.map((mission) => {
              const selected = mission.id === selectedMission?.id;
              return (
                <article
                  key={mission.id}
                  className={`rounded-xl border p-4 transition-all ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant/20 bg-surface-container-lowest"
                  }`}
                >
                  <button
                    onClick={() => setSelectedMissionId(mission.id)}
                    className="w-full text-left"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold tracking-widest text-primary uppercase">
                        Mission ID: {mission.id}
                      </span>
                      <span className="rounded-md bg-surface-container-low px-2 py-1 text-[11px] font-bold">
                        {mission.priority}
                      </span>
                    </div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">
                      {mission.title}
                    </h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Khu vuc: {mission.area}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                      {mission.summary}
                    </p>
                  </button>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                      <Clock3 size={14} />
                      {getStatusLabel(mission.status)}
                    </span>

                    {mission.status === "assigned" ? (
                      <button
                        onClick={() =>
                          updateMissionStatus(mission.id, "accepted")
                        }
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-primary-container"
                      >
                        Nhan nhiem vu
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedMissionId(mission.id)}
                        className="rounded-lg bg-surface-container-low px-4 py-2 text-sm font-bold text-primary hover:bg-surface-container-high"
                      >
                        Xem chi tiet
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="xl:col-span-7 space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-headline font-extrabold">
                  Chi tiet yeu cau
                </h2>
                <p className="text-sm text-on-surface-variant">
                  {selectedMission?.title} - {selectedMission?.id}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <MapPin size={14} />
                {selectedMission?.coordinates}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 overflow-hidden rounded-xl border border-outline-variant/20">
                <div className="relative h-72 bg-slate-200">
                  <img
                    className="h-full w-full object-cover"
                    src="https://picsum.photos/seed/rescue-map/1200/700"
                    alt="Ban do vi tri cuu ho"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-error p-2 text-white shadow-xl">
                    <Navigation size={18} />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-xl bg-surface-container-low p-4">
                <h3 className="font-headline text-lg font-bold">
                  Thong tin nhiem vu
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                  {selectedMission?.summary}
                </p>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Yeu cau trien khai
                  </p>
                  {selectedMission?.requirements.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <CheckCircle2 size={16} className="text-primary" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg bg-surface-container-lowest p-3 text-sm">
                  <p className="text-on-surface-variant">ETA den hien truong</p>
                  <p className="text-xl font-black text-on-surface">
                    {selectedMission?.eta}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/10">
            <h2 className="text-2xl font-headline font-extrabold">
              Cap nhat trang thai va bao cao
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {statusSteps.map((step) => {
                const selected = selectedMission?.status === step.value;
                return (
                  <button
                    key={step.value}
                    onClick={() =>
                      selectedMission &&
                      updateMissionStatus(selectedMission.id, step.value)
                    }
                    className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
                      selected
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high"
                    }`}
                  >
                    {selected ? (
                      <CheckCircle2 className="mx-auto mb-1" size={18} />
                    ) : (
                      <Circle className="mx-auto mb-1" size={18} />
                    )}
                    {step.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Bao cao ket qua cuu ho
              </label>
              <textarea
                value={reportText}
                onChange={(event) => setReportText(event.target.value)}
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none"
                rows={4}
                placeholder="Nhap ket qua xu ly, so nan nhan da tiep can, tinh trang hien truong, va yeu cau ho tro tiep theo..."
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-sm text-on-surface-variant">
                {statusNote || "Chua co bao cao moi."}
              </div>
              <button
                onClick={submitReport}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-on-primary hover:bg-primary-container disabled:opacity-50"
                disabled={!selectedMission || !reportText.trim()}
              >
                <Send size={16} />
                Gui bao cao
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-surface-container-low p-3">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Trang thai hien tai
              </p>
              <p className="mt-1 text-base font-semibold text-on-surface">
                {selectedMission
                  ? getStatusLabel(selectedMission.status)
                  : "Khong co nhiem vu"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-primary p-5 text-on-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-90">
                  Ho tro nhanh
                </p>
                <p className="text-lg font-headline font-bold">
                  Can thong tin bo sung tu trung tam?
                </p>
              </div>
              <FileCheck2 size={28} />
            </div>
            <button
              onClick={() => onViewChange("alerts")}
              className="mt-4 rounded-lg bg-on-primary px-4 py-2 text-sm font-bold text-primary"
            >
              Mo trung tam canh bao
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
