
"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { saveFormResponseAction } from '@/app/actions';
import type { FormConfig, FormElement } from '@/types/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface FormRendererProps {
  formConfig: FormConfig;
  formId: string;
}

// Function to generate Zod schema dynamically
const generateSchema = (config: FormConfig) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  config.forEach((element) => {
    if (element.type.toLowerCase() === 'submit') return; // Skip submit buttons

    let fieldSchema: z.ZodTypeAny;

    switch (element.type.toLowerCase()) {
      case 'text':
      case 'textarea':
      case 'url':
      case 'tel': // Basic validation for tel
        fieldSchema = z.string();
        break;
      case 'email':
        fieldSchema = z.string().email({ message: 'Invalid email address' });
        break;
      case 'password':
        fieldSchema = z.string().min(6, { message: 'Password must be at least 6 characters' });
        break;
      case 'number':
        fieldSchema = z.number({ coerce: true }); // Coerce input to number
        break;
      case 'date':
        fieldSchema = z.string(); // Keep as string for date input, could use z.date() if needed
        break;
      case 'select':
        fieldSchema = z.string(); // Value will be one of the options
        break;
      case 'radio':
        fieldSchema = z.string(); // Value will be one of the options
        break;
      case 'checkbox':
        fieldSchema = z.boolean().default(false); // Checkbox maps to boolean
        break;
      default:
        fieldSchema = z.any(); // Fallback for unsupported types
        console.warn(`Unsupported element type "${element.type}" in schema generation.`);
    }

    if (element.required) {
      // Add non-empty validation for strings, refine others if needed
      if (fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.min(1, { message: `${element.label} is required` });
      } else {
        // For non-string types, 'required' means it must be provided (Zod handles this by default)
        // You might add specific refinements, e.g., z.number().positive() if required means > 0
         // For boolean (checkbox), zod optional/required doesn't quite fit.
         // We can enforce it must be true if required.
         if (fieldSchema instanceof z.ZodBoolean) {
            fieldSchema = fieldSchema.refine(val => val === true, {
                message: `${element.label} must be checked`,
            });
         } else {
            // Use optional() with refine for required number fields to allow 0 but not undefined/null
            if (fieldSchema instanceof z.ZodNumber) {
                // No need to do anything extra, zod number handles required implicitly
            } else {
                fieldSchema = fieldSchema.optional().refine(val => val !== undefined && val !== null && val !== '', {
                    message: `${element.label} is required`
                });
            }
         }
      }
    } else {
        // Make field optional if not required
        fieldSchema = fieldSchema.optional();
    }

    shape[element.name] = fieldSchema;
  });

  return z.object(shape);
};


type FormData = z.infer<ReturnType<typeof generateSchema>>;

export function FormRenderer({ formConfig, formId }: FormRendererProps) {
  const { toast } = useToast();
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null); // State for start time

  // Record start time on mount (client-side only)
  useEffect(() => {
    setStartTime(Date.now());
  }, []);


  // Generate the schema based on the config
  const formSchema = React.useMemo(() => generateSchema(formConfig), [formConfig]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formConfig.reduce((acc, el) => {
        if (el.type.toLowerCase() === 'checkbox') {
            acc[el.name] = false; // Default checkbox to false
        } else if (el.type.toLowerCase() === 'number') {
             acc[el.name] = undefined; // Default number to undefined to avoid sending 0 unintentionally
        }
        else {
            acc[el.name] = ''; // Default others to empty string
        }
        return acc;
        }, {} as Record<string, any>),
  });


  const onSubmit: SubmitHandler<FormData> = (data) => {
    const endTime = Date.now();
    const durationMs = startTime ? endTime - startTime : undefined; // Calculate duration in milliseconds

    startSubmitTransition(async () => {
      // Pass durationMs to the action
      const result = await saveFormResponseAction({ formId, responseData: data, durationMs });
      if ('error' in result) {
        toast({
          title: 'Submission Failed',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setSubmissionSuccess(true);
        toast({
          title: 'Form Submitted Successfully!',
          description: `Your response has been recorded (ID: ${result.responseId}). Time taken: ${durationMs ? (durationMs / 1000).toFixed(1) + 's' : 'N/A'}`,
          variant: 'default',
          duration: 10000, // Keep toast longer
        });
        // Optionally reset the form: form.reset();
        // Maybe reset startTime if allowing multiple submissions?
        // setStartTime(Date.now());
      }
    });
  };

   if (submissionSuccess) {
     return (
       <Card className="shadow-lg border-accent">
         <CardHeader className="bg-accent text-accent-foreground rounded-t-lg p-4">
           <CardTitle className="text-xl text-center">Submission Successful!</CardTitle>
         </CardHeader>
         <CardContent className="p-6 text-center">
           <CardDescription>
             Thank you! Your response has been successfully submitted.
           </CardDescription>
           {/* Optionally add a button to submit another response or go back */}
            <Button onClick={() => { form.reset(); setSubmissionSuccess(false); setStartTime(Date.now()); }} className="mt-4">Submit another response</Button>
         </CardContent>
       </Card>
     );
   }

  const renderFormElement = (element: FormElement) => {
    const key = element.name; // Use name as key, assuming names are unique

    return (
        <FormField
            control={form.control}
            name={key}
            key={key}
            render={({ field }) => ( // field includes onChange, onBlur, value, name, ref
              <FormItem className="mb-4">
                    {element.type.toLowerCase() !== 'checkbox' && (
                      <FormLabel>
                          {element.label}
                          {element.required && <span className="text-destructive">*</span>}
                      </FormLabel>
                    )}
                <FormControl>
                  {(() => {
                    switch (element.type.toLowerCase()) {
                      case 'text':
                      case 'email':
                      case 'password':
                      case 'number':
                      case 'date':
                      case 'tel':
                      case 'url':
                        return (
                          <Input
                            type={element.type.toLowerCase()}
                            placeholder={element.placeholder || `Enter ${element.label.toLowerCase()}`}
                            {...field}
                            value={field.value ?? ''} // Handle null/undefined for controlled input
                          />
                        );
                      case 'textarea':
                        return (
                          <Textarea
                            placeholder={element.placeholder || `Enter ${element.label.toLowerCase()}`}
                            {...field}
                            value={field.value ?? ''}
                           />
                        );
                      case 'select':
                        return (
                          <Select
                            onValueChange={field.onChange} // react-hook-form handles value update
                            defaultValue={field.value} // Use defaultValue for initial render
                            value={field.value} // Controlled component value
                            name={field.name}
                            required={element.required}
                          >
                            <SelectTrigger>
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
                        );
                      case 'radio':
                        return (
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                             value={field.value}
                            className="space-y-2"
                            name={field.name}
                            required={element.required}
                          >
                            {(element.options || []).map((option, i) => (
                              <FormItem key={`${key}-option-${i}`} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={option} />
                                </FormControl>
                                <FormLabel className="font-normal">{option}</FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        );
                      case 'checkbox':
                         return (
                            <div className="flex items-center space-x-2 pt-1">
                               <Checkbox
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                                 name={field.name}
                                 id={key} // Ensure id matches label htmlFor
                               />
                               <Label htmlFor={key} className="font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                 {element.label}
                                 {element.required && <span className="text-destructive"> *</span>}
                               </Label>
                            </div>
                         );
                      case 'submit': // Render actual submit button
                         return null; // Submit button handled separately in CardFooter
                      default:
                        console.warn(`Unsupported form element type: ${element.type}`);
                        return <Input {...field} disabled placeholder={`Unsupported type: ${element.type}`} />;
                    }
                  })()}
                </FormControl>
                 {/* Add FormDescription if needed */}
                 {/* <FormDescription>This is a description.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
    );
  };

  // Find if there's an explicit submit button config
  const submitButtonConfig = formConfig.find(el => el.type.toLowerCase() === 'submit');

  return (
    <Card className="shadow-lg">
       {/* No Header needed for the rendered form itself, page provides context */}
       {/* <CardHeader>
          <CardTitle>Fill the Form</CardTitle>
          <CardDescription>Form ID: {formId}</CardDescription>
       </CardHeader> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-6 space-y-1 pt-6">
            {formConfig.filter(el => el.type.toLowerCase() !== 'submit').map(renderFormElement)}
          </CardContent>
          <CardFooter className="flex justify-end p-6 pt-4">
            <Button type="submit" disabled={isSubmitting || startTime === null} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                 <>
                   <Send className="mr-2 h-4 w-4" />
                   {submitButtonConfig?.label || 'Submit Response'}
                 </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
