"use server";

import { prisma } from "@repo/db";
import { signUpSchema, validate } from "@repo/validation";

type SignUpResponse = {
  success: boolean;
  error?: string | Record<string, string[]>;
  userId?: number;
};

export async function createUser(formData: unknown): Promise<SignUpResponse> {
  const validationResult = validate(signUpSchema, formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.formErrors.toString(),
    };
  }

  try {
    const { username, email } = validationResult.data;

    const exisitingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (exisitingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
      },
    });

    return {
      success: true,
      userId: newUser.id,
    };
  } catch (error) {
    console.error("Database user creation error", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
