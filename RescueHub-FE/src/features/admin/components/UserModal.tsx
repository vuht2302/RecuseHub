import React, { useState } from "react";

const UserModal = ({ onClose, onSubmit, defaultData, roles }) => {
  const [form, setForm] = useState(
    defaultData
      ? {
          id: defaultData.id,
          username: defaultData.username,
          displayName: defaultData.displayName,
          email: defaultData.email,
          phone: defaultData.phone,
          role: defaultData.roles?.[0]?.code,
          status: defaultData.isActive ? "active" : "inactive",
          password: "",
        }
      : {
          username: "",
          displayName: "",
          email: "",
          phone: "",
          role: roles?.[0]?.code,
          status: "active",
          password: "",
        }
  );

  const handleSubmit = () => {
    if (!form.displayName || !form.email || !form.username) {
      alert("Nhập đầy đủ thông tin!");
      return;
    }

    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
        <h2 className="text-xl font-bold">
          {defaultData ? "Sửa user" : "Thêm user"}
        </h2>

        {/* USERNAME */}
        <input
          placeholder="Username"
          value={form.username}
          disabled={!!defaultData}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        {/* NAME */}
        <input
          placeholder="Tên"
          value={form.displayName}
          onChange={(e) =>
            setForm({ ...form, displayName: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        {/* EMAIL */}
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        {/* PHONE */}
        <input
          placeholder="SĐT"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        {/* PASSWORD (only create) */}
        {!defaultData && (
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        )}

        {/* ROLE */}
        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          {roles.map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </select>

        {/* STATUS */}
        <select
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngưng</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-blue-950 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;