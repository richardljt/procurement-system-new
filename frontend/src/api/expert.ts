import request from '../utils/request';
import { Expert, ExpertQueryParams } from '../types/expert';

const API_BASE_URL = '/api/experts';

export const getExperts = async (params?: ExpertQueryParams): Promise<Expert[]> => {
  return request.get(API_BASE_URL, { params });
};

export const getExpertById = async (id: number): Promise<Expert> => {
  return request.get(`${API_BASE_URL}/${id}`);
};

export const createExpert = async (data: Partial<Expert>): Promise<Expert> => {
  return request.post(API_BASE_URL, data);
};

export const updateExpert = async (id: number, data: Partial<Expert>): Promise<Expert> => {
  return request.put(`${API_BASE_URL}/${id}`, data);
};

export const deleteExpert = async (id: number): Promise<void> => {
  return request.delete(`${API_BASE_URL}/${id}`);
};
