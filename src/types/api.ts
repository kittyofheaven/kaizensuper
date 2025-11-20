export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface UserAngkatan {
  id: string;
  namaAngkatan: string;
}

export interface User {
  id: string;
  namaLengkap: string;
  namaPanggilan?: string;
  nomorWa: string;
  gender?: string;
  idAngkatan?: string;
  createdAt?: string;
  updatedAt?: string;
  angkatan?: UserAngkatan;
}

export interface AuthPayload {
  user: User;
  token: string;
  expiresIn?: string;
}

export type FacilityKey =
  | "communal"
  | "serbaguna"
  | "cws"
  | "theater"
  | "dapur"
  | "mesinCuciCewe"
  | "mesinCuciCowo";

export interface BookingSnippet {
  id: string;
  module: FacilityKey | string;
  waktuMulai?: string;
  waktuBerakhir?: string;
  penanggungJawab?: string;
  meta?: string;
  status?: string;
}

export interface DashboardSummary {
  userCount: number;
  bookingTotals: Record<FacilityKey, number>;
  latest: BookingSnippet[];
  baseUrl: string;
}
