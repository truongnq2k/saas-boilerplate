import { Decimal } from '@prisma/client/runtime/library';

export interface IBalanceResponse {
  userId: number;
  balance: string;
}

export interface ITransactionDto {
  userId: number;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description?: string;
  reference?: string;
}

export interface ITransactionResponse {
  id: number;
  userId: number;
  amount: string;
  type: 'CREDIT' | 'DEBIT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string | null;
  reference: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ITransactionQuery {
  userId?: number;
  tenantId?: number;
  type?: 'CREDIT' | 'DEBIT';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface IAddBalanceDto {
  userId: number;
  amount: number;
  description?: string;
}

export interface ISubtractBalanceDto {
  userId: number;
  amount: number;
  description?: string;
}
