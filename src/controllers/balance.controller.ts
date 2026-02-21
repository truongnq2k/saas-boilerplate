import { FastifyReply, FastifyRequest } from "fastify";
import { getUserBalance, addBalance, subtractBalance, getUserTransactions, getAllTransactions } from "@/services/balance.service";
import { IAddBalanceDto, ISubtractBalanceDto, ITransactionQuery } from "@/types/balance";
import { errorResponse, successResponse, forbiddenResponse } from "@/utils/response";

export async function getUserBalanceHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as any;
    const userId = authRequest.user?.userId;

    if (!userId) {
      return reply.status(401).send(
        forbiddenResponse("Authentication required")
      );
    }

    const balance = await getUserBalance(userId);

    return reply.status(200).send(
      successResponse(balance, "Balance retrieved successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to get balance", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to get balance")
    );
  }
}

export async function getUserTransactionsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as any;
    const userId = authRequest.user?.userId;

    if (!userId) {
      return reply.status(401).send(
        forbiddenResponse("Authentication required")
      );
    }

    const query = request.query as ITransactionQuery;
    const result = await getUserTransactions(userId, query);

    return reply.status(200).send(
      successResponse(result, "Transactions retrieved successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to get transactions", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to get transactions")
    );
  }
}

export async function addBalanceHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as any;
    const role = authRequest.user?.role;

    if (role !== 'ADMIN') {
      return reply.status(403).send(
        forbiddenResponse("Admin access required")
      );
    }

    const data = request.body as IAddBalanceDto;

    if (!data.userId || !data.amount) {
      return reply.status(400).send(
        errorResponse("Bad Request", "User ID and amount are required")
      );
    }

    if (data.amount <= 0) {
      return reply.status(400).send(
        errorResponse("Bad Request", "Amount must be greater than 0")
      );
    }

    const transaction = await addBalance(data);

    return reply.status(201).send(
      successResponse(transaction, "Balance added successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to add balance", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to add balance")
    );
  }
}

export async function subtractBalanceHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as any;
    const role = authRequest.user?.role;

    if (role !== 'ADMIN') {
      return reply.status(403).send(
        forbiddenResponse("Admin access required")
      );
    }

    const data = request.body as ISubtractBalanceDto;

    if (!data.userId || !data.amount) {
      return reply.status(400).send(
        errorResponse("Bad Request", "User ID and amount are required")
      );
    }

    if (data.amount <= 0) {
      return reply.status(400).send(
        errorResponse("Bad Request", "Amount must be greater than 0")
      );
    }

    const transaction = await subtractBalance(data);

    return reply.status(201).send(
      successResponse(transaction, "Balance subtracted successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to subtract balance", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to subtract balance")
    );
  }
}

export async function getAllTransactionsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as any;
    const role = authRequest.user?.role;

    if (role !== 'ADMIN') {
      return reply.status(403).send(
        forbiddenResponse("Admin access required")
      );
    }

    const query = request.query as ITransactionQuery;
    const result = await getAllTransactions(query);

    return reply.status(200).send(
      successResponse(result, "All transactions retrieved successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to get transactions", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to get transactions")
    );
  }
}
