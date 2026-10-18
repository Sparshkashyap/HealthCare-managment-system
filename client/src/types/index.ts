export type User = {
  id: string;
  fullName: string;
  email: string;
};

export type Patient = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  medicalNotes?: string | null;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Doctor = {
  id: string;
  fullName: string;
  specialization: string;
  email: string;
  phoneNumber?: string | null;
  clinicAddress?: string | null;
  yearsOfExperience: number;
  registrationNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Mapping = {
  id: string;
  patientId: string;
  doctorId: string;
  assignedAt: string;
  patient?: Patient;
  doctor?: Doctor;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
};
