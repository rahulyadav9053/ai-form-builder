'use server';

/**
 * @fileOverview Implements the suggestFormImprovements flow to iteratively refine form configurations based on user prompts.
 *
 * - suggestFormImprovements - A function that takes a form configuration and a prompt, and returns an improved form configuration.
 * - SuggestFormImprovementsInput - The input type for the suggestFormImprovements function.
 * - SuggestFormImprovementsOutput - The return type for the suggestFormImprovements function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define the input schema for the flow
const SuggestFormImprovementsInputSchema = z.object({
  formConfig: z.string().describe('The current JSON form configuration as a string.'),
  prompt: z.string().describe('A prompt describing the desired improvements to the form.'),
});
export type SuggestFormImprovementsInput = z.infer<typeof SuggestFormImprovementsInputSchema>;

// Define the output schema for the flow
const SuggestFormImprovementsOutputSchema = z.object({
  improvedFormConfig: z
    .string()
    .describe('The improved JSON form configuration as a string.'),
});
export type SuggestFormImprovementsOutput = z.infer<typeof SuggestFormImprovementsOutputSchema>;

// Exported function to call the flow
export async function suggestFormImprovements(
  input: SuggestFormImprovementsInput
): Promise<SuggestFormImprovementsOutput> {
  return suggestFormImprovementsFlow(input);
}

// Define the prompt
const suggestFormImprovementsPrompt = ai.definePrompt({
  name: 'suggestFormImprovementsPrompt',
  input: {
    schema: z.object({
      formConfig: z.string().describe('The current JSON form configuration as a string.'),
      prompt: z.string().describe('A prompt describing the desired improvements to the form.'),
    }),
  },
  output: {
    schema: z.object({
      improvedFormConfig: z
        .string()
        .describe('The improved JSON form configuration as a string.'),
    }),
  },
  prompt: `You are an AI expert in form design. Given the current form configuration and the user's prompt, improve the form configuration.

  Current Form Configuration:
  ```json
  {{{formConfig}}}
  ```

  Improvement Prompt: {{{prompt}}}

  Return the improved form configuration as a JSON string.
  Ensure the returned JSON is valid and parsable. Do not include any comments or explanations in the JSON.
  `,
});

// Define the flow
const suggestFormImprovementsFlow = ai.defineFlow<
  typeof SuggestFormImprovementsInputSchema,
  typeof SuggestFormImprovementsOutputSchema
>(
  {
    name: 'suggestFormImprovementsFlow',
    inputSchema: SuggestFormImprovementsInputSchema,
    outputSchema: SuggestFormImprovementsOutputSchema,
  },
  async input => {
    const {output} = await suggestFormImprovementsPrompt(input);
    return output!;
  }
);
