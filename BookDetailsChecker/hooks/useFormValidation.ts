import { useState } from "react";
import { VALIDATION_MESSAGES } from "../constants/messages";

export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validateAuthForm = (
    firstname?: string,
    email?: string,
    password?: string,
    age?: string | number,
  ) => {
    let newErrors: Record<string, string> = {};

    if (age !== undefined && age !== "" && age !== null) {
      const ageNumber = Number(age);

      if (isNaN(ageNumber)) {
        newErrors.age = "Age must be a number.";
      } else if (ageNumber <= 0 || ageNumber > 120) {
        newErrors.age = "Please enter a valid age (1-120).";
      }
    }

    if (firstname !== undefined) {
      if (!firstname) {
        newErrors.firstname = VALIDATION_MESSAGES.FIRSTNAME_REQUIRED;
      }
    }

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
