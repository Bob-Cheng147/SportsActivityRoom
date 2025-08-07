// src/utils/result.ts
export class Result {
  static success<T>(data: T) {
    return {
      success: true,
      data,
    };
  }

  static fail(message: string) {
    return {
      success: false,
      message,
    };
  }
}