import { requestApi } from "./apiClient";


export interface SystemSettings {
    otpTtlMinutes: number;
    accessTokenExpiryMinutes: number;
    refreshTokenExpiryHours: number;
    publicMapCacheSeconds: number;
    publicHotline: string;
    updatedAt: string;
}

export interface UpdateSystemSettingsPayload {
    otpTtlMinutes: number;
    accessTokenExpiryMinutes: number;
    refreshTokenExpiryHours: number;
    publicMapCacheSeconds: number;
    publicHotline: string;
}


export const getSystemSettings = async (): Promise<SystemSettings> => {
    return requestApi("/api/v1/admin/system-settings");
};

export const updateSystemSettings = async (
    payload: UpdateSystemSettingsPayload
): Promise<void> => {
    return requestApi("/api/v1/admin/system-settings", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};