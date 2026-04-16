export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    errors: null | string[];
};

const DEFAULT_API_BASE_URL = "https://rescuehub.onrender.com";

export const getApiBaseUrl = () =>
    (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).trim();

// 🔥 KEY STORAGE
const SESSION_KEY = "rescuehub.auth.session";

const getAccessToken = (): string | null => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;

        const session = JSON.parse(raw);
        return session?.accessToken ?? null;
    } catch (err) {
        console.error("Parse session lỗi", err);
        return null;
    }
};

const isTokenExpired = (): boolean => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return true;

        const session = JSON.parse(raw);
        if (!session?.expiresAt) return true;

        return new Date(session.expiresAt) < new Date();
    } catch {
        return true;
    }
};

export const requestApi = async <T>(
    path: string,
    init?: RequestInit,
): Promise<T> => {
    const token = getAccessToken();

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...init,
        headers: {
            Accept: "text/plain",
            ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {}),
            ...(init?.headers ?? {}),
        },
    });

    const result = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !result.success) {
        const backendError = result.errors?.[0] ?? result.message;

        // 🔥 HANDLE TOKEN EXPIRE
        if (response.status === 401 || isTokenExpired()) {
            console.warn("Token hết hạn → logout");

            localStorage.removeItem(SESSION_KEY);

            // redirect login (tuỳ bạn)
            window.location.href = "/login";
        }

        throw new Error(backendError || "Yeu cau that bai");
    }

    return result.data;
};