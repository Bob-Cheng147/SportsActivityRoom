// src/error/business.error.ts
export class BusinessError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = 'BusinessError';
  }
}

