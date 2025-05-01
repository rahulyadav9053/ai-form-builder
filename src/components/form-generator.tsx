"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { generateFormConfigAction } from '@/app/actions';
import type { FormConfig, FormElement } from '@/types/form';
import { Download, Loader2, Plus, Sparkles, Trash2, Pencil, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from 'framer-motion';
import { AddFieldDialog } from './add-field-dialog';

type GeneratorStep = 'prompt' | 'preview';

export function FormGenerator() {
  const [prompt, setPrompt] = useState('');
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<GeneratorStep>('prompt');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for the form you want to generate.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      setFormConfig(null); // Clear previous config before generating new one
      const result = await generateFormConfigAction({ prompt });
      if ('error' in result) {
         toast({
            title: "Generation Failed",
            description: result.error,
            variant: "destructive",
         });
      } else {
        setFormConfig(result.formConfig);
        setCurrentStep('preview'); // Move to preview step
        toast({
           title: "Form Generated!",
           description: "Your form preview is ready. You can now modify it.",
           variant: "default",
        });
      }
    });
  };

 const downloadConfig = () => {
     if (!formConfig) {
       toast({
         title: "No Configuration",
         description: "Generate a form first before downloading.",
         variant: "destructive",
       });
       return;
     }
     const dataStr = JSON.stringify(formConfig, null, 2);
     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

     const exportFileDefaultName = 'form-config.json';

     const linkElement = document.createElement('a');
     linkElement.setAttribute('href', dataUri);
     linkElement.setAttribute('download', exportFileDefaultName);
     linkElement.click();
     toast({
         title: "Configuration Downloaded",
         description: "The form configuration JSON has been downloaded.",
     });
 };

 const handleRemoveElement = (indexToRemove: number) => {
    setFormConfig(prevConfig => {
        if (!prevConfig) return null;
        // Correctly filter the array to create a new one without the element at indexToRemove
        const newConfig = prevConfig.filter((_, index) => index !== indexToRemove);
        return newConfig;
    });
     toast({
        title: "Field Removed",
        description: "The form field has been removed.",
        variant: 'default', // Use default or a success variant
     });
  };

 const handleAddElement = (newElement: FormElement) => {
     setFormConfig(prevConfig => prevConfig ? [...prevConfig, newElement] : [newElement]);
     toast({
         title: "Field Added",
         description: `Field "${newElement.label}" has been added to the form.`,
         variant: 'default', // Use default or a success variant
     });
 };

 const renderFormElement = (element: FormElement, index: number) => {
    const key = `${element.name}-${index}-${element.type}`; // More robust key incorporating type

     const variants = {
        hidden: { opacity: 0, y: -10, height: 0 },
        visible: { opacity: 1, y: 0, height: 'auto' },
      };

     const motionProps = {
        key: key, // Use the robust key
        initial: "hidden",
        animate: "visible",
        exit: "hidden",
        variants: variants,
        transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }, // Spring animation
        layout: true, // Enable smooth layout changes
        className:"mb-4 grid grid-cols-[1fr_auto] items-end gap-2" // Grid layout for element + remove button
     };

     let formComponent: React.ReactNode;

    switch (element.type.toLowerCase()) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
        case 'date':
        case 'tel':
        case 'url':
          formComponent = (
             <div className="grid grid-cols-1 gap-1">
              <Label htmlFor={key}>{element.label}{element.required && '*'}</Label>
              <Input
                  id={key}
                  name={element.name}
                  type={element.type.toLowerCase()}
                  placeholder={element.placeholder || `Enter ${element.label.toLowerCase()}`}
                  required={element.required}
                  className="bg-secondary"
                  readOnly // Make preview inputs read-only
               />
            </div>
          );
          break;
        case 'textarea':
           formComponent = (
              <div className="grid grid-cols-1 gap-1">
               <Label htmlFor={key}>{element.label}{element.required && '*'}</Label>
               <Textarea
                   id={key}
                   name={element.name}
                   placeholder={element.placeholder || `Enter ${element.label.toLowerCase()}`}
                   required={element.required}
                    className="bg-secondary"
                    readOnly // Make preview textareas read-only
               />
             </div>
           );
           break;
        case 'select':
          formComponent = (
             <div className="grid grid-cols-1 gap-1">
              <Label htmlFor={key}>{element.label}{element.required && '*'}</Label>
              <Select name={element.name} required={element.required} disabled> {/* Disable preview selects */}
                <SelectTrigger id={key} className="bg-secondary">
                  <SelectValue placeholder={element.placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent>
                  {(element.options || []).map((option, i) => (
                    <SelectItem key={`${key}-option-${i}`} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
          break;
         case 'radio':
           formComponent = (
             <fieldset className="space-y-2 grid grid-cols-1 gap-1">
               <legend className="text-sm font-medium">{element.label}{element.required && '*'}</legend>
               <RadioGroup name={element.name} required={element.required} disabled> {/* Disable preview radio groups */}
                 {(element.options || []).map((option, i) => (
                   <div key={`${key}-option-${i}`} className="flex items-center space-x-2">
                     <RadioGroupItem value={option} id={`${key}-option-${i}`} />
                     <Label htmlFor={`${key}-option-${i}`} className="font-normal">{option}</Label>
                   </div>
                 ))}
               </RadioGroup>
             </fieldset>
           );
           break;
         case 'checkbox':
           formComponent = (
               <div className="flex items-center space-x-2 pt-2">
               <Checkbox id={key} name={element.name} required={element.required} disabled /> {/* Disable preview checkboxes */}
               <Label htmlFor={key} className="font-normal">{element.label}{element.required && '*'}</Label>
             </div>
           );
           break;
         case 'submit': // Handle potential submit button generation
           formComponent = (
              <div className="pt-4 col-span-full"> {/* Make submit span full width */}
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled> {/* Disable preview submit */}
                   {element.label || 'Submit'}
                </Button>
              </div>
            );
            // Since this is a submit button, we don't need a remove button for it typically
            return (
               <motion.div {...motionProps} className="mb-4 grid grid-cols-1 items-end gap-2">
                  {formComponent}
               </motion.div>
            );
           // break; // No break needed after return
        default:
          console.warn(`Unsupported form element type: ${element.type}`);
           formComponent = (
              <div className="grid grid-cols-1 gap-1">
                <Label htmlFor={key}>{element.label} (Unsupported Type: {element.type})</Label>
                <Input id={key} name={element.name} disabled className="bg-secondary" />
              </div>
            );
            break;
      }

     // Wrap the element and the remove button in the motion div
     return (
        <motion.div {...motionProps}>
             {formComponent}
             <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.preventDefault(); // Prevent any form submission if nested
                    handleRemoveElement(index);
                }}
                className="text-destructive hover:bg-destructive/10 h-10 w-10 self-end" // Align button to bottom
                aria-label={`Remove ${element.label} field`}
             >
               <Trash2 className="h-4 w-4" />
             </Button>
        </motion.div>
      );
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Prompt Input */}
      <AnimatePresence>
        {currentStep === 'prompt' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                   <Pencil className="text-primary" /> Describe Your Form
                </CardTitle>
                <CardDescription>
                  Enter a description of the form you need (e.g., "a user registration form with name, email, and password fields"). The AI will generate the structure.
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
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleGenerate}
                  disabled={isPending || !prompt.trim()}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                     <>
                       <Sparkles className="mr-2 h-4 w-4" />
                       Generate Form
                     </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State Indicator */}
      {isPending && currentStep === 'prompt' && (
         <Card className="shadow-md animate-pulse">
           <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
           </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-20 bg-muted rounded"></div> {/* Placeholder for textarea */}
            </CardContent>
            <CardFooter className="flex justify-end">
                <div className="h-10 bg-muted rounded w-32"></div> {/* Placeholder for button */}
            </CardFooter>
         </Card>
      )}


      {/* Step 2: Form Preview and Edit */}
      <AnimatePresence>
        {currentStep === 'preview' && formConfig && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          >
            <Card className="shadow-md transition-all duration-500 ease-out">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">Form Preview & Edit</CardTitle>
                      <CardDescription>Review the generated form. Add or remove fields as needed.</CardDescription>
                    </div>
                     <Button variant="outline" size="sm" onClick={() => setCurrentStep('prompt')}>
                         <ArrowLeft className="mr-2 h-4 w-4" />
                         Back to Prompt
                     </Button>
                </div>
              </CardHeader>
              <CardContent>
                 {/* Prevent form submission in preview */}
                 <form className="space-y-1" onSubmit={(e) => e.preventDefault()}>
                    <AnimatePresence initial={false}>
                     {formConfig.map(renderFormElement)}
                    </AnimatePresence>

                    {/* Add a default submit button preview if none generated */}
                    {!formConfig.some(el => el.type.toLowerCase() === 'submit') && (
                          <motion.div
                            key="default-submit-preview"
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ delay: formConfig.length * 0.05 }}
                             layout
                             className="pt-4"
                          >
                           <Button type="button" className="w-full" disabled>Submit (Preview)</Button>
                         </motion.div>
                     )}

                 </form>
              </CardContent>
              <CardFooter className="flex justify-end space-x-3">
                 <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                     <Plus className="mr-2 h-4 w-4" />
                     Add Field
                 </Button>
                 <Button onClick={downloadConfig} variant="default">
                     <Download className="mr-2 h-4 w-4" />
                     Download JSON
                 </Button>
               </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>


       <AddFieldDialog
         isOpen={isAddDialogOpen}
         onClose={() => setIsAddDialogOpen(false)}
         onAddField={handleAddElement}
       />
    </div>
  );
}
