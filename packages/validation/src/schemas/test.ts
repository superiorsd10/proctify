import { z } from "zod";

export const createTestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  createdBy: z.string().min(1, "Created by is required"),
  link: z.string().url("Invalid link format"),
  startTime: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid start time format"),
  duration: z.number().positive("Duration must be a positive number"),
});

export const joinTestSchema = z.object({
  testId: z.string().min(1, "Test ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const updateLogsSchema = z.object({
  testId: z.string().min(1, "testId is required"),
  userId: z.string().min(1, "userId is required"),
  violations: z
    .array(
      z.tuple([
        z.string().min(1, "Violation type is required"),
        z
          .number()
          .int()
          .nonnegative("Number of violations must be non-negative"),
      ])
    )
    .nonempty("Violations array cannot be empty"),
});
