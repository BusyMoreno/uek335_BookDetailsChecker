import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/theme";
import { createBook } from "../../services/bookService";
import { api } from "../../services/api";
import FormActions from "../../components/FormActions";
import {
  getPublisherByName,
  createPublisher,
} from "../../services/publisherService";
import { getAuthorByName, createAuthor } from "../../services/authorService";
import {
  getLanguageByName,
  createLanguage,
} from "../../services/languageService";
import { Calendar } from "react-native-calendars";
import * as SecureStore from "expo-secure-store";
import { useRouter, useFocusEffect } from "expo-router";
import * as Crypto from "expo-crypto";

/**
 * Validation Error Interface
 * Stores errors with field name and descriptive message
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * CreateBook Component
 *
 * Full real-time validation with live feedback
 *
 * Features:
 * - Live validation as the user types
 * - Descriptive error messages under each field
 * - Red highlight for fields with errors
 * - Saving only allowed if all fields are valid
 * - Auth check on load
 */
const CreateBook = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    pages: "",
    releaseDate: null as Date | null,
    publisherName: "",
    authorName: "",
    languageName: "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );

  useFocusEffect(
    useCallback(() => {
      checkAuthAndFetchProfile();

      return () => {
        setUser(null);
      };
    }, []),
  );

  /**
   * Verifies authentication and loads user profile
   * Called when the component gains focus
   */
  const checkAuthAndFetchProfile = async () => {
    setLoading(true);
    setUser(null);

    try {
      const token = await SecureStore.getItemAsync("userToken");
      const storedId = await SecureStore.getItemAsync("userId");

      if (!token || !storedId) {
        router.replace("/LoginPage");
        return;
      }

      try {
        const response = await api.get(`/users/${storedId}`);
        setUser(response.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          await handleSignOut();
        } else if (!error.response) {
          Alert.alert(
            "Network Error",
            "Couldn't verify your session. Check your connection.",
            [
              { text: "Retry", onPress: checkAuthAndFetchProfile },
              {
                text: "Go Back",
                onPress: () => router.back(),
                style: "cancel",
              },
            ],
          );
        } else {
          Alert.alert("Error", "Could not load create page.", [
            { text: "Retry", onPress: checkAuthAndFetchProfile },
            { text: "Go Back", onPress: () => router.back(), style: "cancel" },
          ]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userId");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
    router.replace("/LoginPage");
  };

  /**
   * Real-time validation for individual fields
   *
   * This function is called while the user types
   * and provides immediate feedback on errors
   *
   * @param field Field name (title, pages, releaseDate, etc.)
   * @param value Current value of the field
   * @returns ValidationError or null if valid
   */
  const getFieldError = (field: string, value: any): ValidationError | null => {
    switch (field) {
      case "title":
        if (!value || !value.trim()) {
          return { field, message: "Title is required" };
        }
        if (value.trim().length < 2) {
          return { field, message: "Title must be at least 2 characters" };
        }
        if (value.trim().length > 200) {
          return { field, message: "Title must be less than 200 characters" };
        }
        return null;

      case "pages":
        if (!value || !value.trim()) {
          return { field, message: "Number of pages is required" };
        }
        // Check if only digits are entered
        if (!/^\d+$/.test(value.trim())) {
          return { field, message: "Only numbers allowed" };
        }
        const numPages = Number(value);
        if (numPages <= 0) {
          return { field, message: "Must be greater than 0" };
        }
        if (numPages > 99999) {
          return { field, message: "Maximum 99999 pages" };
        }
        return null;

      case "releaseDate":
        if (!value) {
          return { field, message: "Publication date is required" };
        }
        // Check if date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (value > today) {
          return { field, message: "Date cannot be in the future" };
        }
        return null;

      case "publisherName":
        if (!value || !value.trim()) {
          return { field, message: "Publisher name is required" };
        }
        if (value.trim().length < 2) {
          return { field, message: "Publisher must be at least 2 characters" };
        }
        if (value.trim().length > 100) {
          return {
            field,
            message: "Publisher must be less than 100 characters",
          };
        }
        return null;

      case "authorName":
        if (!value || !value.trim()) {
          return { field, message: "Author name is required" };
        }
        if (value.trim().length < 2) {
          return { field, message: "Author must be at least 2 characters" };
        }
        if (value.trim().length > 100) {
          return { field, message: "Author must be less than 100 characters" };
        }
        return null;

      case "languageName":
        if (!value || !value.trim()) {
          return { field, message: "Language is required" };
        }
        if (value.trim().length < 2) {
          return { field, message: "Language must be at least 2 characters" };
        }
        if (value.trim().length > 50) {
          return { field, message: "Language must be less than 50 characters" };
        }
        return null;

      default:
        return null;
    }
  };

  /**
   * Updates form data and validates immediately
   *
   * This function is called when the user types text
   * It updates the state AND validates the field instantly
   *
   * @param field Field name
   * @param value New value
   */
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    const error = getFieldError(field, value);

    setValidationErrors((prev) => {
      const filtered = prev.filter((e) => e.field !== field);

      if (error) {
        return [...filtered, error];
      }
      return filtered;
    });
  };

  /**
   * Saves new book
   *
   * First checks if all fields are valid,
   * then saves the data to the server
   */
  const handleSave = async () => {
    if (validationErrors.length > 0) {
      Alert.alert(
        "Validation Error",
        "Please correct all marked fields before saving.",
      );
      return;
    }

    if (
      !formData.title.trim() ||
      !formData.pages.trim() ||
      !formData.releaseDate ||
      !formData.publisherName.trim() ||
      !formData.authorName.trim() ||
      !formData.languageName.trim()
    ) {
      Alert.alert("Incomplete Form", "Please fill in all required fields.");
      return;
    }

    setSaving(true);

    try {
      const formattedDate = formData.releaseDate
        ? formData.releaseDate.toISOString().split("T")[0]
        : "";

      const [publisherId, authorId, languageId] = await Promise.all([
        resolvePublisherId(formData.publisherName),
        resolveAuthorId(formData.authorName),
        resolveLanguageId(formData.languageName),
      ]);

      const newBook = await createBook({
        title: formData.title,
        num_pages: Number(formData.pages),
        publication_date: formattedDate,
        publisher_id: publisherId,
        language_id: languageId,
      });

      if (newBook?.id) {
        await api.post("/book_author", {
          id: Crypto.randomUUID(),
          book_id: newBook.id,
          author_id: authorId,
        });
      }

      Alert.alert("Success", "Book created successfully!", [
        {
          text: "OK",
          onPress: () => {
            setFormData({
              title: "",
              pages: "",
              releaseDate: null,
              publisherName: "",
              authorName: "",
              languageName: "",
            });
            setValidationErrors([]);
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert(
          "Duplicate Book",
          "A book with this title and author already exists.",
          [
            { text: "Try Again", onPress: handleSave },
            { text: "Cancel", style: "cancel" },
          ],
        );
      } else if (!error.response) {
        Alert.alert("Network Error", "Couldn't connect to server.", [
          { text: "Retry", onPress: handleSave },
          { text: "Cancel", style: "cancel" },
        ]);
      } else {
        Alert.alert("Error", "Something went wrong while saving the book.", [
          { text: "Retry", onPress: handleSave },
          { text: "Cancel", style: "cancel" },
        ]);
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Resolves or creates a Publisher
   */
  const resolvePublisherId = async (publisherName: string): Promise<number> => {
    const publishers = await getPublisherByName(publisherName);
    if (publishers && publishers.length > 0) {
      return publishers[0].id;
    }
    const newPublisher = await createPublisher(publisherName);
    return newPublisher.id;
  };

  /**
   * Resolves or creates an Author
   */
  const resolveAuthorId = async (authorName: string): Promise<number> => {
    const authors = await getAuthorByName(authorName);
    if (authors && authors.length > 0) {
      return authors[0].id;
    }
    const newAuthor = await createAuthor(authorName);
    return newAuthor.id;
  };

  /**
   * Resolves or creates a Language
   */
  const resolveLanguageId = async (languageName: string): Promise<number> => {
    const languages = await getLanguageByName(languageName);
    if (languages && languages.length > 0) {
      return languages[0].id;
    }
    const newLanguage = await createLanguage(languageName);
    return newLanguage.id;
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      pages: "",
      releaseDate: null,
      publisherName: "",
      authorName: "",
      languageName: "",
    });
    setValidationErrors([]);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.light.textLight} />
        <Text style={{ color: "white", marginTop: 12 }}>
          Verifying your session...
        </Text>
      </View>
    );
  }

  const getErrorForField = (field: string): ValidationError | undefined => {
    return validationErrors.find((e) => e.field === field);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Create new Book</Text>
        <Text style={styles.sectionTitle}>Book Details</Text>

        <FormInput
          label="Title"
          value={formData.title}
          onChangeText={(text) => handleFieldChange("title", text)}
          error={getErrorForField("title")}
          placeholder="e.g. The Metamorphosis"
          required
        />

        <FormInput
          label="Number of Pages"
          value={formData.pages}
          onChangeText={(text) => handleFieldChange("pages", text)}
          error={getErrorForField("pages")}
          keyboardType="numeric"
          placeholder="e.g. 304"
          required
        />

        <View>
          <Text
            style={[
              styles.label,
              getErrorForField("releaseDate") && styles.errorLabel,
            ]}
          >
            Publication Date *
          </Text>
          <View
            style={[
              styles.calendarWrapper,
              getErrorForField("releaseDate") && styles.errorBorder,
            ]}
          >
            <Calendar
              onDayPress={(day: any) => {
                const d = new Date(day.dateString);
                handleFieldChange("releaseDate", d);
              }}
              markedDates={{
                [formData.releaseDate?.toISOString().split("T")[0] || ""]: {
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
          {getErrorForField("releaseDate") && (
            <Text style={styles.errorMessage}>
              {getErrorForField("releaseDate")?.message}
            </Text>
          )}
        </View>

        <FormInput
          label="Publisher"
          value={formData.publisherName}
          onChangeText={(text) => handleFieldChange("publisherName", text)}
          error={getErrorForField("publisherName")}
          placeholder="e.g. 1st Book Library"
          required
        />

        <FormInput
          label="Author"
          value={formData.authorName}
          onChangeText={(text) => handleFieldChange("authorName", text)}
          error={getErrorForField("authorName")}
          placeholder="e.g. Franz Kafka"
          required
        />

        <FormInput
          label="Language"
          value={formData.languageName}
          onChangeText={(text) => handleFieldChange("languageName", text)}
          error={getErrorForField("languageName")}
          placeholder="e.g. English"
          required
        />

        <FormActions onSave={handleSave} onCancel={handleCancel} />
      </ScrollView>
    </SafeAreaView>
  );
};

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
 * FormInput Component with Error Display
 *
 * Features:
 * - Displays error message under the input
 * - Red highlight on error
 * - Required badge (*)
 */
const FormInput: React.FC<FormInputProps> = ({
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  container: { padding: 25, paddingBottom: 100 },
  header: {
    fontSize: 28,
    color: Colors.light.textWhite,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 10,
  },
  sectionTitle: {
    color: Colors.light.textWhite,
    fontSize: 18,
    textAlign: "center",
    marginVertical: 15,
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

export default CreateBook;
