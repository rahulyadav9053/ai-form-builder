"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js navigation
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateFormConfigAction, createEmptyFormAction, navigateToEditPage } from '@/app/actions'; // Import createEmptyFormAction
import { Loader2, Sparkles, Hammer, Pencil } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from '@/constants';


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

    startGenerateTransition(async () => {
      const result = await generateFormConfigAction({ prompt });
      if ('error' in result) {
         toast({
            title: "Generation Failed",
            description: result.error,
            variant: "destructive",
         });
         setMode(GeneratorMode.Idle);
      } else {
         router.push(ROUTES.BUILDER(result.docId));
      }
    });
  };

  const handleStartManualBuild = () => {
    router.push(ROUTES.BUILDER('new'));
  };


  const isLoading = isGenerating || isCreatingManual;

  return (
    <div className="space-y-6 w-full max-w-3xl">
      <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Pencil className="text-primary" />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Describe Your Form
            </span>
          </CardTitle>
          <CardDescription className="text-base">
            Enter a description and let AI generate the form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Create a contact form with fields for name, email address, subject, and message."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none bg-secondary/80 focus:bg-background transition-colors border-primary/20 focus:border-primary/50"
            aria-label="Form description prompt"
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md hover:shadow-lg transition-all"
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

      <Card
        className={`shadow-xl border-0 hover:shadow-2xl transition-all duration-300 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary/80'
        } bg-secondary/60 backdrop-blur-sm`}
        onClick={!isLoading ? handleStartManualBuild : undefined}
        role="button"
        aria-label="Start building the form manually"
        aria-disabled={isLoading}
      >
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {isCreatingManual ? (
              <Loader2 className="text-primary animate-spin" />
            ) : (
              <Hammer className="text-primary" />
            )}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Or Build Manually
            </span>
          </CardTitle>
          <CardDescription className="text-base">
            Click here to start creating your form from scratch in the editor.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
