import request from '../utils/request';
import { ProcessStatusDTO, Contract } from '../types/process';

export const getProcessStatus = (procurementId: string) => {
    return request.get<any, ProcessStatusDTO>(`/api/process/${procurementId}/status`);
};

export const createContract = (data: Contract) => {
    return request.post<any, void>('/api/contracts', data);
};

export const updateContract = (data: Contract) => {
    return request.put<any, void>('/api/contracts', data);
};

export const getContract = (id: number) => {
    return request.get<any, Contract>(`/api/contracts/${id}`);
};

export const deleteContract = (id: number) => {
    return request.delete<any, void>(`/api/contracts/${id}`);
};
