import { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of our form data
interface FormState {
  [key: string]: any;
}

// Define the shape of our form context
interface FormContextType {
  formData: FormState;
  errors: Record<string, string>;
  updateForm: (field: string, value: any) => void;
  updateNestedForm: (parentField: string, field: string, value: any) => void;
  validateField: (field: string, validationRule?: (value: any) => boolean) => boolean;
  isValid: (fields?: string[]) => boolean;
  resetForm: () => void;
}

// Create the context
const FormContext = createContext<FormContextType | undefined>(undefined);

// Create a custom hook to use the form context
export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};

interface FormProviderProps {
  initialState: FormState;
  children: (props: FormContextType) => ReactNode;
}

export const FormProvider = ({ initialState, children }: FormProviderProps) => {
  const [formData, setFormData] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateNestedForm = (parentField: string, field: string, value: any) => {
    setFormData((prev) => {
      const parent = prev[parentField] || {};
      return {
        ...prev,
        [parentField]: {
          ...parent,
          [field]: value,
        },
      };
    });

    // Clear error for this field if it exists
    const nestedField = `${parentField}.${field}`;
    if (errors[nestedField]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[nestedField];
        return newErrors;
      });
    }
  };

  const validateField = (field: string, validationRule?: (value: any) => boolean): boolean => {
    const fieldParts = field.split('.');
    let value;
    
    if (fieldParts.length > 1) {
      // Handle nested fields
      const [parentField, childField] = fieldParts;
      value = formData[parentField]?.[childField];
    } else {
      value = formData[field];
    }
    
    // Check if empty
    const isEmpty = value === undefined || value === null || value === '';
    
    // Check against custom validation rule if provided
    const isValid = validationRule ? validationRule(value) : !isEmpty;
    
    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        [field]: `${field} is required`,
      }));
      return false;
    }
    
    return true;
  };

  const isValid = (fields?: string[]): boolean => {
    const fieldsToValidate = fields || Object.keys(formData);
    let valid = true;
    
    fieldsToValidate.forEach((field) => {
      const fieldValid = validateField(field);
      if (!fieldValid) valid = false;
    });
    
    return valid;
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  const contextValue: FormContextType = {
    formData,
    errors,
    updateForm,
    updateNestedForm,
    validateField,
    isValid,
    resetForm,
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children(contextValue)}
    </FormContext.Provider>
  );
};