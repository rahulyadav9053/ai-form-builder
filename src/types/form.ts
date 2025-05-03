export interface FormElement {
  type: string;
  label: string;
  name: string;
  options?: string[];
  placeholder?: string; // Add placeholder for better UX
  required?: boolean; // Add required field
}

// Define a type for the entire form configuration
export interface FormConfig {
  title?: string;
  elements: FormElement[];
}
