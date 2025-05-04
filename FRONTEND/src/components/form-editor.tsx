"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  updateFormConfigAction,
  createNewFormConfigAction,
} from "@/app/actions"; // Use update action and import the new server action
import type { FormConfig, FormElement } from "@/types/form";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  Link as LinkIcon,
  Edit,
  GripVertical,
  Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { AddFieldDialog } from "./add-field-dialog";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants";

interface FormEditorProps {
  initialConfig: FormConfig;
  formId: string;
  isNewForm?: boolean;
}

interface SortableFormElementProps {
  element: FormElement;
  index: number;
  onRemove: (index: number) => void;
  onEdit: (element: FormElement) => void;
  isSaving: boolean;
}

function SortableFormElement({
  element,
  index,
  onRemove,
  onEdit,
  isSaving,
}: SortableFormElementProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const key = `${element.name}-${index}-${element.type}`;

  const variants = {
    hidden: { opacity: 0, height: 0, marginBottom: 0 },
    visible: { opacity: 1, height: "auto", marginBottom: "1rem" },
  };

  const motionProps = {
    key: key,
    initial: "hidden",
    animate: "visible",
    exit: "hidden",
    variants: variants,
    transition: { duration: 0.2, type: "spring", stiffness: 500, damping: 30 },
    layout: true,
    className:
      "grid grid-cols-[auto_1fr_auto] items-start gap-2 bg-card p-4 rounded-lg border shadow-sm",
  };

  let formComponent: React.ReactNode;

  // Render read-only previews within the editor card
  switch (element.type.toLowerCase()) {
    case "text":
    case "email":
    case "password":
    case "number":
    case "date":
    case "tel":
    case "url":
      formComponent = (
        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor={key} className="font-semibold">
            {element.label}
            {element.required && "*"}
          </Label>
          <Input
            id={key}
            name={element.name}
            type={element.type.toLowerCase()}
            placeholder={
              element.placeholder ||
              `(Placeholder: ${element.label.toLowerCase()})`
            }
            required={element.required}
            className="bg-secondary cursor-not-allowed"
            readOnly
          />
          <small className="text-muted-foreground text-xs">
            Type: {element.type}, Name: {element.name}
          </small>
        </div>
      );
      break;
    case "textarea":
      formComponent = (
        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor={key} className="font-semibold">
            {element.label}
            {element.required && "*"}
          </Label>
          <Textarea
            id={key}
            name={element.name}
            placeholder={
              element.placeholder ||
              `(Placeholder: ${element.label.toLowerCase()})`
            }
            required={element.required}
            className="bg-secondary cursor-not-allowed" // Style as read-only preview
            readOnly
          />
          <small className="text-muted-foreground text-xs">
            Type: textarea, Name: {element.name}
          </small>
        </div>
      );
      break;
    case "select":
      formComponent = (
        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor={key} className="font-semibold">
            {element.label}
            {element.required && "*"}
          </Label>
          <Select name={element.name} required={element.required} disabled>
            <SelectTrigger id={key} className="bg-secondary cursor-not-allowed">
              <SelectValue
                placeholder={element.placeholder || "(Select an option)"}
              />
            </SelectTrigger>
            {/* Don't render SelectContent in preview, maybe list options */}
          </Select>
          <small className="text-muted-foreground text-xs">
            Type: select, Name: {element.name}
            {element.options &&
              element.options.length > 0 &&
              `, Options: ${element.options.join(", ")}`}
          </small>
        </div>
      );
      break;
    case "radio":
      formComponent = (
        <fieldset className="space-y-2 grid grid-cols-1 gap-1">
          <legend className="text-sm font-semibold">
            {element.label}
            {element.required && "*"}
          </legend>
          <RadioGroup
            name={element.name}
            required={element.required}
            disabled
            className="cursor-not-allowed"
          >
            {(element.options || []).map((option, i) => (
              <div
                key={`${key}-option-${i}`}
                className="flex items-center space-x-2"
              >
                <RadioGroupItem
                  value={option}
                  id={`${key}-option-${i}`}
                  className="border-muted-foreground"
                />
                <Label
                  htmlFor={`${key}-option-${i}`}
                  className="font-normal text-muted-foreground"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <small className="text-muted-foreground text-xs">
            Type: radio, Name: {element.name}
            {element.options &&
              element.options.length > 0 &&
              `, Options: ${element.options.join(", ")}`}
          </small>
        </fieldset>
      );
      break;
    case "checkbox":
      formComponent = (
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id={key}
            name={element.name}
            required={element.required}
            disabled
            className="cursor-not-allowed border-muted-foreground data-[state=checked]:bg-muted data-[state=checked]:text-muted-foreground"
          />
          <Label htmlFor={key} className="font-normal text-muted-foreground">
            {element.label}
            {element.required && "*"}
          </Label>
          <small className="text-muted-foreground text-xs ml-auto">
            Type: checkbox, Name: {element.name}
          </small>
        </div>
      );
      break;
    case "submit": // Handle potential submit button generation - unlikely to be added manually but handle
      formComponent = (
        <div className="pt-4 col-span-full">
          <Button
            type="button"
            className="w-full bg-muted hover:bg-muted/90"
            disabled
          >
            {element.label || "Submit"} (Preview)
          </Button>
          <small className="text-muted-foreground text-xs">
            Type: submit, Name: {element.name}
          </small>
        </div>
      );
      return (
        <motion.div
          {...motionProps}
          className="mb-4 grid grid-cols-1 items-end gap-2 bg-card p-4 rounded-lg border shadow-sm"
        >
          {formComponent}
          {/* No remove button for submit */}
        </motion.div>
      );
    default:
      console.warn(`Unsupported form element type: ${element.type}`);
      formComponent = (
        <div className="grid grid-cols-1 gap-1">
          <Label htmlFor={key} className="font-semibold">
            {element.label} (Unsupported Type: {element.type})
          </Label>
          <Input
            id={key}
            name={element.name}
            disabled
            className="bg-secondary"
          />
          <small className="text-muted-foreground text-xs">
            Type: {element.type}, Name: {element.name}
          </small>
        </div>
      );
      break;
  }

  return (
    <motion.div {...motionProps} ref={setNodeRef} style={style}>
      <div
        className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {formComponent}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(element)}
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          aria-label={`Edit ${element.label} field`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            onRemove(index);
          }}
          className="text-destructive hover:bg-destructive/10 h-8 w-8"
          aria-label={`Remove ${element.label} field`}
          disabled={isSaving}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export function FormEditor({
  initialConfig,
  formId,
  isNewForm = false,
}: FormEditorProps) {
  const [formConfig, setFormConfig] = useState<FormConfig>({
    title: initialConfig.title || "",
    elements: initialConfig.elements || [],
  });
  const [isSaving, startSavingTransition] = useTransition();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<FormElement | null>(null);
  const [editedField, setEditedField] = useState<FormElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const dropAnimation = {
    ...defaultDropAnimation,
    duration: 200,
    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
  };

  // Update internal state if initialConfig changes (e.g., navigating between editors)
  useEffect(() => {
    setFormConfig({
      title: initialConfig.title || "",
      elements: initialConfig.elements || [],
    });
    setHasChanges(false); // Reset changes when initial config loads
  }, [initialConfig]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setFormConfig((prevConfig) => ({
        ...prevConfig,
        elements: arrayMove(
          prevConfig.elements,
          prevConfig.elements.findIndex((item) => item.name === active.id),
          prevConfig.elements.findIndex((item) => item.name === over.id)
        ),
      }));
      setHasChanges(true);
    }
  };

  const handleRemoveElement = (indexToRemove: number) => {
    setFormConfig((prevConfig) => ({
      ...prevConfig,
      elements: prevConfig.elements.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
    setHasChanges(true);
    toast({
      title: "Field Removed",
      description: "The form field has been removed. Save your changes.",
      variant: "default",
    });
  };

  const handleAddElement = (newElement: FormElement) => {
    setFormConfig((prevConfig) => ({
      ...prevConfig,
      elements: [...prevConfig.elements, newElement],
    }));
    setHasChanges(true);
    toast({
      title: "Field Added",
      description: `Field "${newElement.label}" has been added. Save your changes.`,
      variant: "default",
    });
  };

  const handleEditField = (field: FormElement) => {
    setEditingField(field);
    setEditedField(field);
  };

  const handleSaveEdit = () => {
    if (editedField) {
      setFormConfig((prevConfig) => ({
        ...prevConfig,
        elements: prevConfig.elements.map((field) =>
          field.name === editedField.name ? editedField : field
        ),
      }));
      setHasChanges(true);
      toast({
        title: "Field Updated",
        description: `Field "${editedField.label}" has been updated. Save your changes.`,
        variant: "default",
      });
      setEditingField(null);
    }
  };

  const handleSaveChanges = () => {
    if (!formConfig) {
      toast({
        title: "Error",
        description: "Cannot save, form configuration is missing.",
        variant: "destructive",
      });
      return;
    }
    if (!hasChanges && formConfig.elements.length === 0) {
      toast({
        title: "No Changes",
        description: "No changes detected to save.",
        variant: "default",
      });
      return;
    }

    startSavingTransition(async () => {
      const result = isNewForm
        ? await createNewFormConfigAction(formConfig)
        : await updateFormConfigAction(formId, formConfig);

      if ("error" in result) {
        toast({
          title: "Save Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if ("docId" in result) {
        setHasChanges(false);
        toast({
          title: "Form Created!",
          description: (
            <div>
              Your new form has been created.
              <br />
              {result.docId && (
                <Link
                  href={ROUTES.FORM(result.docId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1"
                >
                  View Live Form <LinkIcon className="h-3 w-3" />
                </Link>
              )}
            </div>
          ),
          variant: "default",
          duration: 3000,
        });
        // Redirect to the new form
        if (result.docId) {
          window.location.href = ROUTES.FORM(result.docId);
        }
      } else {
        toast({
          title: "Something went wrong",
          description: "An unknown error occurred while saving the form.",
          variant: "destructive",
          duration: 3000,
        });
        window.location.href = ROUTES.DASHBOARD;
      }
    });
  };

  const activeElement = activeId
    ? formConfig.elements.find((item) => item.name === activeId)
    : null;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" /> {isNewForm ? "Add Form Details" : "Edit Form Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={formConfig.title || ""}
                onChange={(e) => {
                  setFormConfig((prev) => ({ ...prev, title: e.target.value }));
                  setHasChanges(true);
                }}
                placeholder="Enter form title"
                className="max-w-md"
              />
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formConfig.elements.map((item) => item.name)}
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {formConfig.elements.length > 0 ? (
                    formConfig.elements.map((element, index) => (
                      <SortableFormElement
                        key={element.name}
                        element={element}
                        index={index}
                        onRemove={handleRemoveElement}
                        onEdit={handleEditField}
                        isSaving={isSaving}
                      />
                    ))
                  ) : (
                    <p className="text-destructive bg-destructive/10 rounded px-5 py-2">
                      This form is empty. Click "Add Field" to begin.
                    </p>
                  )}
                </AnimatePresence>
              </SortableContext>
              <DragOverlay dropAnimation={dropAnimation}>
                {activeElement ? (
                  <div className="grid grid-cols-[auto_1fr_auto] items-start gap-2 bg-card p-4 rounded-lg border shadow-sm opacity-80">
                    <div className="flex items-center justify-center h-full cursor-grabbing">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="font-semibold">
                        {activeElement.label}
                        {activeElement.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3 border-t border-border/50 pt-6">
          <Button
            variant="outline"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={isSaving}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
          <Button
            onClick={handleSaveChanges}
            variant="default"
            disabled={isSaving || formConfig.elements.length === 0}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {hasChanges ? "Save Changes" : "Saved"}
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

      <Dialog open={!!editingField} onOpenChange={() => setEditingField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Field Properties</DialogTitle>
          </DialogHeader>
          {editedField && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="field-label">Label</Label>
                <Input
                  id="field-label"
                  value={editedField.label}
                  onChange={(e) =>
                    setEditedField({ ...editedField, label: e.target.value })
                  }
                  placeholder="Enter field label"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-placeholder">
                  Placeholder (Optional)
                </Label>
                <Input
                  id="field-placeholder"
                  value={editedField.placeholder || ""}
                  onChange={(e) =>
                    setEditedField({
                      ...editedField,
                      placeholder: e.target.value,
                    })
                  }
                  placeholder="Enter placeholder text"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-required"
                  checked={editedField.required}
                  onCheckedChange={(checked) =>
                    setEditedField({
                      ...editedField,
                      required: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="field-required">Required Field</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingField(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
