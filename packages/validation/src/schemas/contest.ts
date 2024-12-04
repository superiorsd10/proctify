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
        points: z.number().positive("Duration must be a positive number"),
      })
    )
    .nonempty(),
});

export const joinContestSchema = z.object({
  contestId: z.string().min(1, "Contest ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const updateContestLogsSchema = z.object({
  contestId: z.string().min(1, "contestId is required"),
  userId: z.string().min(1, "userId is required"),
  violations: z
    .array(
      z.object({
        type: z.string().min(1, "Violation type is required"),
        count: z
          .number()
          .int()
          .nonnegative("Number of violations must be non-negative"),
      })
    )
    .nonempty("Violations array cannot be empty"),
});

export const runCodeSchema = z.object({
  contestId: z.string().min(1, "Contest ID is required"),
  userId: z.string().min(1, "User ID is required"),
  problemNo: z.string().min(1, "Problem No is required"),
  code: z.string().min(1, "Code is required"),
  language: z.enum(["javascript", "python", "java", "cpp"]),
  input: z.string().min(1, "Input is required"),
  output: z.string().min(1, "Output is required"),
});
