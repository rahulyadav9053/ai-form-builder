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
import { generateFormConfigAction } from '@/app/actions';
import type { FormConfig, FormElement } from '@/types/form';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from 'framer-motion';

export function FormGenerator() {
  const [prompt, setPrompt] = useState('');
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

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
      const result = await generateFormConfigAction({ prompt });
      if ('error' in result) {
         toast({
            title: "Generation Failed",
            description: result.error,
            variant: "destructive",
         });
        setFormConfig(null); // Clear previous form if generation fails
      } else {
        setFormConfig(result.formConfig);
        toast({
           title: "Form Generated!",
           description: "Your form has been successfully generated.",
           variant: "default", // Use default or a success variant if defined
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


  const renderFormElement = (element: FormElement, index: number) => {
    const key = `${element.name}-${index}`; // More robust key

     const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      };

     const motionProps = {
        key: key,
        initial: "hidden",
        animate: "visible",
        exit: "hidden",
        variants: variants,
        transition: { duration: 0.3, delay: index * 0.05 }, // Staggered animation
        layout: true, // Enable smooth layout changes
        className:"mb-4 grid grid-cols-1 gap-2" // Grid layout for elements
     };


    switch (element.type.toLowerCase()) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'date':
      case 'tel':
      case 'url':
        return (
           <motion.div {...motionProps}>
            <Label htmlFor={key}>{element.label}{element.required && '*'}</Label>
            <Input
                id={key}
                name={element.name}
                type={element.type.toLowerCase()}
                placeholder={element.placeholder || `Enter ${element.label.toLowerCase()}`}
                required={element.required}
                className="bg-secondary"
             />
          </motion.div>
        );
      case 'textarea':
         return (
            <motion.div {...motionProps}>
             <Label htmlFor={key}>{element.label}{element.required && '*'}</Label>
             <Textarea
                 id={key}
                 name={element.name}
                 placeholder={element.placeholder || `Enter ${element.label.toLowerCase()}`}
                 required={element.required}
                  className="bg-secondary"
             />
           </motion.div>
         );
      case 'select':
        return (
           <motion.div {...motionProps}>
            <Label htmlFor={key}>{element.label}{element.required && '*'}</Label>
            <Select name={element.name} required={element.required}>
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
          </motion.div>
        );
       case 'radio':
         return (
           <motion.fieldset {...motionProps} className="space-y-2">
             <legend className="text-sm font-medium">{element.label}{element.required && '*'}</legend>
             <RadioGroup name={element.name} required={element.required}>
               {(element.options || []).map((option, i) => (
                 <div key={`${key}-option-${i}`} className="flex items-center space-x-2">
                   <RadioGroupItem value={option} id={`${key}-option-${i}`} />
                   <Label htmlFor={`${key}-option-${i}`} className="font-normal">{option}</Label>
                 </div>
               ))}
             </RadioGroup>
           </motion.fieldset>
         );
       case 'checkbox':
         // Assuming single checkbox, not a group based on typical usage
         return (
             <motion.div {...motionProps} className="flex items-center space-x-2 pt-2">
             <Checkbox id={key} name={element.name} required={element.required} />
             <Label htmlFor={key} className="font-normal">{element.label}{element.required && '*'}</Label>
           </motion.div>
         );
       case 'submit': // Handle potential submit button generation
         return (
            <motion.div {...motionProps} className="pt-4">
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                 {element.label || 'Submit'}
              </Button>
            </motion.div>
          );
      default:
        console.warn(`Unsupported form element type: ${element.type}`);
         return (
            <motion.div {...motionProps}>
              <Label htmlFor={key}>{element.label} (Unsupported Type: {element.type})</Label>
              <Input id={key} name={element.name} disabled className="bg-secondary" />
            </motion.div>
          );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
             <Sparkles className="text-primary" /> Describe Your Form
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
          />
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
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

           {formConfig && (
               <Button onClick={downloadConfig} variant="outline">
                 <Download className="mr-2 h-4 w-4" />
                 Download JSON
               </Button>
            )}
        </CardFooter>
      </Card>

      {isPending && !formConfig && (
         <Card className="shadow-md animate-pulse">
           <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
           </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
            </CardContent>
         </Card>
      )}

       {formConfig && !isPending && (
        <Card className="shadow-md transition-all duration-500 ease-out">
          <CardHeader>
            <CardTitle className="text-2xl">Generated Form Preview</CardTitle>
            <CardDescription>This is how your generated form looks. Fill it out or download the configuration.</CardDescription>
          </CardHeader>
          <CardContent>
             <form className="space-y-4">
                <AnimatePresence>
                 {formConfig.map(renderFormElement)}
                 {/* Add a default submit if none generated */}
                 {!formConfig.some(el => el.type.toLowerCase() === 'submit') && (
                      <motion.div
                        key="default-submit"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: formConfig.length * 0.05 }}
                         className="pt-4"
                      >
                       <Button type="submit" className="w-full">Submit</Button>
                     </motion.div>
                 )}
                 </AnimatePresence>
             </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
