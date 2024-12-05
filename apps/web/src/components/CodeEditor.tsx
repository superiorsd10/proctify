"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useToast } from "@repo/ui/components/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Button } from "@repo/ui/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { SERVER_BASE_URL } from "src/constants/configurationConstants";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

const POLL_INTERVAL = 2000; // 2 seconds

export function CodeEditor({
  problemId,
  problemNo,
  contestId,
  sampleInput,
  sampleOutput,
}: {
  problemId: string;
  problemNo: string;
  contestId: string;
  sampleInput: string;
  sampleOutput: string;
}) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const { userId } = useAuth();

  const pollSubmission = useCallback(
    async (runId: string, type: string) => {
      try {
        const response = await fetch(
          `${SERVER_BASE_URL}/contest/${type}-code/result?runId=${runId}`
        );
        if (response.status === 404) {
          // If status is 404, continue polling
          setTimeout(() => pollSubmission(runId, type), POLL_INTERVAL);
        } else if (response.ok) {
          const result = await response.json();
          setIsRunning(false);

          if (result.status.id <= 2) {
            setTimeout(() => pollSubmission(runId, type), POLL_INTERVAL);
          } else {
            let description = "";
            if (result.status.id === 3) {
              description = `Output: ${result.stdout}\nExecution Time: ${result.time} s\nMemory Used: ${result.memory} KB`;
            } else if (result.status.id === 6) {
              description = `Compilation Error: ${result.compile_output}`;
            } else {
              description = `Error: ${result.status.description}\n${result.stderr || ""}`;
            }

            toast({
              title: result.status.description,
              description: description,
              variant: result.status.id === 3 ? "default" : "destructive",
            });
          }
        } else {
          throw new Error("Failed to fetch submission status");
        }
      } catch (error) {
        setIsRunning(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get submission status",
        });
      }
    },
    [toast]
  );

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const response = await fetch(`${SERVER_BASE_URL}/contest/run-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestId,
          userId,
          problemNo,
          code,
          language,
          input: sampleInput,
          output: sampleOutput,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        pollSubmission(data.runId, "run");
      } else {
        throw new Error("Failed to run code");
      }
    } catch (error) {
      setIsRunning(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to run code",
      });
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    try {
      const response = await fetch(`${SERVER_BASE_URL}/contest/submit-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestId,
          userId,
          problemNo,
          problemId,
          code,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        pollSubmission(data.runId, "submit");
      } else {
        throw new Error("Failed to run code");
      }
    } catch (error) {
      setIsRunning(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to run code",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <MonacoEditor
        height="400px"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          automaticLayout: true,
        }}
      />
      <div className="flex space-x-4">
        <Button onClick={handleRun} variant="secondary" disabled={isRunning}>
          {isRunning ? "Running..." : "Run"}
        </Button>
        <Button onClick={handleSubmit} disabled={isRunning}>
          Submit
        </Button>
      </div>
    </div>
  );
}
