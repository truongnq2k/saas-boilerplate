import { prisma } from '@/utils/prisma';
import { IAddBalanceDto, ISubtractBalanceDto, ITransactionQuery, ITransactionResponse, IBalanceResponse } from '@/types/balance';
import { extractPaginationParams, buildPaginationMeta, calculateSkip } from '@/utils/pagination';

export const getUserBalance = async (userId: number): Promise<IBalanceResponse> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      userId: user.id,
      balance: user.balance.toString(),
    };
  } catch (error) {
    console.error('Error getting user balance:', error);
    throw error;
  }
};

export const addBalance = async (data: IAddBalanceDto): Promise<ITransactionResponse> => {
  try {
    if (data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { id: true, balance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newBalance = user.balance.plus(data.amount);

      await tx.user.update({
        where: { id: data.userId },
        data: { balance: newBalance },
      });

      const createdTransaction = await tx.transaction.create({
        data: {
          user_id: data.userId,
          amount: data.amount,
          type: 'CREDIT',
          status: 'COMPLETED',
          description: data.description || 'Admin added balance',
          reference: data.description,
        },
      });

      return createdTransaction;
    });

    return {
      id: transaction.id,
      userId: transaction.user_id,
      amount: transaction.amount.toString(),
      type: transaction.type as 'CREDIT' | 'DEBIT',
      status: transaction.status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
      description: transaction.description,
      reference: transaction.reference,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  } catch (error) {
    console.error('Error adding balance:', error);
    throw error;
  }
};

export const subtractBalance = async (data: ISubtractBalanceDto): Promise<ITransactionResponse> => {
  try {
    if (data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { id: true, balance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.balance.lessThan(data.amount)) {
        throw new Error('Insufficient balance');
      }

      const newBalance = user.balance.minus(data.amount);

      await tx.user.update({
        where: { id: data.userId },
        data: { balance: newBalance },
      });

      const createdTransaction = await tx.transaction.create({
        data: {
          user_id: data.userId,
          amount: data.amount,
          type: 'DEBIT',
          status: 'COMPLETED',
          description: data.description || 'Admin subtracted balance',
          reference: data.description,
        },
      });

      return createdTransaction;
    });

    return {
      id: transaction.id,
      userId: transaction.user_id,
      amount: transaction.amount.toString(),
      type: transaction.type as 'CREDIT' | 'DEBIT',
      status: transaction.status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
      description: transaction.description,
      reference: transaction.reference,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  } catch (error) {
    console.error('Error subtracting balance:', error);
    throw error;
  }
};

export const getUserTransactions = async (userId: number, query: ITransactionQuery = {}): Promise<{ items: ITransactionResponse[]; pagination: any }> => {
  try {
    const pagination = extractPaginationParams(query);
    const skip = calculateSkip(pagination.page, pagination.limit);

    const where: any = { user_id: userId };

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    let orderBy: any = { created_at: 'desc' };
    if (query.sortBy) {
      orderBy = { [query.sortBy]: query.sortOrder || 'desc' };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy,
        skip,
        take: pagination.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    const items: ITransactionResponse[] = transactions.map((t) => ({
      id: t.id,
      userId: t.user_id,
      amount: t.amount.toString(),
      type: t.type as 'CREDIT' | 'DEBIT',
      status: t.status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
      description: t.description,
      reference: t.reference,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));

    return {
      items,
      pagination: buildPaginationMeta({
        page: pagination.page,
        limit: pagination.limit,
        total,
      }),
    };
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};

export const getAllTransactions = async (query: ITransactionQuery = {}): Promise<{ items: ITransactionResponse[]; pagination: any }> => {
  try {
    const pagination = extractPaginationParams(query);
    const skip = calculateSkip(pagination.page, pagination.limit);

    const where: any = {};

    if (query.userId) {
      where.user_id = query.userId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.tenantId) {
      const tenantUserIds = await prisma.user.findMany({
        where: { tenant_id: query.tenantId },
        select: { id: true },
      });
      where.user_id = { in: tenantUserIds.map(u => u.id) };
    }

    let orderBy: any = { created_at: 'desc' };
    if (query.sortBy) {
      orderBy = { [query.sortBy]: query.sortOrder || 'desc' };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy,
        skip,
        take: pagination.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    const items: ITransactionResponse[] = transactions.map((t) => ({
      id: t.id,
      userId: t.user_id,
      amount: t.amount.toString(),
      type: t.type as 'CREDIT' | 'DEBIT',
      status: t.status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
      description: t.description,
      reference: t.reference,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));

    return {
      items,
      pagination: buildPaginationMeta({
        page: pagination.page,
        limit: pagination.limit,
        total,
      }),
    };
  } catch (error) {
    console.error('Error getting all transactions:', error);
    throw error;
  }
};
