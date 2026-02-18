import request from '../utils/request';

// Configure base URL if needed, or rely on proxy
const API_BASE = '/api/evaluation';

export interface LaunchEvaluationParams {
  bidId: number;
  title: string;
  bidTitle: string;
  startTime: string; // yyyy-MM-dd HH:mm:ss
  endTime: string;
  mainExpertIds: number[];
  backupExpertIds: number[];
}

export const launchEvaluation = async (params: LaunchEvaluationParams) => {
  return request.post(`${API_BASE}/launch`, params);
};

export const getEvaluationDetail = async (code: string) => {
  return request.get(`${API_BASE}/${code}`);
};

export const getEvaluationList = async (params: { keyword?: string; status?: string }) => {
  return request.get(`${API_BASE}/list`, { params });
};

export const pauseEvaluation = async (code: string) => {
  return request.post(`${API_BASE}/${code}/pause`);
};

export const resumeEvaluation = async (code: string) => {
  return request.post(`${API_BASE}/${code}/resume`);
};

export const switchEvaluationStage = async (code: string) => {
  return request.post(`${API_BASE}/${code}/switch-stage`);
};

export const completeEvaluation = async (code: string) => {
  return request.post(`${API_BASE}/${code}/complete`);
};
