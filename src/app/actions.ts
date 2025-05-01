"use server";

import { generateFormConfig as generateFormConfigFlow, GenerateFormConfigInput } from "@/ai/flows/generate-form-config";
import type { FormConfig } from '@/types/form';
import { db } from '@/lib/firebase'; // Import Firestore instance
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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


export async function saveFormConfigAction(formConfig: FormConfig): Promise<{ success: boolean; docId?: string } | { error: string }> {
  if (!formConfig || formConfig.length === 0) {
    return { error: "Form configuration is empty." };
  }

  try {
    console.log("Saving form config to Firestore:", formConfig);
    const docRef = await addDoc(collection(db, "formConfigurations"), {
      config: formConfig,
      createdAt: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
    return { success: true, docId: docRef.id };
  } catch (error: any) {
    console.error("Error saving form config to Firestore:", error);
    return { error: error.message || "Failed to save form configuration to Firebase." };
  }
}
