import { useState } from 'react';
import { VALIDATION_MESSAGES } from '../constants/messages';

export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validateAuthForm = (email?: string, password?: string,) => {
    let newErrors: Record<string, string> = {};

    if (email !== undefined) {
      if (!email) {
        newErrors.email = VALIDATION_MESSAGES.EMAIL_REQUIRED;
      } else if (!validateEmail(email)) {
        newErrors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
      }
    }

    if (password !== undefined) {
      if (!password) {
        newErrors.password = VALIDATION_MESSAGES.PASSWORD_REQUIRED;
      } else if (password.length < 6) {
        newErrors.password = VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateAuthForm, setErrors };
};