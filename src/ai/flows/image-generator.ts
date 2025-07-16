'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an image from text.
 * 
 * - generateImageFromText - A function that takes text and returns a generated image URL.
 * - GenerateImageInput - The input type for the flow.
 * - GenerateImageOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageInputSchema = z.object({
  text: z.string().describe("The text prompt to generate an image from."),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated image."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImageFromText(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate an artistic, painterly, and emotional image that captures the essence of the following journal entry. Avoid using text or words in the image. Focus on mood, color, and symbolism. Prompt: ${input.text}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed to produce an output.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
