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
