"use server";

import { generateFormConfig as generateFormConfigFlow, GenerateFormConfigInput } from "@/ai/flows/generate-form-config";
import type { FormConfig } from '@/types/form';
import { db } from '@/lib/firebase'; // Import Firestore instance
import { collection, addDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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

// Action to fetch a specific form configuration by ID
export async function getFormConfigAction(formId: string): Promise<{ formConfig: FormConfig } | { error: string }> {
  if (!formId) {
    return { error: "Form ID is required." };
  }

  try {
    console.log(`Fetching form config from Firestore with ID: ${formId}`);
    const docRef = doc(db, "formConfigurations", formId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Form config found:", data.config);
      // Validate fetched data
       if (!data.config || !Array.isArray(data.config)) {
            console.error("Invalid config structure in Firestore document:", data);
            throw new Error("Fetched form configuration has an invalid structure.");
       }
       data.config.forEach((element: any, index: number) => {
         if (!element.type || !element.label || !element.name) {
           console.error(`Invalid element at index ${index} in fetched config:`, element);
           throw new Error(`Fetched element at index ${index} is missing required fields (type, label, name).`);
         }
       });
      return { formConfig: data.config as FormConfig };
    } else {
      console.log("No such document!");
      return { error: "Form configuration not found." };
    }
  } catch (error: any) {
    console.error("Error fetching form config from Firestore:", error);
    return { error: error.message || "Failed to fetch form configuration." };
  }
}


// Action to save a user's response to a specific form
interface SaveFormResponseInput {
    formId: string;
    responseData: Record<string, any>; // The submitted form data
}
export async function saveFormResponseAction(input: SaveFormResponseInput): Promise<{ success: boolean; responseId?: string } | { error: string }> {
   const { formId, responseData } = input;

   if (!formId) {
     return { error: "Form ID is required to save the response." };
   }
   if (!responseData || Object.keys(responseData).length === 0) {
     return { error: "Response data cannot be empty." };
   }

   try {
     console.log(`Saving response for form ID ${formId}:`, responseData);
     // Create a new document in a subcollection 'responses' under the specific form config document
     // Or use a top-level 'formResponses' collection and store formId within the document
     // Using a top-level collection for simplicity here:
     const responsesCollectionRef = collection(db, "formResponses");
     const docRef = await addDoc(responsesCollectionRef, {
       formId: formId, // Link back to the form configuration
       data: responseData,
       submittedAt: serverTimestamp(),
     });

     console.log("Response saved with ID: ", docRef.id);
     return { success: true, responseId: docRef.id };
   } catch (error: any) {
     console.error("Error saving form response to Firestore:", error);
     return { error: error.message || "Failed to save form response." };
   }
}
