'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating journaling prompts.
 *
 * - generateJournalPrompt - A function that generates a journaling prompt.
 * - JournalPromptInput - The input type for the generateJournalPrompt function.
 * - JournalPromptOutput - The return type for the generateJournalPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JournalPromptInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe('Optional topic to focus the journal prompt.'),
});
export type JournalPromptInput = z.infer<typeof JournalPromptInputSchema>;

const JournalPromptOutputSchema = z.object({
  prompt: z.string().describe('A suggested journaling prompt.'),
});
export type JournalPromptOutput = z.infer<typeof JournalPromptOutputSchema>;

export async function generateJournalPrompt(input: JournalPromptInput): Promise<JournalPromptOutput> {
  return generateJournalPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'journalPromptGeneratorPrompt',
  input: {schema: JournalPromptInputSchema},
  output: {schema: JournalPromptOutputSchema},
  prompt: `You are a helpful assistant designed to generate journaling prompts.

  The user may provide a topic to focus the prompt on, or not.  Either way, create a single prompt that will help them start writing in their journal.

  {{#if topic}}
  The topic is: {{{topic}}}
  {{/if}}
  `,
});

const generateJournalPromptFlow = ai.defineFlow(
  {
    name: 'generateJournalPromptFlow',
    inputSchema: JournalPromptInputSchema,
    outputSchema: JournalPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
