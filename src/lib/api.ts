import {
  ApiResponse,
  AuthPayload,
  BookingSnippet,
  DashboardSummary,
  FacilityKey,
  Pagination,
  User,
} from "@/types/api";

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:3000/api/v1";

function normalizeBaseUrl(url: string) {
  const trimmed = url.replace(/\/$/, "");

  // Allow relative proxy (to avoid CORS) such as "/api/v1"
  if (!/^https?:\/\//.test(trimmed)) {
    return trimmed || "/api/v1";
  }

  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

export const API_BASE_URL = normalizeBaseUrl(rawBaseUrl);

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

const modulePathMap: Record<FacilityKey, string> = {
  communal: "/communal",
  serbaguna: "/serbaguna",
  cws: "/cws",
  theater: "/theater",
  dapur: "/dapur",
  mesinCuciCewe: "/mesin-cuci-cewe",
  mesinCuciCowo: "/mesin-cuci-cowo",
};

function resolveToken(tokenOverride?: string | null) {
  if (tokenOverride) return tokenOverride;
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  tokenOverride?: string,
): Promise<T> {
  const token = resolveToken(tokenOverride);
  const headers = new Headers(defaultHeaders);

  if (options.headers) {
    new Headers(options.headers as HeadersInit).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    }
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message: unknown }).message)
        : response.statusText || "Request failed";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export interface LoginPayload {
  nomorWa: string;
  password: string;
}

export interface PasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<ApiResponse<AuthPayload>> {
  return apiFetch<ApiResponse<AuthPayload>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchProfile(
  tokenOverride?: string,
): Promise<ApiResponse<User>> {
  return apiFetch<ApiResponse<User>>("/auth/profile", {}, tokenOverride);
}

export async function updatePassword(
  payload: PasswordPayload,
): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>("/auth/update-password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchUsers(params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  angkatanId?: string;
  searchWa?: string;
}): Promise<ApiResponse<User[]>> {
  const { searchWa, ...rest } = params;

  if (searchWa) {
    try {
      const res = await apiFetch<ApiResponse<User>>(
        `/users/wa/${encodeURIComponent(searchWa)}`,
      );
      const data = res.data ? [res.data] : [];
      return {
        success: true,
        data,
        message: res.message,
        pagination: {
          page: 1,
          limit: data.length || 1,
          total: data.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      const err = error as ApiError;
      if (err.status === 404) {
        return {
          success: true,
          data: [],
          message: "Nomor WA tidak ditemukan",
          pagination: { page: 1, limit: 1, total: 0, totalPages: 0 },
        };
      }
      throw error;
    }
  }

  if (rest.angkatanId) {
    const query = new URLSearchParams();
    if (rest.page) query.set("page", String(rest.page));
    if (rest.limit) query.set("limit", String(rest.limit));
    if (rest.sortBy) query.set("sortBy", rest.sortBy);
    if (rest.sortOrder) query.set("sortOrder", rest.sortOrder);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<ApiResponse<User[]>>(
      `/users/angkatan/${rest.angkatanId}${qs}`,
    );
  }

  const query = new URLSearchParams();
  if (rest.page) query.set("page", String(rest.page));
  if (rest.limit) query.set("limit", String(rest.limit));
  if (rest.sortBy) query.set("sortBy", rest.sortBy);
  if (rest.sortOrder) query.set("sortOrder", rest.sortOrder);

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<ApiResponse<User[]>>(`/users${qs}`);
}

export async function checkAdminAccess(
  tokenOverride?: string,
): Promise<boolean> {
  try {
    await apiFetch<ApiResponse<unknown>>(
      "/users?page=1&limit=1",
      {},
      tokenOverride,
    );
    return true;
  } catch (error) {
    const err = error as ApiError;
    if (err.status === 403) return false;
    throw error;
  }
}

async function countTotal(path: string): Promise<number> {
  try {
    const res = await apiFetch<ApiResponse<unknown>>(
      path.includes("?") ? path : `${path}?page=1&limit=1`,
    );
    const pagination = (res as ApiResponse<unknown>).pagination as
      | Pagination
      | undefined;
    if (pagination && typeof pagination.total === "number") {
      return pagination.total;
    }
    return Array.isArray((res as ApiResponse<unknown>).data)
      ? ((res as ApiResponse<unknown>).data as unknown[]).length
      : 0;
  } catch (error) {
    const err = error as ApiError;
    if (err.status === 403) return 0;
    console.warn("Failed to count records from", path, error);
    return 0;
  }
}

type BookingPayload = {
  id?: string | number;
  waktuMulai?: string;
  waktuBerakhir?: string;
  startTime?: string;
  endTime?: string;
  lantai?: string;
  area?: { namaArea?: string } | string;
  fasilitas?: { namaFasilitas?: string } | string;
  facility?: { name?: string };
  penanggungJawab?: { namaPanggilan?: string; namaLengkap?: string };
  peminjam?: { namaPanggilan?: string; namaLengkap?: string };
  user?: { namaPanggilan?: string; namaLengkap?: string };
  isDone?: boolean;
  status?: string;
};

function normalizeBooking(
  key: FacilityKey,
  item: unknown,
  fallbackMeta?: string,
): BookingSnippet {
  const record = (item ?? {}) as BookingPayload;

  const meta =
    fallbackMeta ||
    record.lantai ||
    (typeof record.area === "string"
      ? record.area
      : record.area?.namaArea) ||
    (typeof record.fasilitas === "string"
      ? record.fasilitas
      : record.fasilitas?.namaFasilitas) ||
    record.facility?.name;

  const who =
    record.penanggungJawab?.namaPanggilan ||
    record.penanggungJawab?.namaLengkap ||
    record.peminjam?.namaPanggilan ||
    record.peminjam?.namaLengkap ||
    record.user?.namaPanggilan ||
    record.user?.namaLengkap;

  const status =
    typeof record.isDone === "boolean"
      ? record.isDone
        ? "Done"
        : "Scheduled"
      : record.status;

  return {
    id: String(record.id ?? crypto.randomUUID()),
    module: key,
    waktuMulai: record.waktuMulai || record.startTime,
    waktuBerakhir: record.waktuBerakhir || record.endTime,
    penanggungJawab: who,
    meta,
    status,
  };
}

async function fetchLatestBookings(
  key: FacilityKey,
  path: string,
): Promise<BookingSnippet[]> {
  const queryPath = path.includes("?")
    ? path
    : `${path}?page=1&limit=4&sortBy=waktuMulai&sortOrder=desc`;

  try {
    const res = await apiFetch<ApiResponse<unknown>>(queryPath);
    const items = Array.isArray(res.data)
      ? res.data
      : res.data
        ? [res.data]
        : [];
    return items.slice(0, 4).map((item) => normalizeBooking(key, item));
  } catch (error) {
    const err = error as ApiError;
    if (err.status === 403) return [];
    console.warn("Failed fetching latest bookings", path, error);
    return [];
  }
}

export interface ModuleBookingsResult {
  items: BookingSnippet[];
  pagination?: Pagination;
}

export async function fetchModuleBookings(
  key: FacilityKey,
  params: { page?: number; limit?: number } = {},
): Promise<ModuleBookingsResult> {
  const basePath = modulePathMap[key];
  const query = new URLSearchParams();
  query.set("page", String(params.page || 1));
  query.set("limit", String(params.limit || 12));
  query.set("sortBy", "waktuMulai");
  query.set("sortOrder", "desc");

  const res = await apiFetch<ApiResponse<unknown>>(
    `${basePath}?${query.toString()}`,
  );

  const items = Array.isArray(res.data)
    ? res.data
    : res.data
      ? [res.data]
      : [];

  return {
    items: items.map((item) => normalizeBooking(key, item)),
    pagination: res.pagination,
  };
}

export async function deleteModuleBooking(
  key: FacilityKey,
  id: string | number,
): Promise<ApiResponse<unknown>> {
  const basePath = modulePathMap[key];
  return apiFetch<ApiResponse<unknown>>(`${basePath}/${id}`, {
    method: "DELETE",
  });
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const facilities: Array<{ key: FacilityKey; path: string }> = [
    { key: "communal", path: "/communal" },
    { key: "serbaguna", path: "/serbaguna" },
    { key: "cws", path: "/cws" },
    { key: "theater", path: "/theater" },
    { key: "dapur", path: "/dapur" },
    { key: "mesinCuciCewe", path: "/mesin-cuci-cewe" },
    { key: "mesinCuciCowo", path: "/mesin-cuci-cowo" },
  ];

  const userCountPromise = countTotal("/users?page=1&limit=1");

  const totalsEntries = await Promise.all(
    facilities.map(async ({ key, path }) => {
      const total = await countTotal(`${path}?page=1&limit=1`);
      return [key, total] as const;
    }),
  );

  const latestLists = await Promise.all(
    facilities.map(({ key, path }) => fetchLatestBookings(key, path)),
  );

  const bookingTotals = totalsEntries.reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<FacilityKey, number>,
  );

  const latest = latestLists
    .flat()
    .sort(
      (a, b) =>
        new Date(b.waktuMulai ?? 0).getTime() -
        new Date(a.waktuMulai ?? 0).getTime(),
    )
    .slice(0, 10);

  const userCount = await userCountPromise;

  return {
    userCount,
    bookingTotals,
    latest,
    baseUrl: API_BASE_URL,
  };
}
