import { requestApi } from "./apiClient";


export interface CatalogItem {
    id: string;
    code: string;
    name: string;
    description: string | null;
}

export interface CatalogsResponse {
    skills: CatalogItem[];
    vehicleTypes: CatalogItem[];
    vehicleCapabilities: CatalogItem[];
    itemCategories: CatalogItem[];
}

export interface CatalogListResponse {
    items: CatalogItem[];
}

export interface CatalogPayload {
    code: string;
    name: string;
    description?: string;
}


export const getAllCatalogs = async (): Promise<CatalogsResponse> => {
    return requestApi("/api/v1/admin/catalogs");
};

export const getCatalogByType = async (
    catalogType: string
): Promise<CatalogListResponse> => {
    return requestApi(`/api/v1/admin/catalogs/${catalogType}`);
};

export const createCatalogItem = async (
    catalogType: string,
    payload: CatalogPayload
): Promise<void> => {
    return requestApi(`/api/v1/admin/catalogs/${catalogType}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};

export const updateCatalogItem = async (
    catalogType: string,
    itemId: string,
    payload: CatalogPayload
): Promise<void> => {
    return requestApi(
        `/api/v1/admin/catalogs/${catalogType}/${itemId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );
};

export const deleteCatalogItem = async (
    catalogType: string,
    itemId: string
): Promise<void> => {
    return requestApi(
        `/api/v1/admin/catalogs/${catalogType}/${itemId}`,
        {
            method: "DELETE",
        }
    );
};