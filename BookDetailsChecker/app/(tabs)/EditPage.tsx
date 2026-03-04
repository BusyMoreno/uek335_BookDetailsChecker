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
import { Colors } from "../../constants/theme";
import FormActions from "../../components/FormActions";
import { Calendar } from "react-native-calendars";
import * as SecureStore from "expo-secure-store";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { api } from "../../services/api";
import {
  getPublisherByName,
  createPublisher,
} from "../../services/publisherService";
import { getAuthorByName, createAuthor } from "../../services/authorService";
import {
  getLanguageByName,
  createLanguage,
} from "../../services/languageService";
import { Book } from "../../types/models/Book";

interface ValidationError {
  field: string;
  message: string;
}

interface BookFormData extends Omit<Book, "id"> {
  publisherName: string;
  authorName: string;
  languageName: string;
}

/**
 * EditBook Page Component
 *
 * This page allows authenticated users to view and modify books
 *
 */
const EditBook = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookId = Number(params.bookId || params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    isbn13: "",
    language_id: 0,
    num_pages: 0,
    publication_date: "",
    publisher_id: 0,
    publisherName: "",
    authorName: "",
    languageName: "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );

  const updateFormData = useCallback((updates: Partial<BookFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!bookId || bookId === 0) {
        Alert.alert(
          "Invalid Book",
          "The book couldn't be loaded. Please return to the book list and try again.",
          [{ text: "Go Back", onPress: () => router.back(), style: "cancel" }],
        );
        return;
      }

      loadInitialData();
    }, [bookId]),
  );

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const book = await fetchBook();

      const [publisherName, languageName, authorName] = await Promise.all([
        fetchPublisherName(book.publisher_id),
        fetchLanguageName(book.language_id),
        fetchAuthorName(bookId),
      ]);

      updateFormData({
        title: book.title,
        isbn13: book.isbn13,
        language_id: book.language_id,
        num_pages: book.num_pages,
        publication_date: book.publication_date,
        publisher_id: book.publisher_id,
        publisherName,
        languageName,
        authorName,
      });
    } catch (error: any) {
      console.error("Error loading book details:", error);

      if ((error as any).message?.includes("Network")) {
        Alert.alert(
          "Network Error",
          "Couldn't connect to server. Check your internet connection.",
          [
            { text: "Retry", onPress: loadInitialData },
            { text: "Go Back", onPress: () => router.back(), style: "cancel" },
          ],
        );
      } else {
        Alert.alert("Error", "Couldn't load book details. Please try again.", [
          { text: "Retry", onPress: loadInitialData },
          { text: "Go Back", onPress: () => router.back(), style: "cancel" },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBook = async (): Promise<Book> => {
    const res = await api.get<Book>(`/book/${bookId}`);
    return res.data;
  };

  const fetchPublisherName = async (publisherId: number): Promise<string> => {
    if (!publisherId) return "";

    try {
      const res = await api.get<{ publisher_name: string }>(
        `/publisher/${publisherId}`,
      );
      return res.data.publisher_name || "";
    } catch (error) {
      console.warn(`Publisher ${publisherId} not found`);
      return "";
    }
  };

  const fetchLanguageName = async (languageId: number): Promise<string> => {
    if (!languageId) return "";

    try {
      const res = await api.get<{
        language_name?: string;
        language_code: string;
      }>(`/book_language/${languageId}`);
      return res.data.language_name || res.data.language_code || "";
    } catch (error) {
      console.warn(`Language ${languageId} not found`);
      return "";
    }
  };

  const fetchAuthorName = async (bookId: number): Promise<string> => {
    try {
      const linkRes = await api.get<Array<{ author_id: number }>>(
        `/book_author?book_id=${bookId}`,
      );

      if (!linkRes.data || linkRes.data.length === 0) {
        return "";
      }

      const authorRes = await api.get<{ author_name: string }>(
        `/author/${linkRes.data[0].author_id}`,
      );
      return authorRes.data.author_name || "";
    } catch (error) {
      console.warn(`Author for book ${bookId} not found`);
      return "";
    }
  };

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

      case "num_pages":
        if (!value || value.toString().trim() === "") {
          return { field, message: "Number of pages is required" };
        }
        if (!/^\d+$/.test(value.toString().trim())) {
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

      case "publication_date":
        if (!value) {
          return { field, message: "Publication date is required" };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(value) > today) {
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

  const handleFieldChange = (field: string, value: any) => {
    updateFormData({ [field]: value } as any);

    const error = getFieldError(field, value);

    setValidationErrors((prev) => {
      const filtered = prev.filter((e) => e.field !== field);

      if (error) {
        return [...filtered, error];
      }
      return filtered;
    });
  };

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
      !formData.publication_date ||
      !formData.publisherName.trim() ||
      !formData.authorName.trim() ||
      !formData.languageName.trim()
    ) {
      Alert.alert("Incomplete Form", "Please fill in all required fields.");
      return;
    }

    setSaving(true);

    try {
      const [publisherId, authorId, languageId] = await Promise.all([
        resolvePublisherId(formData.publisherName),
        resolveAuthorId(formData.authorName),
        resolveLanguageId(formData.languageName),
      ]);

      const updatedBook: Omit<Book, "id"> = {
        title: formData.title,
        isbn13: formData.isbn13,
        num_pages: formData.num_pages,
        publication_date: formData.publication_date,
        publisher_id: publisherId,
        language_id: languageId,
      };

      await api.put(`/book/${bookId}`, updatedBook);

      await updateOrCreateAuthorLink(bookId, authorId);

      Alert.alert("Success", "Book updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      if (error.response?.status === 404) {
        Alert.alert(
          "Not Found",
          "The book was deleted by another user. Please go back.",
          [{ text: "Go Back", onPress: () => router.back(), style: "cancel" }],
        );
      } else if (error.response?.status === 409) {
        Alert.alert(
          "Conflict",
          "Another user modified this book. Please reload and try again.",
          [
            { text: "Reload", onPress: loadInitialData },
            { text: "Cancel", style: "cancel" },
          ],
        );
      } else if (error.response?.status >= 500) {
        Alert.alert(
          "Server Error",
          "Server is temporarily unavailable. Please try again later.",
          [
            { text: "Retry", onPress: handleSave },
            { text: "Cancel", style: "cancel" },
          ],
        );
      } else if (!error.response) {
        Alert.alert(
          "Network Error",
          "Couldn't connect to server. Check your internet connection.",
          [
            { text: "Retry", onPress: handleSave },
            { text: "Cancel", style: "cancel" },
          ],
        );
      } else {
        console.error("Save error:", error);
        Alert.alert(
          "Error",
          "Something went wrong while saving. Please try again.",
          [
            { text: "Retry", onPress: handleSave },
            { text: "Cancel", style: "cancel" },
          ],
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const resolvePublisherId = async (publisherName: string): Promise<number> => {
    const publishers = await getPublisherByName(publisherName);

    if (publishers && publishers.length > 0) {
      return publishers[0].id;
    }

    const newPublisher = await createPublisher(publisherName);
    return newPublisher.id;
  };

  const resolveAuthorId = async (authorName: string): Promise<number> => {
    const authors = await getAuthorByName(authorName);

    if (authors && authors.length > 0) {
      return authors[0].id;
    }

    const newAuthor = await createAuthor(authorName);
    return newAuthor.id;
  };

  const resolveLanguageId = async (languageName: string): Promise<number> => {
    const languages = await getLanguageByName(languageName);

    if (languages && languages.length > 0) {
      return languages[0].id;
    }

    const newLanguage = await createLanguage(languageName);
    return newLanguage.id;
  };

  /**
   * Update or create book-author relationship
   */
  const updateOrCreateAuthorLink = async (
    bookId: number,
    authorId: number,
  ): Promise<void> => {
    try {
      const linksRes = await api.get<
        Array<{ book_id: number; author_id: number }>
      >(`/book_author?book_id=${bookId}`);

      if (linksRes.data && linksRes.data.length > 0) {
        const existingLink = linksRes.data[0];

        if (existingLink.author_id === authorId) {
          console.log("Author unchanged, skipping update");
          return;
        }

        console.log("Author changed, updating...");
        await api.delete(
          `/book_author?book_id=${bookId}&author_id=${existingLink.author_id}`,
        );
        await api.post("/book_author", {
          book_id: bookId,
          author_id: authorId,
        });
      } else {
        console.log("No existing link, creating new...");
        await api.post("/book_author", {
          book_id: bookId,
          author_id: authorId,
        });
      }
    } catch (error) {
      console.warn("Author link update failed but book was saved:", error);
    }
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
          Loading book details...
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
        <Text style={styles.header}>Edit Book</Text>
        <Text style={styles.subHeader}>Update your book details</Text>

        <View style={styles.form}>
          <FormInput
            label="Title"
            value={formData.title}
            onChangeText={(text) => handleFieldChange("title", text)}
            error={getErrorForField("title")}
            required
          />

          <FormInput
            label="ISBN-13"
            value={formData.isbn13 || ""}
            onChangeText={(text) => handleFieldChange("isbn13", text)}
            error={getErrorForField("isbn13")}
            placeholder="e.g. 978-3-16-148410-0"
          />

          <FormInput
            label="Number of Pages"
            value={formData.num_pages.toString()}
            onChangeText={(text) => handleFieldChange("num_pages", text)}
            error={getErrorForField("num_pages")}
            keyboardType="numeric"
            required
          />

          <View>
            <Text
              style={[
                styles.label,
                getErrorForField("publication_date") && styles.errorLabel,
              ]}
            >
              Publication Date *
            </Text>
            <View
              style={[
                styles.calendarWrapper,
                getErrorForField("publication_date") && styles.errorBorder,
              ]}
            >
              <Calendar
                onDayPress={(day: any) => {
                  handleFieldChange("publication_date", day.dateString);
                }}
                markedDates={{
                  [formData.publication_date || ""]: {
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
            {getErrorForField("publication_date") && (
              <Text style={styles.errorMessage}>
                {getErrorForField("publication_date")?.message}
              </Text>
            )}
          </View>

          <FormInput
            label="Publisher"
            value={formData.publisherName}
            onChangeText={(text) => handleFieldChange("publisherName", text)}
            error={getErrorForField("publisherName")}
            required
          />

          <FormInput
            label="Author"
            value={formData.authorName}
            onChangeText={(text) => handleFieldChange("authorName", text)}
            error={getErrorForField("authorName")}
            required
          />

          <FormInput
            label="Language"
            value={formData.languageName}
            onChangeText={(text) => handleFieldChange("languageName", text)}
            error={getErrorForField("languageName")}
            required
          />
        </View>

        <FormActions onSave={handleSave} onCancel={() => router.back()} />
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
  container: { padding: 25, paddingBottom: 50 },
  header: {
    fontSize: 28,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 20,
  },
  subHeader: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 30,
    marginTop: 5,
  },
  form: { marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { color: "white", marginBottom: 6, fontSize: 14, fontWeight: "500" },
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

export default EditBook;
