type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: null | string[];
};

export interface BootstrapIncidentType {
  code: string;
  name: string;
}

export interface BootstrapQuickAction {
  code: string;
  label: string;
}

export interface BootstrapData {
  hotline: string;
  defaultMapCenter: {
    lat: number;
    lng: number;
  };
  quickIncidentTypes: BootstrapIncidentType[];
  quickActions: BootstrapQuickAction[];
}

export interface PublicAlertItem {
  id: string;
  eventType: string;
  title: string;
  message: string;
  sentAt: string;
}

export interface PublicAlertsData {
  items: PublicAlertItem[];
}

export interface PublicMapMarker {
  id: string;
  markerType: string;
  title: string;
  position: {
    lat: number;
    lng: number;
    addressText?: string;
  };
  status?: {
    code?: string;
    name?: string;
    color?: string;
  };
}

export interface PublicMapData {
  markers: PublicMapMarker[];
}

export interface PublicRescueFormField {
  factorCode: string;
  factorName: string;
  valueType: string;
  unitCode?: string;
  sortOrder: number;
}

export interface PublicRescueFormData {
  incidentTypes: BootstrapIncidentType[];
  dynamicFields: PublicRescueFormField[];
  vulnerableGroups: Array<{
    code: string;
    name: string;
  }>;
}

export interface PublicIncidentRequest {
  incidentTypeCode: string;
  reporterName: string;
  reporterPhone: string;
  description?: string;
  victimCountEstimate?: number;
  injuredCountEstimate?: number;
  vulnerableCountEstimate?: number;
  location: {
    lat: number;
    lng: number;
    addressText?: string;
    landmark?: string;
  };
  sceneDetails?: Array<{
    factorCode: string;
    valueText?: string;
    valueNumber?: number;
    unitCode?: string;
  }>;
  fileIds?: string[];
}

export interface PublicSosRequest {
  incidentTypeCode: string;
  reporterName: string;
  reporterPhone: string;
  victimCountEstimate?: number;
  hasInjured: boolean;
  hasVulnerablePeople: boolean;
  description?: string;
  location: {
    lat: number;
    lng: number;
    addressText?: string;
    landmark?: string;
  };
  fileIds?: string[];
}

export interface PublicIncidentResponse {
  incidentId: string;
  incidentCode: string;
  trackingCode: string;
  status: {
    code: string;
    name: string;
    color: string;
  };
  reportedAt: string;
}

export interface PublicReliefRequestItem {
  supportTypeCode: string;
  requestedQty: number;
  unitCode?: string;
}

export interface PublicReliefRequest {
  requesterName: string;
  requesterPhone: string;
  householdCount?: number;
  note?: string;
  items: PublicReliefRequestItem[];
}

export interface PublicReliefResponse {
  reliefRequestId: string;
  requestCode: string;
  status: {
    code: string;
    name: string;
    color: string;
  };
  requestedAt: string;
}

export interface PublicTrackingOtpRequest {
  phone: string;
  purpose: "TRACKING";
}

export interface PublicTrackingOtpResponse {
  expiredAt: string;
  otpCode?: string;
}

export interface PublicVerifyTrackingOtpRequest {
  phone: string;
  otpCode: string;
  purpose: "TRACKING";
}

export interface PublicVerifyTrackingOtpResponse {
  trackingToken: string;
}

export interface PublicTrackingHistoryItem {
  time: string;
  statusName: string;
  note?: string;
}

export interface PublicTrackingRescueResponse {
  incidentCode: string;
  status: {
    code: string;
    name: string;
    color: string;
  };
  latestUpdate?: string;
  history: PublicTrackingHistoryItem[];
  canAckRescue: boolean;
  relatedRelief: {
    needed: boolean;
    status: string;
  };
}

export interface PublicTrackingReliefItem {
  supportTypeCode: string;
  requestedQty: number;
  approvedQty: number;
  fulfilledQty: number;
}

export interface PublicTrackingReliefDistribution {
  id: string;
  distribution_code: string;
  distributed_at: string;
  ack_method_code?: string;
}

export interface PublicTrackingReliefResponse {
  requestCode: string;
  status: {
    code: string;
    name: string;
    color: string;
  };
  latestUpdate?: string;
  requestedAt: string;
  items: PublicTrackingReliefItem[];
  canAckRelief: boolean;
  distributions: PublicTrackingReliefDistribution[];
}

export interface PublicAckRequest {
  ackMethodCode: string;
  ackCode: string;
  note?: string;
}

export interface PublicAckResponse {
  acked: boolean;
  ackedAt: string;
}

type UploadedMedia = {
  fileId?: string;
  FileId?: string;
  id?: string;
  Id?: string;
};

const DEFAULT_API_BASE_URL = "https://rescuehub.onrender.com";

const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).trim();

const buildTrackingHeaders = (trackingToken?: string): HeadersInit => {
  if (!trackingToken?.trim()) {
    return {};
  }

  return {
    Authorization: `Bearer ${trackingToken.trim()}`,
    "X-Tracking-Token": trackingToken.trim(),
  };
};

const requestPublicApi = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "text/plain",
      ...(init?.headers ?? {}),
    },
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    const backendError = result.errors?.[0] ?? result.message;
    throw new Error(backendError || "Yeu cau that bai");
  }

  return result.data;
};

export const getPublicBootstrap = async (): Promise<BootstrapData> => {
  return requestPublicApi<BootstrapData>("/api/v1/public/bootstrap");
};

export const getPublicAlerts = async (): Promise<PublicAlertsData> => {
  return requestPublicApi<PublicAlertsData>("/api/v1/public/alerts");
};

export const getPublicMapData = async (
  lat: number,
  lng: number,
  radiusKm = 3,
): Promise<PublicMapData> => {
  const query = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radiusKm: radiusKm.toString(),
  });

  return requestPublicApi<PublicMapData>(
    `/api/v1/public/map-data?${query.toString()}`,
  );
};

export const getPublicRescueForm = async (): Promise<PublicRescueFormData> => {
  return requestPublicApi<PublicRescueFormData>("/api/v1/public/rescue-form");
};

export const createPublicSos = async (
  payload: PublicSosRequest,
): Promise<PublicIncidentResponse> => {
  return requestPublicApi<PublicIncidentResponse>(
    "/api/v1/public/incidents/sos",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
};

export const createPublicIncident = async (
  payload: PublicIncidentRequest,
): Promise<PublicIncidentResponse> => {
  return requestPublicApi<PublicIncidentResponse>("/api/v1/public/incidents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const createPublicReliefRequest = async (
  payload: PublicReliefRequest,
): Promise<PublicReliefResponse> => {
  return requestPublicApi<PublicReliefResponse>(
    "/api/v1/public/relief-requests",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
};

export const requestPublicTrackingOtp = async (
  payload: PublicTrackingOtpRequest,
): Promise<PublicTrackingOtpResponse> => {
  return requestPublicApi<PublicTrackingOtpResponse>(
    "/api/v1/public/tracking/request-otp",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
};

export const verifyPublicTrackingOtp = async (
  payload: PublicVerifyTrackingOtpRequest,
): Promise<PublicVerifyTrackingOtpResponse> => {
  return requestPublicApi<PublicVerifyTrackingOtpResponse>(
    "/api/v1/public/tracking/verify-otp",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
};

export const getPublicTrackingRescue = async (
  trackingCode: string,
  trackingToken?: string,
): Promise<PublicTrackingRescueResponse> => {
  return requestPublicApi<PublicTrackingRescueResponse>(
    `/api/v1/public/tracking/rescue/${encodeURIComponent(trackingCode)}`,
    {
      headers: {
        ...buildTrackingHeaders(trackingToken),
      },
    },
  );
};

export const ackPublicTrackingRescue = async (
  trackingCode: string,
  payload: PublicAckRequest,
  trackingToken?: string,
): Promise<PublicAckResponse> => {
  return requestPublicApi<PublicAckResponse>(
    `/api/v1/public/tracking/rescue/${encodeURIComponent(trackingCode)}/ack`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildTrackingHeaders(trackingToken),
      },
      body: JSON.stringify(payload),
    },
  );
};

export const getPublicTrackingRelief = async (
  requestCode: string,
  trackingToken?: string,
): Promise<PublicTrackingReliefResponse> => {
  return requestPublicApi<PublicTrackingReliefResponse>(
    `/api/v1/public/tracking/relief/${encodeURIComponent(requestCode)}`,
    {
      headers: {
        ...buildTrackingHeaders(trackingToken),
      },
    },
  );
};

export const ackPublicTrackingRelief = async (
  requestCode: string,
  payload: PublicAckRequest,
  trackingToken?: string,
): Promise<PublicAckResponse> => {
  return requestPublicApi<PublicAckResponse>(
    `/api/v1/public/tracking/relief/${encodeURIComponent(requestCode)}/ack`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildTrackingHeaders(trackingToken),
      },
      body: JSON.stringify(payload),
    },
  );
};

export const uploadIncidentMedia = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "INCIDENT_MEDIA");

  const data = await requestPublicApi<UploadedMedia>("/api/v1/media/upload", {
    method: "POST",
    body: formData,
  });

  const fileId = data.fileId ?? data.FileId ?? data.id ?? data.Id;
  if (!fileId) {
    throw new Error("Upload thanh cong nhung khong nhan duoc fileId");
  }

  return fileId;
};
