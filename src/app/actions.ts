"use server";

import { generateFormConfig as generateFormConfigFlow, GenerateFormConfigInput } from "@/ai/flows/generate-form-config";
import type { FormConfig } from '@/types/form';

export async function generateFormConfigAction(input: GenerateFormConfigInput): Promise<{ formConfig: FormConfig } | { error: string }> {
  try {
    console.log("Generating form config with input:", input);
    const result = await generateFormConfigFlow(input);
    console.log("AI generation result:", result);

    // Basic validation to ensure the result matches expected structure
    if (!result || !Array.isArray(result.formConfig)) {
       console.error("Invalid response structure from AI:", result);
       throw new Error("Received invalid configuration structure from AI.");
    }
     // Ensure each element has required fields (type, label, name)
     result.formConfig.forEach((element, index) => {
       if (!element.type || !element.label || !element.name) {
         console.error(`Invalid element at index ${index}:`, element);
         throw new Error(`Generated element at index ${index} is missing required fields (type, label, name).`);
       }
     });

    return { formConfig: result.formConfig };
  } catch (error: any) {
    console.error("Error generating form config:", error);
    return { error: error.message || "Failed to generate form configuration." };
  }
}
