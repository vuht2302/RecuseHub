import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import RoleModal from "./RoleModal";

import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "@/src/shared/services/role.service";

const RoleManagement = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // ===== LOAD DATA =====
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getRoles();
      setRoles(res.items);
    } catch (err) {
      console.error(err);
      alert("Load role thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===== ADD =====
  const handleAdd = async (data: any) => {
    try {
      await createRole({
        code: data.code,
        name: data.name,
        description: data.description,
      });

      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===== EDIT =====
  const handleEdit = async (data: any) => {
    try {
      await updateRole(data.id, {
        code: data.code,
        name: data.name,
        description: data.description,
      });

      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===== DELETE =====
  const handleDelete = async (role: any) => {
    if (role.assignedUserCount > 0) {
      alert("Role đang được sử dụng, không thể xoá");
      return;
    }

    if (confirm("Xoá role này?")) {
      try {
        await deleteRole(role.id);
        await fetchData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Quản lý vai trò</h1>
        <button
          onClick={() => {
            setEditingRole(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 rounded"
        >
          <Plus size={18} /> Thêm role
        </button>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-2 gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="bg-white p-4 rounded-xl shadow space-y-3"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{role.name}</h3>
                  <p className="text-sm text-gray-500">
                    {role.code}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingRole(role);
                      setShowModal(true);
                    }}
                  >
                    <Edit size={18} />
                  </button>

                  <button onClick={() => handleDelete(role)}>
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {role.description || "Không có mô tả"}
              </div>

              <div className="text-xs text-gray-400">
                Số user: {role.assignedUserCount}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <RoleModal
          onClose={() => setShowModal(false)}
          onSubmit={editingRole ? handleEdit : handleAdd}
          defaultData={editingRole}
        />
      )}
    </div>
  );
};

export default RoleManagement;