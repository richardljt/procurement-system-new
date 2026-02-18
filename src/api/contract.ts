import request from '../utils/request';
import type { Contract, ContractArchivingItem } from '../types/contract';

export type { Contract, ContractArchivingItem };

export const getContractArchivingList = async (keyword?: string) => {
  return request.get<any, ContractArchivingItem[]>('/api/contracts/archiving-list', { params: { keyword } });
};

export const saveContractArchiving = async (contract: Contract) => {
  return request.post<any, void>('/api/contracts/archiving', contract);
};

export const getContract = async (id: number) => {
  return request.get<any, Contract>(`/api/contracts/${id}`);
};
