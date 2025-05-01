"use client";

import React, { useState, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { generateFormConfigAction, saveFormConfigAction } from '@/app/actions';
import type { FormConfig, FormElement } from '@/types/form';
import { Download, Loader2, Plus, Sparkles, Trash2, Pencil, Save, Link as LinkIcon } from 'lucide-react'; // Added Save, LinkIcon
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from 'framer-motion';
import { AddFieldDialog } from './add-field-dialog';
import Link from 'next/link'; // Import NextLink

export function FormGenerator() {
  const [prompt, setPrompt] = useState('');
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [isGenerating, startGenerateTransition] = useTransition();
  const [isSaving, startSavingTransition] = useTransition();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [lastSavedFormId, setLastSavedFormId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for the form you want to generate.",
        variant: "destructive",
      });
      return;
    }

    startGenerateTransition(async () => {
      setFormConfig(null); // Clear previous config before generating new one
      setLastSavedFormId(null); // Clear last saved ID when generating new form
      const result = await generateFormConfigAction({ prompt });
      if ('error' in result) {
         toast({
            title: "Generation Failed",
            description: result.error,
            variant: "destructive",
         });
      } else {
        setFormConfig(result.formConfig);
        toast({
           title: "Form Generated!",
           description: "Your form preview is ready below. You can now modify it.",
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
        const newConfig = prevConfig.filter((_, index) => index !== indexToRemove);
        // Reset saved ID if config changes after saving
        setLastSavedFormId(null);
        return newConfig.length > 0 ? newConfig : null;
    });
     toast({
        title: "Field Removed",
        description: "The form field has been removed.",
        variant: 'default',
     });
  };

 const handleAddElement = (newElement: FormElement) => {
     setFormConfig(prevConfig => prevConfig ? [...prevConfig, newElement] : [newElement]);
      // Reset saved ID if config changes after saving
      setLastSavedFormId(null);
     toast({
         title: "Field Added",
         description: `Field "${newElement.label}" has been added to the form.`,
         variant: 'default',
     });
 };

 const handleSaveToFirebase = () => {
     if (!formConfig || formConfig.length === 0) {
         toast({
           title: "No Configuration",
           description: "Generate or add fields to the form before saving.",
           variant: "destructive",
         });
         return;
      }

     startSavingTransition(async () => {
       const result = await saveFormConfigAction(formConfig);
       if ('error' in result) {
         toast({
            title: "Save Failed",
            description: result.error,
            variant: "destructive",
         });
          setLastSavedFormId(null);
       } else {
          setLastSavedFormId(result.docId || null); // Store the saved ID
          const formUrl = result.docId ? `/${result.docId}` : '#'; // Construct URL
          toast({
             title: "Form Saved!",
             description: (
               <div>
                 Configuration saved to Firebase with ID: {result.docId}.<br />
                 <Link href={formUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
                   View Live Form <LinkIcon className="h-3 w-3" />
                 </Link>
               </div>
             ),
             variant: "default",
             duration: 10000, // Keep toast longer to allow clicking link
          });
       }
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
      {/* Prompt Input Card - Always Visible */}
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
            disabled={isGenerating || !prompt.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground" // Changed generate button to primary
          >
            {isGenerating ? (
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

      {/* Loading State Indicator - Shown below prompt card when pending */}
      {isGenerating && (
         <Card className="shadow-md animate-pulse">
           <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
           </CardHeader>
            <CardContent className="space-y-4">
                {/* Simulate a few loading form fields */}
                <div className="flex items-end gap-2">
                   <div className="flex-grow space-y-1">
                       <div className="h-4 bg-muted rounded w-1/4"></div>
                       <div className="h-10 bg-muted rounded"></div>
                   </div>
                   <div className="h-10 w-10 bg-muted rounded"></div>
                </div>
                 <div className="flex items-end gap-2">
                   <div className="flex-grow space-y-1">
                       <div className="h-4 bg-muted rounded w-1/3"></div>
                       <div className="h-10 bg-muted rounded"></div>
                   </div>
                   <div className="h-10 w-10 bg-muted rounded"></div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-3">
                 <div className="h-10 bg-muted rounded w-28"></div>
                 <div className="h-10 bg-muted rounded w-36"></div>
                 <div className="h-10 bg-muted rounded w-32"></div> {/* Placeholder for Save button */}
            </CardFooter>
         </Card>
      )}


      {/* Form Preview and Edit Section - Shown only when formConfig exists */}
      <AnimatePresence>
        {formConfig && !isGenerating && ( // Don't show preview while loading
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            key="form-preview-card" // Add key for AnimatePresence
          >
            <Card className="shadow-md transition-all duration-500 ease-out">
              <CardHeader>
                 <div>
                    <CardTitle className="text-2xl">Form Preview & Edit</CardTitle>
                    <CardDescription>Review the generated form. Add or remove fields, then save to get a shareable link.</CardDescription>
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
              <CardFooter className="flex flex-wrap justify-end space-x-3 gap-y-2"> {/* Added flex-wrap and gap-y for better responsiveness */}
                 <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} disabled={isSaving}>
                     <Plus className="mr-2 h-4 w-4" />
                     Add Field
                 </Button>
                 <Button onClick={downloadConfig} variant="ghost" disabled={isSaving}> {/* Changed Download to ghost */}
                     <Download className="mr-2 h-4 w-4" />
                     Download JSON
                 </Button>
                 <Button onClick={handleSaveToFirebase} variant="secondary" disabled={isSaving || !!lastSavedFormId} className="bg-accent hover:bg-accent/90 text-accent-foreground"> {/* Save is now accent color, disable if already saved */}
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                        ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                             {lastSavedFormId ? 'Saved!' : 'Save & Get Link'}
                        </>
                    )}
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
