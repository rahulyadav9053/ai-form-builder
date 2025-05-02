
"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js navigation
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateFormConfigAction, createEmptyFormAction, navigateToEditPage } from '@/app/actions'; // Import createEmptyFormAction
import { Loader2, Sparkles, Hammer, Pencil } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


enum GeneratorMode {
    Idle,
    AI_Generating,
    Manual_Creating,
}


export function FormGenerator() {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GeneratorMode>(GeneratorMode.Idle);
  const [isGenerating, startGenerateTransition] = useTransition();
  const [isCreatingManual, startManualCreateTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter(); // Initialize router


  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for the form you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setMode(GeneratorMode.AI_Generating);

    // Using startTransition for the async action
    startGenerateTransition(async () => {
      const result = await generateFormConfigAction({ prompt }); // This now saves and returns ID
      if ('error' in result) {
         toast({
            title: "Generation Failed",
            description: result.error,
            variant: "destructive",
         });
         setMode(GeneratorMode.Idle); // Revert to idle on error
      } else {
        // toast({
        //    title: "Form Generated & Saved!",
        //    description: `Redirecting you to the editor... (ID: ${result.docId})`,
        //    variant: "default",
        // });
         // Redirect to the new edit page
         router.push(`/edit/${result.docId}`);
         // Optional: Reset prompt after successful generation?
         // setPrompt('');
         // setMode(GeneratorMode.Idle); // Reset mode after redirect? Or let page handle it.
      }
    });
  };

  const handleStartManualBuild = () => {
      setMode(GeneratorMode.Manual_Creating); // Indicate creating state

      startManualCreateTransition(async () => {
          const result = await createEmptyFormAction(); // Call action to create empty form
          if ('error' in result) {
              toast({
                  title: "Failed to Start Manual Build",
                  description: result.error,
                  variant: "destructive",
              });
              setMode(GeneratorMode.Idle); // Revert to idle on error
          } else {
              toast({
                  title: "Manual Build Ready",
                  description: "Redirecting you to the editor...",
                  variant: "default",
              });
               // Redirect to the edit page with the new empty form's ID
               router.push(`/edit/${result.docId}`);
               // setMode(GeneratorMode.Idle); // Reset mode after redirect?
          }
      });
  };


  const isLoading = isGenerating || isCreatingManual;

  return (
    <div className="space-y-6 w-full max-w-3xl">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
             <Pencil className="text-primary" /> Describe Your Form
          </CardTitle>
          <CardDescription>
            Enter a description and let AI generate the form, or start building manually below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Create a contact form with fields for name, email address, subject, and message."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none bg-secondary focus:bg-background transition-colors"
            aria-label="Form description prompt"
            disabled={isLoading} // Disable while any action is in progress
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
               <>
                 <Sparkles className="mr-2 h-4 w-4" />
                 Generate & Edit Form
               </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* "Or Build Manually" Card */}
      <Card
        className={`shadow-md hover:shadow-lg transition-shadow ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary/90'} bg-secondary`}
        onClick={!isLoading ? handleStartManualBuild : undefined} // Disable click when loading
        role="button" // Make it clear it's clickable
        aria-label="Start building the form manually"
        aria-disabled={isLoading}
      >
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {isCreatingManual ? <Loader2 className="text-accent animate-spin" /> : <Hammer className="text-accent" />}
             Or Build Manually
          </CardTitle>
          <CardDescription>
            Click here to start creating your form from scratch in the editor.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
