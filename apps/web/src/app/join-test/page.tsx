"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/components/ui/card";

export default function JoinTest() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //TODO: send the log data to your backend
    console.log({ code });
    //TODO: Navigate to test page after joining
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join a Test</CardTitle>
          <CardDescription>Enter the test code to join.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Code</Label>
              <Input
                id="code"
                placeholder="Enter test code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Join Test
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
