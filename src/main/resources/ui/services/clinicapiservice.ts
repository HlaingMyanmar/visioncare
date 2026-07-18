import { api } from './api';
import { ApiResponse, CustomerDTO, DoctorDTO, EyePrescriptionDTO, FrameDTO, LensDTO, OrderDTO } from '../types';

const unwrap = <T>(response: ApiResponse<T>) => response.data;

const crud = <T, K extends string | number>(basePath: string) => ({
  getAll: async () => unwrap(await api.get<any, ApiResponse<T[]>>(basePath)),
  getById: async (id: K) => unwrap(await api.get<any, ApiResponse<T>>(`${basePath}/${id}`)),
  create: async (payload: T) => unwrap(await api.post<any, ApiResponse<T>>(basePath, payload)),
  update: async (id: K, payload: T) => unwrap(await api.put<any, ApiResponse<T>>(`${basePath}/${id}`, payload)),
  delete: async (id: K) => unwrap(await api.delete<any, ApiResponse<void>>(`${basePath}/${id}`))
});

export const customerApi = crud<CustomerDTO, number>('/v1/customers');
export const doctorApi = crud<DoctorDTO, number>('/v1/doctors');
export const frameApi = crud<FrameDTO, string>('/v1/frames');
export const lensApi = crud<LensDTO, string>('/v1/lenses');
export const orderApi = crud<OrderDTO, number>('/v1/orders');

export const prescriptionApi = {
  ...crud<EyePrescriptionDTO, number>('/v1/prescriptions'),
  getByOrder: async (orderId: number) => unwrap(await api.get<any, ApiResponse<EyePrescriptionDTO[]>>(`/v1/prescriptions?orderId=${orderId}`))
};
