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


export const getRoles = async (): Promise<RoleListResponse> => {
    return requestApi("/api/v1/admin/roles");
};