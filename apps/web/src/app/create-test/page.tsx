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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { useToast } from "@repo/ui/components/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";
import { SERVER_BASE_URL } from "src/constants/configurationConstants";

export default function CreateTest() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");

  const { toast } = useToast();

  const { userId } = useAuth();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = new Date(e.target.value);
    const currentTime = new Date();

    if (selectedTime > currentTime) {
      setStartTime(e.target.value);
    } else {
      console.log("Toast should trigger");
      toast({
        variant: "destructive",
        title: "Invalid Datetime",
        description: "Please select a future date and time.",
      });
      e.target.value = startTime;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, link, startTime, duration });

    if (!userId) {
      toast({
        variant: "destructive",
        title: "User Not Authenticated",
        description: "You must be logged in to join a test.",
      });
      return;
    }

    const testData = {
      title,
      createdBy: userId,
      link,
      startTime,
      duration: Number(duration),
    };

    try {
      const response = await fetch(`${SERVER_BASE_URL}/test`, {
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
          title: "Test Created",
          description: data.message || "The test was created successfully!",
        });

        const testCode = data.data.code as string;

        router.push(`/monitor/${testCode}`);
      } else {
        const errorData = await response.json();

        toast({
          variant: "destructive",
          title: "Failed to Create Test",
          description:
            errorData.message || "There was an error creating the test.",
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
          <CardTitle>Create New Test</CardTitle>
          <CardDescription>
            Enter the details for your new test.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter test title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link (URL)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://example.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={handleDateChange}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select onValueChange={setDuration} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                  <SelectItem value="150">150 minutes</SelectItem>
                  <SelectItem value="180">180 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Create Test
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
