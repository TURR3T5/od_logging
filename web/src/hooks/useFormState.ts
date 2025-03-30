import { useState, useCallback } from 'react';
import { showNotification } from '../utils/appUtils';

interface UseFormStateOptions<T> {
  initialState: T;
  onSubmit?: (data: T) => Promise<boolean>;
  validateForm?: (data: T) => Record<string, string> | null;
  successMessage?: {
    title: string;
    message: string;
  };
  errorMessage?: {
    title: string;
    message: string;
  };
  resetAfterSubmit?: boolean;
}

export function useFormState<T>({
  initialState,
  onSubmit,
  validateForm,
  successMessage = {
    title: 'Succes',
    message: 'Data er blevet gemt'
  },
  errorMessage = {
    title: 'Fejl',
    message: 'Der opstod en fejl. Prøv venligst igen.'
  },
  resetAfterSubmit = false
}: UseFormStateOptions<T>) {
  // Form data
  const [formData, setFormData] = useState<T>(initialState);
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setIsSuccess(false);
  }, [initialState]);
  
  // Update a single field
  const updateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if exists
    if (errors[field as string]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field as string];
        return updated;
      });
    }
  }, [errors]);
  
  // Update multiple fields
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    if (updatedFields.some(field => errors[field])) {
      setErrors(prev => {
        const updated = { ...prev };
        updatedFields.forEach(field => {
          if (updated[field]) {
            delete updated[field];
          }
        });
        return updated;
      });
    }
  }, [errors]);
  
  // Submit the form
  const submitForm = useCallback(async () => {
    // Validate if validateForm is provided
    if (validateForm) {
      const validationErrors = validateForm(formData);
      if (validationErrors) {
        setErrors(validationErrors);
        return false;
      }
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // If onSubmit is provided, call it
      if (onSubmit) {
        const success = await onSubmit(formData);
        
        if (success) {
          setIsSuccess(true);
          
          // Show success notification
          showNotification('success', successMessage.title, successMessage.message);
          
          // Reset form if requested
          if (resetAfterSubmit) {
            resetForm();
          }
          
          return true;
        } else {
          // Show error notification
          showNotification('error', errorMessage.title, errorMessage.message);
          return false;
        }
      }
      
      // If no onSubmit, just consider it successful
      setIsSuccess(true);
      
      if (resetAfterSubmit) {
        resetForm();
      }
      
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Show error notification
      showNotification(
        'error', 
        errorMessage.title, 
        error instanceof Error ? error.message : errorMessage.message
      );
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData, 
    validateForm, 
    onSubmit, 
    resetAfterSubmit,
    resetForm,
    successMessage,
    errorMessage
  ]);
  
  return {
    formData,
    setFormData,
    updateField,
    updateFields,
    isSubmitting,
    errors,
    setErrors,
    isSuccess,
    resetForm,
    submitForm
  };
}