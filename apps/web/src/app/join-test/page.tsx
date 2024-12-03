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
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@repo/ui/components/hooks/use-toast";
import { SERVER_BASE_URL } from "src/constants/configurationConstants";

export default function JoinTest() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ code });

    const { userId } = useAuth();

    if (!userId) {
      toast({
        variant: "destructive",
        title: "User Not Authenticated",
        description: "You must be logged in to join a test.",
      });
      return;
    }

    const testData = {
      testId: code,
      userId: userId,
    };

    try {
      const response = await fetch(`${SERVER_BASE_URL}/test/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        const data = await response.json();

        toast({
          variant: "success",
          title: "Joined Test Successfully",
          description: data.message || "You have successfully joined the test.",
        });

        router.push(`/proctor?url=${encodeURIComponent(data.link)}`);
      } else {
        const errorData = await response.json();

        toast({
          variant: "destructive",
          title: "Error Joining Test",
          description:
            errorData.message || "There was an error joining the test.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    }
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
