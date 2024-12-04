"use client";

import { useState } from "react";
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

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

export function CodeEditor({
  problemId,
  contestId,
  sampleInput,
  sampleOutput,
}: {
  problemId: number;
  contestId: string;
  sampleInput: string;
  sampleOutput: string;
}) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
  const { toast } = useToast();

  const handleRun = async () => {
    try {
      const response = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, input: sampleInput }),
      });
      const result = await response.json();
      toast({
        title: "Code Execution Result",
        description: `Output: ${result.output}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to run code",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/submit-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, problemId, contestId }),
      });
      const result = await response.json();
      toast({
        title: "Submission Result",
        description: result.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit code",
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
        <Button onClick={handleRun} variant="secondary">
          Run
        </Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
}
