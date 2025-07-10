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
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Prompt Generator</CardTitle>
        <CardDescription>
          Feeling stuck? Generate a prompt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic-input">Optional Topic</Label>
          <Input
            id="topic-input"
            placeholder="e.g., Gratitude, a challenge..."
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
          <div className="mt-4 rounded-lg border border-accent/20 bg-accent/10 p-4">
            <p className="text-accent-foreground/90">{prompt}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
