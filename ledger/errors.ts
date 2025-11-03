export const StatusCodes = {
  OK: 0x9000,
  PIN_REMAINING_ATTEMPTS: 0x63c0,
  INCORRECT_LENGTH: 0x6700,
  MISSING_CRITICAL_PARAMETER: 0x6800,
  COMMAND_INCOMPATIBLE_FILE_STRUCTURE: 0x6981,
  SECURITY_STATUS_NOT_SATISFIED: 0x6982,
  CONDITIONS_OF_USE_NOT_SATISFIED: 0x6985,
  INCORRECT_DATA: 0x6a80,
  NOT_ENOUGH_MEMORY_SPACE: 0x6a84,
  REFERENCED_DATA_NOT_FOUND: 0x6a88,
  FILE_ALREADY_EXISTS: 0x6a89,
  INCORRECT_P1_P2: 0x6b00,
  INS_NOT_SUPPORTED: 0x6d00,
  CLA_NOT_SUPPORTED: 0x6e00,
  TECHNICAL_PROBLEM: 0x6f00,
  MEMORY_PROBLEM: 0x9240,
  NO_EF_SELECTED: 0x9400,
  INVALID_OFFSET: 0x9402,
  FILE_NOT_FOUND: 0x9404,
  INCONSISTENT_FILE: 0x9408,
  ALGORITHM_NOT_SUPPORTED: 0x9484,
  INVALID_KCV: 0x9485,
  CODE_NOT_INITIALIZED: 0x9802,
  ACCESS_CONDITION_NOT_FULFILLED: 0x9804,
  CONTRADICTION_SECRET_CODE_STATUS: 0x9808,
  CONTRADICTION_INVALIDATION: 0x9810,
  CODE_BLOCKED: 0x9840,
  MAX_VALUE_REACHED: 0x9850,
  GP_AUTH_FAILED: 0x6300,
  LICENSING: 0x6f42,
  HALTED: 0x6faa,
  LOCKED_DEVICE: 0x5515,
};

export function getAltStatusMessage(code: number): string {
  switch (code) {
    case 0x6700:
      return 'Incorrect length';
    case 0x6982:
      return 'Security not satisfied (dongle locked or have invalid access rights)';
    case 0x6985:
      return 'Condition of use not satisfied (denied by the user?)';
    case 0x6a80:
      return 'Invalid data received';
    case 0x6b00:
      return 'Invalid parameter received';
    case 0x5515:
      return 'Locked device';
    default:
      if (code >= 0x6700 && code <= 0x6fff) {
        return 'Invalid status ' + code.toString(16);
      }
      return 'Unknown Status Code: ' + code.toString(16);
  }
}

export class TransportError extends Error {
  name = 'TransportError';
  id: string;

  constructor(message: string, id: string) {
    super(message);
    this.id = id;
  }
}

export class TransportStatusError extends TransportError {
  statusCode: number;
  statusText: string;

  constructor(statusCode: number) {
    const statusText = getAltStatusMessage(statusCode);
    super(`Ledger device: ${statusText} (0x${statusCode.toString(16)})`, 'TransportStatusError');
    this.name = 'TransportStatusError';
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}

export class TransportRaceCondition extends TransportError {
  constructor(message: string) {
    super(message, 'TransportRaceCondition');
    this.name = 'TransportRaceCondition';
  }
}
