export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

export interface AppErrorShape {
  code: ErrorCode;
  message: string;
  fields?: Record<string, string>;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly fields?: Record<string, string>;

  constructor(shape: AppErrorShape) {
    super(shape.message);
    this.code = shape.code;
    this.fields = shape.fields;
  }

  toJSON(): AppErrorShape {
    return { code: this.code, message: this.message, fields: this.fields };
  }
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppErrorShape };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = (error: AppErrorShape): Result<never> => ({ ok: false, error });
