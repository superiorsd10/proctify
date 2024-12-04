import { z } from "zod";

export const createContestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  contestId: z.string().min(1, "Contest ID is required"),
  title: z.string().min(1, "Title is required"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  duration: z.number().positive("Duration must be a positive number"),
  problems: z
    .array(
      z.object({
        description: z.string().min(1, "Problem description is required"),
        inputFileUrl: z.string().url("Invalid link format"),
        outputFileUrl: z.string().url("Invalid link format"),
        sampleInput: z.string().min(1, "Sample input is required"),
        sampleOutput: z.string().min(1, "Sample output is required"),
      })
    )
    .nonempty(),
});
