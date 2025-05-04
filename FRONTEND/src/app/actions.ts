"use server";

import { generateFormConfig as generateFormConfigFlow, GenerateFormConfigInput } from "@/ai/flows/generate-form-config";
import type { FormConfig } from '@/types/form';
import { db } from '@/lib/firebase'; // Import Firestore instance
import { collection, addDoc, doc, getDoc, setDoc, serverTimestamp, getDocs, QuerySnapshot, DocumentData, Timestamp, updateDoc , query, where} from 'firebase/firestore';
import { redirect } from 'next/navigation'; // Import redirect

// Modified: Save the generated config and return the document ID
export async function generateFormConfigAction(input: GenerateFormConfigInput): Promise<{ docId: string } | { error: string }> {
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

    // Save the newly generated config to Firestore
    const docRef = await addDoc(collection(db, "formConfigs"), {
      config: {
        title: input.prompt.split(' ').slice(0, 5).join(' '), // Use first 5 words of prompt as title
        elements: result.formConfig
      },
      createdAt: serverTimestamp(),
    });
    console.log("Generated form config saved with ID: ", docRef.id);

    // Return the ID instead of the config
    return { docId: docRef.id };

  } catch (error: any) {
    console.error("Error generating and saving form config:", error);
    return { error: error.message || "Failed to generate and save form configuration." };
  }
}

// NEW: Create an empty form config and return the ID
export async function createEmptyFormAction(): Promise<{ docId: string } | { error: string }> {
    try {
      console.log("Creating empty form config in Firestore");
      const docRef = await addDoc(collection(db, "formConfigs"), {
        config: {
          title: 'Untitled Form',
          elements: []
        },
        createdAt: serverTimestamp(),
      });
      console.log("Empty form document written with ID: ", docRef.id);
      return { docId: docRef.id };
    } catch (error: any) {
      console.error("Error creating empty form config:", error);
      return { error: error.message || "Failed to create empty form configuration." };
    }
}

// Updated: Fetch submissions from backend API
export async function getSubmissionsByFormId(formId: string): Promise<{ submissions: any[] } | { error: string }> {
  if (!formId) {
    return { error: 'formId is required' };
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/api/dashboard/analysis/${formId}`);
    if (!res.ok) {
      const errorText = await res.text();
      return { error: `API error: ${res.status} - ${errorText}` };
    }
    const data = await res.json();
    return { submissions: data.submissions };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch submissions from backend' };
  }
}

// DEPRECATED/REPLACED by updateFormConfigAction: Keep for reference or remove if sure
// export async function saveFormConfigAction(formConfig: FormConfig): Promise<{ success: boolean; docId?: string } | { error: string }> {
//   if (!formConfig || formConfig.length === 0) {
//     return { error: "Form configuration is empty." };
//   }

//   try {
//     console.log("Saving form config to Firestore:", formConfig);
//     const docRef = await addDoc(collection(db, "formConfigs"), {
//       config: formConfig,
//       createdAt: serverTimestamp(),
//     });
//     console.log("Document written with ID: ", docRef.id);
//     return { success: true, docId: docRef.id };
//   } catch (error: any) {
//     console.error("Error saving form config to Firestore:", error);
//     return { error: error.message || "Failed to save form configuration to Firebase." };
//   }
// }

// NEW: Update an existing form configuration by ID
export async function updateFormConfigAction(formId: string, formConfig: FormConfig): Promise<{ success: boolean } | { error: string }> {
    if (!formId) {
        return { error: "Form ID is required to update." };
    }
    if (!formConfig) { // Allow saving empty config []
        return { error: "Form configuration is missing." };
    }

    try {
        console.log(`Updating form config for ID ${formId} in Firestore:`, formConfig);
        const docRef = doc(db, "formConfigs", formId);
        await updateDoc(docRef, {
            config: formConfig,
            // Optionally update a 'lastModified' timestamp here
             lastModified: serverTimestamp(),
        });
        console.log(`Document ${formId} updated successfully.`);
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating form config ${formId} in Firestore:`, error);
        return { error: error.message || "Failed to update form configuration." };
    }
}


// Action to fetch a specific form configuration by ID (remains the same)
export async function getFormConfigAction(formId: string): Promise<{ formConfig: FormConfig } | { error: string }> {
  if (!formId) {
    return { error: "Form ID is required." };
  }

  try {
    console.log(`Fetching form config from Firestore with ID: ${formId}`);
    const docRef = doc(db, "formConfigs", formId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Form config found:", data.config);
      // Validate fetched data
       // Allow empty config array []
       if (!data.config || !data.config.elements || !Array.isArray(data.config.elements)) {
            console.error("Invalid config structure in Firestore document:", data);
            throw new Error("Fetched form configuration has an invalid structure.");
       }
       // Validate individual elements if config is not empty
       if (data.config.elements.length > 0) {
           data.config.elements.forEach((element: any, index: number) => {
             if (!element.type || !element.label || !element.name) {
               console.error(`Invalid element at index ${index} in fetched config:`, element);
               throw new Error(`Fetched element at index ${index} is missing required fields (type, label, name).`);
             }
           });
       }
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


// Updated Action to save a user's response to a specific form
interface SaveFormResponseInput {
    formId: string;
    responseData: Record<string, any>; // The submitted form data
    durationMs?: number; // Optional: Time taken in milliseconds
}
export async function saveFormResponseAction(input: SaveFormResponseInput): Promise<{ success: boolean; responseId?: string } | { error: string }> {
   const { formId, responseData, durationMs } = input;

   if (!formId) {
     return { error: "Form ID is required to save the response." };
   }
   if (!responseData || Object.keys(responseData).length === 0) {
     return { error: "Response data cannot be empty." };
   }

   try {
     console.log(`Saving response for form ID ${formId}:`, responseData);
     if (durationMs !== undefined) {
        console.log(`Submission duration: ${durationMs}ms`);
     }
     // Create a new document in a top-level 'formSubmissions' collection
     const responsesCollectionRef = collection(db, "formSubmissions");
     const docRef = await addDoc(responsesCollectionRef, {
       formId: formId, // Link back to the form configuration
       data: responseData,
       submittedAt: serverTimestamp(),
       durationMs: durationMs, // Store the duration
     });

     console.log("Response saved with ID: ", docRef.id);
     return { success: true, responseId: docRef.id };
   } catch (error: any) {
     console.error("Error saving form response to Firestore:", error);
     return { error: error.message || "Failed to save form response." };
   }
}

// Updated Type definition for dashboard data
export interface DashboardData {
  totalForms: number;
  totalResponses: number;
  responsesPerForm: Array<{
      formId: string;
      responseCount: number;
      createdAt: Date | null; // Store as Date object or null
      averageDurationSeconds: number | null; // Average submission time in seconds
      // You could add formName here if you store it in formConfigss
  }>;
}
export interface DashboardError {
    error: string;
}
export type DashboardActionResult = DashboardData | DashboardError;


// Updated Action to fetch dashboard analytics data
export async function getDashboardDataAction(): Promise<DashboardActionResult> {
  try {
    console.log("Fetching dashboard data...");

    // 1. Fetch all form configurations
    const formsSnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, "formConfigs"));
    const totalForms = formsSnapshot.size;
    const formsMap = new Map<string, { createdAt: Date | null }>();
    formsSnapshot.forEach(doc => {
        const data = doc.data();
        const createdAtTimestamp = data.createdAt as Timestamp | undefined;
        const createdAt = createdAtTimestamp ? createdAtTimestamp.toDate() : null;
        formsMap.set(doc.id, { createdAt });
    });
    console.log(`Found ${totalForms} forms.`);

    // 2. Fetch all form responses
    const responsesSnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, "formSubmissions"));
    const totalResponses = responsesSnapshot.size;
    console.log(`Found ${totalResponses} responses.`);

    // 3. Calculate responses per form AND aggregate duration data
    const responsesCountMap = new Map<string, number>();
    const durationSumMap = new Map<string, number>(); // Sum of durations for each form
    const durationCountMap = new Map<string, number>(); // Count of responses with duration for each form

    responsesSnapshot.forEach(doc => {
      const data = doc.data();
      const formId = data.formId as string;
      const durationMs = data.durationMs as number | undefined;

      if (formId) {
        // Count responses
        responsesCountMap.set(formId, (responsesCountMap.get(formId) || 0) + 1);

        // Aggregate duration if available
        if (durationMs !== undefined && typeof durationMs === 'number') {
          durationSumMap.set(formId, (durationSumMap.get(formId) || 0) + durationMs);
          durationCountMap.set(formId, (durationCountMap.get(formId) || 0) + 1);
        }
      }
    });

    // 4. Combine form details, response counts, and calculate average duration
    const responsesPerForm: DashboardData['responsesPerForm'] = Array.from(formsMap.entries()).map(([formId, formDetails]) => {
        const responseCount = responsesCountMap.get(formId) || 0;
        const totalDurationMs = durationSumMap.get(formId);
        const countWithDuration = durationCountMap.get(formId);
        let averageDurationSeconds: number | null = null;

        if (countWithDuration && countWithDuration > 0 && totalDurationMs !== undefined) {
          const averageMs = totalDurationMs / countWithDuration;
          averageDurationSeconds = averageMs / 1000; // Convert to seconds
        }

        return {
            formId,
            responseCount,
            createdAt: formDetails.createdAt,
            averageDurationSeconds,
        };
    });

     // Sort by creation date, newest first (optional)
     responsesPerForm.sort((a, b) => {
        if (!a.createdAt) return 1; // Put forms without date at the end
        if (!b.createdAt) return -1;
        return b.createdAt.getTime() - a.createdAt.getTime();
     });

    console.log("Dashboard data fetched successfully.");
    return {
      totalForms,
      totalResponses,
      responsesPerForm,
    };
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return { error: error.message || "Failed to fetch dashboard data." };
  }
}

// Helper action to navigate (can be called after other actions)
export async function navigateToEditPage(formId: string) {
    redirect(`/edit/${formId}`);
}
