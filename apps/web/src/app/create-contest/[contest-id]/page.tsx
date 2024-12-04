"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { ProblemSection, ProblemData } from "src/components/ProblemSection";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@repo/ui/components/hooks/use-toast";
import { SERVER_BASE_URL } from "src/constants/configurationConstants";

export default function CreateContest() {
  const params = useParams();
  const contestId = params["contest-id"] as string;

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [problems, setProblems] = useState<ProblemData[]>([]);

  const { userId } = useAuth();
  const { toast } = useToast();

  const addProblem = () => {
    setProblems([
      ...problems,
      {
        description: "",
        inputFile: null,
        outputFile: null,
        sampleInput: "",
        sampleOutput: "",
        points: 0,
      },
    ]);
  };

  const updateProblem = (index: number, data: ProblemData) => {
    const newProblems = [...problems];
    newProblems[index] = data;
    setProblems(newProblems);
  };

  const uploadFile = async (
    file: File,
    problemNumber: number,
    fileType: "input" | "output"
  ) => {
    const filename = `${fileType}s/${contestId}/${problemNumber}.txt`;
    const response = await fetch(`/api/upload-url?filename=${filename}`);
    const { url } = await response.json();

    await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    return `https://superiorsd10-proctify.s3.amazonaws.com/${filename}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const problemsWithUrls = await Promise.all(
        problems.map(async ({ inputFile, outputFile, ...rest }, index) => {
          const inputFileUrl = inputFile
            ? await uploadFile(inputFile, index + 1, "input")
            : null;
          const outputFileUrl = outputFile
            ? await uploadFile(outputFile, index + 1, "output")
            : null;

          return {
            ...rest,
            inputFileUrl,
            outputFileUrl,
          };
        })
      );

      const contestData = {
        userId,
        contestId,
        title,
        startTime,
        duration: Number(duration),
        problems: problemsWithUrls,
      };

      const response = await fetch(`${SERVER_BASE_URL}/contest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contestData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create contest: ${response.statusText}`);
      }

      toast({
        title: "Contest Created",
        description: "Your contest was successfully created!",
        variant: "success",
      });
    } catch (error) {
      console.error("Error creating contest:", error);

      toast({
        title: "Error",
        description:
          "There was an error creating the contest. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Create Contest: {contestId}</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Contest Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="start-time">Start Time</Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (in minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Problems</h2>
          {problems.map((_, index) => (
            <ProblemSection
              key={index}
              onChange={(data) => updateProblem(index, data)}
            />
          ))}
          <Button type="button" onClick={addProblem}>
            Add Problem
          </Button>
        </div>
        <Button type="submit">Create Contest</Button>
      </form>
    </div>
  );
}
