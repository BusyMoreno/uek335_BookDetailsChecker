import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { Colors } from "../constants/theme";
import { ValidationError } from "../hooks/useBookForm";

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  placeholder?: string;
  error?: ValidationError;
  required?: boolean;
}

/**
 * Reusable form input component for text fields
 * Displays label, input field, and real-time error messages
 *
 * @component
 * @example
 * <FormInput
 *   label="Book Title"
 *   value={title}
 *   onChangeText={setTitle}
 *   error={errors.title}
 *   required
 * />
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder,
  error,
  required = false,
}) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.label, error && styles.errorLabel]}>
      {label}
      {required && " *"}
    </Text>
    <TextInput
      style={[styles.input, error && styles.errorInput]}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={Colors.light.textField}
    />
    {error && <Text style={styles.errorMessage}>{error.message}</Text>}
  </View>
);

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  error?: ValidationError;
}

/**
 * Date picker component with calendar interface
 * Allows users to select a date and displays validation errors
 *
 * @component
 * @example
 * <DatePicker
 *   label="Publication Date"
 *   value={date}
 *   onChange={setDate}
 *   error={errors.date}
 * />
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
}) => (
  <View>
    <Text style={[styles.label, error && styles.errorLabel]}>{label} *</Text>
    <View style={[styles.calendarWrapper, error && styles.errorBorder]}>
      <Calendar
        onDayPress={(day: any) => {
          onChange(day.dateString);
        }}
        markedDates={{
          [value || ""]: {
            selected: true,
            selectedColor: Colors.light.textLight,
          },
        }}
        theme={{
          backgroundColor: Colors.light.background,
          calendarBackground: Colors.light.background,
          textSectionTitleColor: Colors.light.textLight,
          selectedDayBackgroundColor: Colors.light.textLight,
          selectedDayTextColor: Colors.light.background,
          todayTextColor: Colors.light.textLight,
          dayTextColor: Colors.light.textWhite,
          arrowColor: Colors.light.textLight,
          monthTextColor: Colors.light.textWhite,
        }}
      />
    </View>
    {error && <Text style={styles.errorMessage}>{error.message}</Text>}
  </View>
);

interface FormContainerProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for form fields
 * Provides consistent spacing and structure for form content
 *
 * @component
 */
export const FormContainer: React.FC<FormContainerProps> = ({ children }) => (
  <View style={styles.form}>{children}</View>
);

const styles = StyleSheet.create({
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: Colors.light.textWhite,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  errorLabel: {
    color: "#ff4444",
    fontWeight: "600",
  },
  input: {
    backgroundColor: Colors.light.textLight,
    padding: 14,
    borderRadius: 10,
    color: Colors.light.textFieldText,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  errorInput: {
    borderColor: "#ff4444",
    borderWidth: 2,
  },
  errorMessage: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  calendarWrapper: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.buttonBorder,
  },
  errorBorder: {
    borderColor: "#ff4444",
    borderWidth: 2,
  },
});
