export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Generic validation result helper
 */
export const createValidationResult = (isValid: boolean, errors: ValidationError[] = []): ValidationResult => ({
  isValid,
  errors
});

/**
 * Add validation error to result
 */
export const addValidationError = (errors: ValidationError[], field: string, message: string, code: string): ValidationError[] => {
  return [...errors, { field, message, code }];
};

/**
 * Validate required string fields
 */
export const validateRequiredString = (value: string | undefined | null, fieldName: string, minLength: number = 1, maxLength: number = 255): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!value || value.trim().length === 0) {
    errors.push({ field: fieldName, message: `${fieldName} is required`, code: 'REQUIRED' });
  } else {
    if (value.trim().length < minLength) {
      errors.push({ field: fieldName, message: `${fieldName} must be at least ${minLength} characters long`, code: 'MIN_LENGTH' });
    }
    if (value.trim().length > maxLength) {
      errors.push({ field: fieldName, message: `${fieldName} must not exceed ${maxLength} characters`, code: 'MAX_LENGTH' });
    }
  }

  return errors;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string | undefined | null, fieldName: string = 'email'): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: fieldName, message: 'Email is required', code: 'REQUIRED' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ field: fieldName, message: 'Invalid email format', code: 'INVALID_FORMAT' });
    }
  }

  return errors;
};

/**
 * Validate phone number (Vietnamese format)
 */
export const validatePhone = (phone: string | undefined | null, fieldName: string = 'phone'): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!phone) {
    errors.push({ field: fieldName, message: 'Phone number is required', code: 'REQUIRED' });
  } else {
    const phoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      errors.push({ field: fieldName, message: 'Invalid Vietnamese phone number format', code: 'INVALID_FORMAT' });
    }
  }

  return errors;
};

/**
 * Validate numeric fields
 */
export const validateNumber = (value: any, fieldName: string, options: {
  min?: number;
  max?: number;
  required?: boolean;
  integer?: boolean;
} = {}): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { min, max, required = false, integer = false } = options;

  if (value === null || value === undefined || value === '') {
    if (required) {
      errors.push({ field: fieldName, message: `${fieldName} is required`, code: 'REQUIRED' });
    }
    return errors;
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    errors.push({ field: fieldName, message: `${fieldName} must be a valid number`, code: 'INVALID_NUMBER' });
    return errors;
  }

  if (integer && !Number.isInteger(numValue)) {
    errors.push({ field: fieldName, message: `${fieldName} must be an integer`, code: 'INVALID_INTEGER' });
  }

  if (min !== undefined && numValue < min) {
    errors.push({ field: fieldName, message: `${fieldName} must be at least ${min}`, code: 'MIN_VALUE' });
  }

  if (max !== undefined && numValue > max) {
    errors.push({ field: fieldName, message: `${fieldName} must not exceed ${max}`, code: 'MAX_VALUE' });
  }

  return errors;
};

/**
 * Validate monetary amounts
 */
export const validateAmount = (amount: any, fieldName: string = 'amount', options: {
  min?: number;
  max?: number;
  required?: boolean;
} = {}): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { min = 0, max = 999999999, required = true } = options;

  if (amount === null || amount === undefined || amount === '') {
    if (required) {
      errors.push({ field: fieldName, message: `${fieldName} is required`, code: 'REQUIRED' });
    }
    return errors;
  }

  const numAmount = Number(amount);

  if (isNaN(numAmount)) {
    errors.push({ field: fieldName, message: `${fieldName} must be a valid number`, code: 'INVALID_AMOUNT' });
    return errors;
  }

  if (numAmount < min) {
    errors.push({ field: fieldName, message: `${fieldName} must be at least ${min.toLocaleString('vi-VN')} VNĐ`, code: 'MIN_AMOUNT' });
  }

  if (numAmount > max) {
    errors.push({ field: fieldName, message: `${fieldName} must not exceed ${max.toLocaleString('vi-VN')} VNĐ`, code: 'MAX_AMOUNT' });
  }

  // Check for more than 2 decimal places
  if (numAmount.toString().includes('.') && numAmount.toString().split('.')[1].length > 2) {
    errors.push({ field: fieldName, message: `${fieldName} cannot have more than 2 decimal places`, code: 'DECIMAL_PLACES' });
  }

  return errors;
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string | undefined | null, fieldName: string = 'url', required: boolean = false): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!url) {
    if (required) {
      errors.push({ field: fieldName, message: `${fieldName} is required`, code: 'REQUIRED' });
    }
    return errors;
  }

  try {
    new URL(url);
  } catch {
    errors.push({ field: fieldName, message: 'Invalid URL format', code: 'INVALID_URL' });
  }

  return errors;
};

/**
 * Validate Vietnamese ID card numbers
 */
export const validateIdCard = (idCard: string | undefined | null, fieldName: string = 'idCard'): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!idCard) {
    errors.push({ field: fieldName, message: 'ID card number is required', code: 'REQUIRED' });
  } else {
    const idCardRegex = /^[0-9]{9}$|^[0-9]{12}$/;
    if (!idCardRegex.test(idCard.replace(/[\s-]/g, ''))) {
      errors.push({ field: fieldName, message: 'Invalid ID card number format (must be 9 or 12 digits)', code: 'INVALID_FORMAT' });
    }
  }

  return errors;
};

/**
 * Validate Vietnamese bank account numbers
 */
export const validateBankAccount = (accountNumber: string | undefined | null, fieldName: string = 'accountNumber'): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!accountNumber) {
    errors.push({ field: fieldName, message: 'Bank account number is required', code: 'REQUIRED' });
  } else {
    const bankAccountRegex = /^[0-9]{8,20}$/;
    if (!bankAccountRegex.test(accountNumber.replace(/[\s-]/g, ''))) {
      errors.push({ field: fieldName, message: 'Invalid bank account number format (must be 8-20 digits)', code: 'INVALID_FORMAT' });
    }
  }

  return errors;
};

/**
 * Validate logistics order data
 */
export const validateLogisticsOrder = (orderData: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate source URL
  errors.push(...validateUrl(orderData.sourceUrl, 'sourceUrl', true));

  // Validate quantity
  errors.push(...validateNumber(orderData.quantity, 'quantity', {
    required: true,
    min: 1,
    max: 1000,
    integer: true
  }));

  // Validate customer info
  if (orderData.customerInfo) {
    errors.push(...validateRequiredString(orderData.customerInfo.name, 'customerName', 2, 100));
    errors.push(...validatePhone(orderData.customerInfo.phone, 'customerPhone'));
    errors.push(...validateRequiredString(orderData.customerInfo.address, 'customerAddress', 10, 500));
  } else {
    errors.push({ field: 'customerInfo', message: 'Customer information is required', code: 'REQUIRED' });
  }

  return createValidationResult(errors.length === 0, errors);
};

/**
 * Validate wallet transaction data
 */
export const validateWalletTransaction = (transactionData: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate amount
  errors.push(...validateAmount(transactionData.amount, 'amount', {
    min: 1000, // Minimum 1,000 VND
    max: 100000000, // Maximum 100M VND
    required: true
  }));

  // Validate transaction type
  const validTypes = ['FREEZE', 'UNFREEZE', 'PAYMENT', 'REFUND'];
  if (!transactionData.type || !validTypes.includes(transactionData.type)) {
    errors.push({ field: 'type', message: 'Invalid transaction type', code: 'INVALID_TYPE' });
  }

  // Validate description
  errors.push(...validateRequiredString(transactionData.description, 'description', 5, 500));

  return createValidationResult(errors.length === 0, errors);
};

/**
 * Validate deposit request data
 */
export const validateDepositRequest = (depositData: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate amount
  errors.push(...validateAmount(depositData.amount, 'amount', {
    min: 50000, // Minimum 50,000 VND
    max: 500000000, // Maximum 500M VND
    required: true
  }));

  // Validate bank info
  errors.push(...validateRequiredString(depositData.bankName, 'bankName', 3, 100));
  errors.push(...validateRequiredString(depositData.accountName, 'accountName', 3, 100));
  errors.push(...validateBankAccount(depositData.accountNumber, 'accountNumber'));

  // Validate transfer content
  if (depositData.transferContent) {
    errors.push(...validateRequiredString(depositData.transferContent, 'transferContent', 5, 50));
  }

  return createValidationResult(errors.length === 0, errors);
};

/**
 * Validate withdrawal request data
 */
export const validateWithdrawalRequest = (withdrawalData: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate amount
  errors.push(...validateAmount(withdrawalData.amount, 'amount', {
    min: 100000, // Minimum 100,000 VND
    max: 500000000, // Maximum 500M VND
    required: true
  }));

  // Validate bank info
  errors.push(...validateRequiredString(withdrawalData.bankName, 'bankName', 3, 100));
  errors.push(...validateRequiredString(withdrawalData.accountName, 'accountName', 3, 100));
  errors.push(...validateBankAccount(withdrawalData.accountNumber, 'accountNumber'));

  // Validate reason (optional)
  if (withdrawalData.reason) {
    errors.push(...validateRequiredString(withdrawalData.reason, 'reason', 5, 500));
  }

  return createValidationResult(errors.length === 0, errors);
};

/**
 * Throw validation error if validation fails
 */
export const throwIfInvalid = (validation: ValidationResult): void => {
  if (!validation.isValid) {
    const errorMessages = validation.errors.map(error => `${error.field}: ${error.message}`).join(', ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }
};