import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import UserModal from "./UserModal";
import { createUser, getUsers, updateUser } from "@/src/shared/services/adminUser.service";
import { getRoles } from "@/src/shared/services/role.service";



// helper
const getUserRoleText = (roles: any[]) => {
  if (!roles || roles.length === 0) return "Không có";
  return roles.map((r) => r.name).join(", ");
};

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // ===== LOAD DATA =====
  const fetchData = async () => {
    try {
      setLoading(true);

      const userRes = await getUsers();
      const roleRes = await getRoles();

      setUsers(userRes.items);
      setRoles(roleRes.items);
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

  // ===== FILTER =====
  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter === "all" ||
        u.roles.some((r: any) => r.code === roleFilter))
  );

  // ===== ADD USER =====
  const handleAdd = async (data: any) => {
    try {
      await createUser({
        username: data.username,
        displayName: data.displayName,
        phone: data.phone,
        email: data.email,
        password: data.password,
        isActive: data.status === "active",
        roleCodes: [data.role],
      });

      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===== EDIT USER =====
  const handleEdit = async (data: any) => {
    try {
      await updateUser(data.id, {
        username: data.username, 
        displayName: data.displayName,
        phone: data.phone,
        email: data.email,
        isActive: data.status === "active",
        roleCodes: [data.role],
      });

      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} /> Thêm
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-4">
        <input
          placeholder="Tìm tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <select
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All</option>
          {roles.map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-t text-center">
                  <td>{u.username}</td>
                  <td>{u.displayName}</td>
                  <td>{u.email}</td>
                  <td>{getUserRoleText(u.roles)}</td>
                  <td>
                    {u.isActive ? "Hoạt động" : "Ngưng"}
                  </td>

                  <td className="flex justify-center gap-3 py-2">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setShowModal(true);
                      }}
                    >
                      <Edit size={18} />
                    </button>

                    {/* API chưa có delete nên tạm ẩn */}
                    {/* <button>
                      <Trash2 size={18} className="text-red-500" />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <UserModal
          roles={roles}
          defaultData={editingUser}
          onClose={() => setShowModal(false)}
          onSubmit={editingUser ? handleEdit : handleAdd}
        />
      )}
    </div>
  );
};

export default UserManagement;