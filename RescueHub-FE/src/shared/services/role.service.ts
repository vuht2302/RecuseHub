import { requestApi } from "./apiClient";


export interface RoleItem {
    id: string;
    code: string;
    name: string;
    description: string;
    assignedUserCount: number;
}

export interface RoleListResponse {
    items: RoleItem[];
}

export interface CreateRolePayload {
    code: string;
    name: string;
    description: string;
}

export interface UpdateRolePayload {
    code?: string;
    name?: string;
    description?: string;
}


export const getRoles = async (): Promise<RoleListResponse> => {
    return requestApi("/api/v1/admin/roles");
};


export const getRoleById = async (roleId: string): Promise<any> => {
    return requestApi(`/api/v1/admin/roles/${roleId}`);
};

export const createRole = async (
    payload: CreateRolePayload
): Promise<void> => {
    return requestApi("/api/v1/admin/roles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};

export const updateRole = async (
    roleId: string,
    payload: UpdateRolePayload
): Promise<void> => {
    return requestApi(`/api/v1/admin/roles/${roleId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};

export const deleteRole = async (roleId: string): Promise<void> => {
    return requestApi(`/api/v1/admin/roles/${roleId}`, {
        method: "DELETE",
    });
};