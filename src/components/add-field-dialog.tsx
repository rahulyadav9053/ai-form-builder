"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { FormElement } from '@/types/form';
import { useToast } from "@/hooks/use-toast";

interface AddFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (newElement: FormElement) => void;
}

// Expanded list of common HTML input types + custom types
const availableFieldTypes = [
  "text", "email", "password", "number", "date", "tel", "url",
  "textarea", "select", "radio", "checkbox",
];

export function AddFieldDialog({ isOpen, onClose, onAddField }: AddFieldDialogProps) {
  const [fieldType, setFieldType] = useState<string>('text');
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState(''); // Comma-separated for select/radio
  const { toast } = useToast();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Generate a basic name based on the label if name is empty
    const value = e.target.value;
    setName(value);
    // Removed auto-generation from name change to allow manual override
    // If you want auto-gen when name is cleared, add specific logic here.
  };

   const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newLabel = e.target.value;
      setLabel(newLabel);
      // Auto-generate name based on label only if name is currently empty
      if (!name.trim()) {
         const generatedName = newLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
         setName(generatedName);
      }
   };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !name.trim() || !fieldType) {
        toast({
            title: "Missing Information",
            description: "Please fill in Label, Name, and select a Field Type.",
            variant: "destructive",
        });
      return;
    }

     // Validate name format (simple: no spaces, starts with letter/underscore)
     if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
        toast({
            title: "Invalid Name",
            description: "Name must start with a letter or underscore, and contain only letters, numbers, or underscores.",
            variant: "destructive",
        });
       return;
     }


     if ((fieldType === 'select' || fieldType === 'radio') && !options.trim()) {
        toast({
            title: "Missing Options",
            description: "Select and Radio fields require options (comma-separated).",
            variant: "destructive",
        });
       return;
     }

    const newElement: FormElement = {
      type: fieldType,
      label,
      name,
      placeholder: placeholder.trim() || undefined, // Ensure empty strings become undefined
      required: isRequired,
      options: (fieldType === 'select' || fieldType === 'radio')
               ? options.split(',').map(opt => opt.trim()).filter(Boolean)
               : undefined,
    };

    onAddField(newElement);
    resetForm();
    onClose();
  };

  const resetForm = () => {
      setFieldType('text');
      setLabel('');
      setName('');
      setPlaceholder('');
      setIsRequired(false);
      setOptions('');
  };

  const handleClose = () => {
      resetForm();
      onClose();
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Form Field</DialogTitle>
          <DialogDescription>
            Configure the details for the new field you want to add to the form.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fieldType" className="text-right">
                Field Type*
              </Label>
              <Select value={fieldType} onValueChange={setFieldType} required>
                 <SelectTrigger id="fieldType" className="col-span-3">
                   <SelectValue placeholder="Select field type" />
                 </SelectTrigger>
                 <SelectContent>
                   {availableFieldTypes.map(type => (
                     <SelectItem key={type} value={type}>
                       {type.charAt(0).toUpperCase() + type.slice(1)}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Label*
              </Label>
              <Input
                id="label"
                value={label}
                onChange={handleLabelChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                className="col-span-3"
                required
                placeholder="e.g., user_name"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="placeholder" className="text-right">
                   Placeholder
                </Label>
                <Input
                   id="placeholder"
                   value={placeholder}
                   onChange={(e) => setPlaceholder(e.target.value)}
                   className="col-span-3"
                   placeholder="Optional hint text"
                />
             </div>

            {(fieldType === 'select' || fieldType === 'radio') && (
               <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="options" className="text-right pt-2">
                    Options*
                  </Label>
                   <Textarea
                     id="options"
                     value={options}
                     onChange={(e) => setOptions(e.target.value)}
                     className="col-span-3"
                     placeholder="Enter options, separated by commas (e.g., Option 1, Option 2)"
                     required
                   />
               </div>
            )}

             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="required" className="text-right">
                   Required
                </Label>
                <Checkbox
                    id="required"
                    checked={isRequired}
                    onCheckedChange={(checked) => setIsRequired(checked === true)}
                    className="col-span-3 justify-self-start"
                 />
             </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Field</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
