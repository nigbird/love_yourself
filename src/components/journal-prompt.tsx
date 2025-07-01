"use client";

import { useState } from "react";
import { generateJournalPrompt } from "@/ai/flows/journal-prompt-generator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

export function JournalPrompt() {
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePrompt = async () => {
    setIsLoading(true);
    setPrompt("");
    try {
      const result = await generateJournalPrompt({ topic });
      setPrompt(result.prompt);
    } catch (error) {
      console.error("Error generating prompt:", error);
      setPrompt(
        "Sorry, I couldn't generate a prompt right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Prompt Generator</CardTitle>
        <CardDescription>
          Feeling stuck? Generate a prompt to get your thoughts flowing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic-input">Optional Topic</Label>
          <Input
            id="topic-input"
            placeholder="e.g., Gratitude, a challenge I'm facing..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <Button
          onClick={handleGeneratePrompt}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Prompt
        </Button>
        {prompt && (
          <div className="mt-4 rounded-lg border bg-accent/50 p-4">
            <p className="text-accent-foreground">{prompt}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
