import { ZodSchema, ZodError, ZodObject } from "zod";

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError["formErrors"] };

export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validData = schema.parse(data);

    return {
      success: true,
      data: validData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.formErrors,
      };
    }
    throw error;
  }
}

export function validatePartial<T>(schema: ZodSchema<T>, data: unknown) {
  try {
    const partialSchema =
      schema instanceof ZodObject ? schema.partial() : schema;
    return {
      success: true,
      data: partialSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.flatten(),
      };
    }
    throw error;
  }
}
