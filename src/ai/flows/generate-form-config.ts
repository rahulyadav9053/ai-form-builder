'use server';

/**
 * @fileOverview A form configuration generation AI agent.
 *
 * - generateFormConfig - A function that handles the form configuration generation process.
 * - GenerateFormConfigInput - The input type for the generateFormConfig function.
 * - GenerateFormConfigOutput - The return type for the generateFormConfig function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateFormConfigInputSchema = z.object({
  prompt: z.string().describe('A description of the form to generate.'),
});
export type GenerateFormConfigInput = z.infer<typeof GenerateFormConfigInputSchema>;

const FormElementSchema = z.object({
  type: z.string().describe('The type of the form element (e.g., text, number, select).'),
  label: z.string().describe('The label for the form element.'),
  name: z.string().describe('The name of the form element.'),
  options: z
    .array(z.string())
    .optional()
    .describe('Optional list of options for select or radio elements.'),
});

const GenerateFormConfigOutputSchema = z.object({
  formConfig: z.array(FormElementSchema).describe('The generated form configuration.'),
});
export type GenerateFormConfigOutput = z.infer<typeof GenerateFormConfigOutputSchema>;

export async function generateFormConfig(input: GenerateFormConfigInput): Promise<GenerateFormConfigOutput> {
  return generateFormConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFormConfigPrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('A description of the form to generate.'),
    }),
  },
  output: {
    schema: z.object({
      formConfig: z.array(FormElementSchema).describe('The generated form configuration.'),
    }),
  },
  prompt: `You are an AI form generator that takes a description of a form and returns a JSON configuration for the form.

  The form configuration should be an array of form elements, where each element has a type, label, and name.
  If the element is a select or radio, it should also have an options field.

  Description: {{{prompt}}}`,
});

const generateFormConfigFlow = ai.defineFlow<
  typeof GenerateFormConfigInputSchema,
  typeof GenerateFormConfigOutputSchema
>(
  {
    name: 'generateFormConfigFlow',
    inputSchema: GenerateFormConfigInputSchema,
    outputSchema: GenerateFormConfigOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
