"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { updateFormConfigAction } from '@/app/actions'; // Use update action
import type { FormConfig, FormElement } from '@/types/form';
import { Loader2, Plus, Trash2, Save, Link as LinkIcon, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from 'framer-motion';
import { AddFieldDialog } from './add-field-dialog';
import Link from 'next/link';

interface FormEditorProps {
  initialConfig: FormConfig;
  formId: string;
}

export function FormEditor({ initialConfig, formId }: FormEditorProps) {
  const [formConfig, setFormConfig] = useState<FormConfig>(initialConfig);
  const [isSaving, startSavingTransition] = useTransition();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // Track unsaved changes

   // Update internal state if initialConfig changes (e.g., navigating between editors)
   useEffect(() => {
     setFormConfig(initialConfig);
     setHasChanges(false); // Reset changes when initial config loads
   }, [initialConfig]);


  const handleRemoveElement = (indexToRemove: number) => {
    setFormConfig(prevConfig => {
        const newConfig = prevConfig.filter((_, index) => index !== indexToRemove);
        setHasChanges(true); // Mark changes
        return newConfig;
    });
     toast({
        title: "Field Removed",
        description: "The form field has been removed. Save your changes.",
        variant: 'default',
     });
  };

 const handleAddElement = (newElement: FormElement) => {
     setFormConfig(prevConfig => [...prevConfig, newElement]);
     setHasChanges(true); // Mark changes
     toast({
         title: "Field Added",
         description: `Field "${newElement.label}" has been added. Save your changes.`,
         variant: 'default',
     });
 };

 const handleSaveChanges = () => {
     if (!formConfig) { // Check if formConfig is null/undefined - shouldn't happen with initial state but good practice
         toast({
           title: "Error",
           description: "Cannot save, form configuration is missing.",
           variant: "destructive",
         });
         return;
      }
      if (!hasChanges) {
           toast({
               title: "No Changes",
               description: "No changes detected to save.",
               variant: "default",
           });
           return;
      }

     startSavingTransition(async () => {
       // Use the updateFormConfigAction with the current formId
       const result = await updateFormConfigAction(formId, formConfig);
       if ('error' in result) {
         toast({
            title: "Save Failed",
            description: result.error,
            variant: "destructive",
         });
       } else {
          setHasChanges(false); // Reset changes flag after successful save
          toast({
             title: "Form Saved!",
             description: (
               <div>
                 Your changes have been saved successfully.<br />
                 <Link href={`/${formId}`} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
                   View Live Form <LinkIcon className="h-3 w-3" />
                 </Link>
               </div>
             ),
             variant: "default",
             duration: 10000, // Keep toast longer
          });
       }
     });
 };

 const renderFormElement = (element: FormElement, index: number) => {
  const key = `${element.name}-${index}-${element.type}`; // More robust key

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
        transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 30 },
        layout: true,
        className:"mb-4 grid grid-cols-[1fr_auto] items-end gap-2 bg-card p-4 rounded-lg border shadow-sm" // Add styling to each item
     };

     let formComponent: React.ReactNode;

    // Render read-only previews within the editor card
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
              <Label htmlFor={key} className="font-semibold">{element.label}{element.required && '*'}</Label>
              <Input
                  id={key}
                  name={element.name}
                  type={element.type.toLowerCase()}
                  placeholder={element.placeholder || `(Placeholder: ${element.label.toLowerCase()})`}
                  required={element.required}
                  className="bg-secondary cursor-not-allowed" // Style as read-only preview
                  readOnly
               />
               <small className="text-muted-foreground text-xs">Type: {element.type}, Name: {element.name}</small>
            </div>
          );
          break;
        case 'textarea':
           formComponent = (
              <div className="grid grid-cols-1 gap-1">
               <Label htmlFor={key} className="font-semibold">{element.label}{element.required && '*'}</Label>
               <Textarea
                   id={key}
                   name={element.name}
                   placeholder={element.placeholder || `(Placeholder: ${element.label.toLowerCase()})`}
                   required={element.required}
                    className="bg-secondary cursor-not-allowed" // Style as read-only preview
                    readOnly
               />
                <small className="text-muted-foreground text-xs">Type: textarea, Name: {element.name}</small>
             </div>
           );
           break;
        case 'select':
          formComponent = (
             <div className="grid grid-cols-1 gap-1">
              <Label htmlFor={key} className="font-semibold">{element.label}{element.required && '*'}</Label>
              <Select name={element.name} required={element.required} disabled>
                <SelectTrigger id={key} className="bg-secondary cursor-not-allowed">
                  <SelectValue placeholder={element.placeholder || '(Select an option)'} />
                </SelectTrigger>
                 {/* Don't render SelectContent in preview, maybe list options */}
              </Select>
              <small className="text-muted-foreground text-xs">
                 Type: select, Name: {element.name}
                 {element.options && element.options.length > 0 && `, Options: ${element.options.join(', ')}`}
               </small>
            </div>
          );
          break;
         case 'radio':
           formComponent = (
             <fieldset className="space-y-2 grid grid-cols-1 gap-1">
               <legend className="text-sm font-semibold">{element.label}{element.required && '*'}</legend>
               <RadioGroup name={element.name} required={element.required} disabled className="cursor-not-allowed">
                 {(element.options || []).map((option, i) => (
                   <div key={`${key}-option-${i}`} className="flex items-center space-x-2">
                     <RadioGroupItem value={option} id={`${key}-option-${i}`} className="border-muted-foreground" />
                     <Label htmlFor={`${key}-option-${i}`} className="font-normal text-muted-foreground">{option}</Label>
                   </div>
                 ))}
               </RadioGroup>
                 <small className="text-muted-foreground text-xs">
                   Type: radio, Name: {element.name}
                   {element.options && element.options.length > 0 && `, Options: ${element.options.join(', ')}`}
                 </small>
             </fieldset>
           );
           break;
         case 'checkbox':
           formComponent = (
               <div className="flex items-center space-x-2 pt-2">
               <Checkbox id={key} name={element.name} required={element.required} disabled className="cursor-not-allowed border-muted-foreground data-[state=checked]:bg-muted data-[state=checked]:text-muted-foreground" />
               <Label htmlFor={key} className="font-normal text-muted-foreground">{element.label}{element.required && '*'}</Label>
                <small className="text-muted-foreground text-xs ml-auto">Type: checkbox, Name: {element.name}</small>
             </div>
           );
           break;
         case 'submit': // Handle potential submit button generation - unlikely to be added manually but handle
           formComponent = (
              <div className="pt-4 col-span-full">
                <Button type="button" className="w-full bg-muted hover:bg-muted/90" disabled>
                   {element.label || 'Submit'} (Preview)
                </Button>
                  <small className="text-muted-foreground text-xs">Type: submit, Name: {element.name}</small>
              </div>
            );
            return (
               <motion.div {...motionProps} className="mb-4 grid grid-cols-1 items-end gap-2 bg-card p-4 rounded-lg border shadow-sm">
                  {formComponent}
                  {/* No remove button for submit */}
               </motion.div>
            );
        default:
          console.warn(`Unsupported form element type: ${element.type}`);
           formComponent = (
              <div className="grid grid-cols-1 gap-1">
                <Label htmlFor={key} className="font-semibold">{element.label} (Unsupported Type: {element.type})</Label>
                <Input id={key} name={element.name} disabled className="bg-secondary" />
                  <small className="text-muted-foreground text-xs">Type: {element.type}, Name: {element.name}</small>
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
                    e.preventDefault();
                    handleRemoveElement(index);
                }}
                className="text-destructive hover:bg-destructive/10 h-10 w-10 self-center" // Center vertically
                aria-label={`Remove ${element.label} field`}
                disabled={isSaving}
             >
               <Trash2 className="h-4 w-4" />
             </Button>
        </motion.div>
      );
  };

  return (
    <div className="space-y-6">
       <Card className="shadow-lg border border-border/50">
          {/* Maybe remove CardHeader/Description or simplify */}
          <CardHeader>
             <CardTitle className="text-2xl flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" /> Edit Form Fields
             </CardTitle>
             <CardDescription>
                Add, remove, or reorder (future feature) form fields. Remember to save your changes.
             </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <AnimatePresence initial={false}>
              {formConfig.length > 0 ? (
                 formConfig.map(renderFormElement)
               ) : (
                 <p className="text-muted-foreground text-center py-8">
                   This form is empty. Click "Add Field" to begin.
                 </p>
               )}
             </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 border-t border-border/50 pt-6">
             <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} disabled={isSaving}>
                 <Plus className="mr-2 h-4 w-4" />
                 Add Field
             </Button>
             <Button
                onClick={handleSaveChanges}
                variant="default" // Use default variant for save
                disabled={isSaving}//!hasChanges}
                className="min-w-[120px]" // Ensure button width is consistent
             >
                {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                    ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        {hasChanges ? 'Save Changes' : 'Saved'}
                    </>
                )}
             </Button>
           </CardFooter>
        </Card>

       <AddFieldDialog
         isOpen={isAddDialogOpen}
         onClose={() => setIsAddDialogOpen(false)}
         onAddField={handleAddElement}
       />
    </div>
  );
}
