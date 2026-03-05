import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../services/api";
import {
  getPublisherByName,
  createPublisher,
} from "../services/publisherService";
import { getAuthorByName, createAuthor } from "../services/authorService";
import { getLanguageByName, createLanguage } from "../services/languageService";
import type { Book } from "../types/models/Book";
import type { BookAuthorLink } from "../types/models/BookAuthorLink";
import type { Publisher } from "../types/models/Publisher";
import type { Language } from "../types/models/Language";
import type { Author } from "../types/models/Author";
import { createBook } from "../services/bookService";

export interface ValidationError {
  field: string;
  message: string;
}

export interface BookFormData {
  title: string;
  isbn13: string;
  pages: string;
  releaseDate: string;
  publisherName: string;
  authorName: string;
  languageName: string;
}

export type FormMode = "create" | "edit";

/**
 * Field validation rules for book form fields
 * Each validator returns ValidationError or null if valid
 * @internal
 */
const VALIDATORS: Record<string, (val: any) => ValidationError | null> = {
  title: (val) => {
    if (!val?.trim()) return { field: "title", message: "Title is required" };
    if (val.trim().length < 2)
      return { field: "title", message: "Title must be at least 2 characters" };
    if (val.trim().length > 200)
      return {
        field: "title",
        message: "Title must be less than 200 characters",
      };
    return null;
  },

  pages: (val) => {
    if (!val?.toString().trim())
      return { field: "pages", message: "Number of pages is required" };
    if (!/^\d+$/.test(val.toString().trim()))
      return { field: "pages", message: "Only numbers allowed" };
    const numPages = Number(val);
    if (numPages <= 0)
      return { field: "pages", message: "Must be greater than 0" };
    if (numPages > 99999)
      return { field: "pages", message: "Maximum 99999 pages" };
    return null;
  },

  releaseDate: (val) => {
    if (!val)
      return { field: "releaseDate", message: "Publication date is required" };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(val) > today)
      return { field: "releaseDate", message: "Date cannot be in the future" };
    return null;
  },

  publisherName: (val) => {
    if (!val?.trim())
      return { field: "publisherName", message: "Publisher name is required" };
    if (val.trim().length < 2)
      return {
        field: "publisherName",
        message: "Publisher must be at least 2 characters",
      };
    if (val.trim().length > 100)
      return {
        field: "publisherName",
        message: "Publisher must be less than 100 characters",
      };
    return null;
  },

  authorName: (val) => {
    if (!val?.trim())
      return { field: "authorName", message: "Author name is required" };
    if (val.trim().length < 2)
      return {
        field: "authorName",
        message: "Author must be at least 2 characters",
      };
    if (val.trim().length > 100)
      return {
        field: "authorName",
        message: "Author must be less than 100 characters",
      };
    return null;
  },

  languageName: (val) => {
    if (!val?.trim())
      return { field: "languageName", message: "Language is required" };
    if (val.trim().length < 2)
      return {
        field: "languageName",
        message: "Language must be at least 2 characters",
      };
    if (val.trim().length > 50)
      return {
        field: "languageName",
        message: "Language must be less than 50 characters",
      };
    return null;
  },

  isbn13: (val) => {
    if (!val) return null;
    const cleaned = val.replace(/-/g, "");
    if (!/^\d{13}$/.test(cleaned))
      return { field: "isbn13", message: "ISBN must be 13 digits" };
    return null;
  },
};

/**
 * Resolves or creates a publisher by name
 * @param publisherName - The name of the publisher
 * @returns The ID of the existing or newly created publisher
 * @internal
 */
const resolvePublisherId = async (publisherName: string): Promise<number> => {
  const publishers = await getPublisherByName(publisherName);
  if (publishers?.length > 0) return publishers[0].id;
  const newPublisher = await createPublisher(publisherName);
  return newPublisher.id;
};

/**
 * Resolves or creates an author by name
 * @param authorName - The name of the author
 * @returns The ID of the existing or newly created author
 * @internal
 */
const resolveAuthorId = async (authorName: string): Promise<number> => {
  const authors = await getAuthorByName(authorName);
  if (authors?.length > 0) return authors[0].id;
  const newAuthor = await createAuthor(authorName);
  return newAuthor.id;
};

/**
 * Resolves or creates a language by name
 * @param languageName - The name of the language
 * @returns The ID of the existing or newly created language
 * @internal
 */
const resolveLanguageId = async (languageName: string): Promise<number> => {
  const languages = await getLanguageByName(languageName);
  if (languages?.length > 0) return languages[0].id;
  const newLanguage = await createLanguage(languageName);
  return newLanguage.id;
};

/**
 * Updates or creates the book-author relationship
 * Handles author changes by deleting old link and creating new one
 * @param bookId - The ID of the book
 * @param authorId - The ID of the author
 * @internal
 */
const updateAuthorLink = async (bookId: number, authorId: number) => {
  const response = await api.get<BookAuthorLink[]>(
    `/book_author?book_id=${bookId}`,
  );
  const links = response.data;

  if (links?.length > 0) {
    if (links[0].author_id === authorId) return;
    await api.delete(`/book_author/${links[0].id}`);
  }
  await api.post("/book_author", { book_id: bookId, author_id: authorId });
};

/**
 * Custom hook for managing book form state and operations
 * Handles both create and edit modes with shared validation and API logic
 *
 * @param mode - Either "create" for new books or "edit" for existing books
 * @param bookId - Required for edit mode, the ID of the book to edit
 *
 * @returns Object containing form state, handlers, and utilities
 *
 * @example
 * // Create new book
 * const form = useBookForm("create");
 *
 * @example
 * // Edit existing book
 * const form = useBookForm("edit", 123);
 * useEffect(() => {
 *   form.loadBookData();
 * }, []);
 */
export const useBookForm = (mode: FormMode, bookId?: number) => {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );

  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    isbn13: "",
    pages: "",
    releaseDate: "",
    publisherName: "",
    authorName: "",
    languageName: "",
  });

  /**
   * Validates a single field using the VALIDATORS map
   * @param field - The field key to validate
   * @param value - The value to validate
   * @returns ValidationError if invalid, null if valid
   */
  const validateField = (field: keyof BookFormData, value: any) => {
    const validator = VALIDATORS[field];
    return validator ? validator(value) : null;
  };

  /**
   * Validates all form fields at once
   * @returns true if all fields are valid, false otherwise
   */
  const validateAllFields = () => {
    const errors = Object.entries(formData)
      .map(([field, value]) =>
        validateField(field as keyof BookFormData, value),
      )
      .filter(Boolean) as ValidationError[];
    setValidationErrors(errors);
    return errors.length === 0;
  };

  /**
   * Handles field changes with real-time validation
   * Updates form data and validates the changed field immediately
   * @param field - The field that changed
   * @param value - The new value
   */
  const handleFieldChange = (field: keyof BookFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setValidationErrors((prev) => {
      const filtered = prev.filter((e) => e.field !== field);
      return error ? [...filtered, error] : filtered;
    });
  };

  /**
   * Loads book data from API for edit mode
   * Fetches book details and related publisher, language, and author information
   * Only runs in edit mode with valid bookId
   */
  const loadBookData = useCallback(async () => {
    if (mode !== "edit" || !bookId) return;
    setLoading(true);
    try {
      const bookRes = await api.get<Book>(`/book/${bookId}`);
      const book = bookRes.data;

      const publisherRes = await api.get<Publisher>(
        `/publisher/${book.publisher_id}`,
      );
      const publisherName = publisherRes.data.publisher_name;

      const languageRes = await api.get<Language>(
        `/book_language/${book.language_id}`,
      );
      const languageName =
        languageRes.data.language_name || languageRes.data.language_code;

      const authorLinksRes = await api.get<BookAuthorLink[]>(
        `/book_author?book_id=${bookId}`,
      );
      const authorLink = authorLinksRes.data?.[0];

      let authorName = "";
      if (authorLink) {
        const authorRes = await api.get<Author>(
          `/author/${authorLink.author_id}`,
        );
        authorName = authorRes.data.author_name;
      }

      setFormData({
        title: book.title,
        isbn13: book.isbn13 || "",
        pages: book.num_pages.toString(),
        releaseDate: book.publication_date,
        publisherName,
        languageName,
        authorName,
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        !error.response ? "Couldn't connect to server." : "Couldn't load book.",
        [
          { text: "Retry", onPress: loadBookData },
          { text: "Go Back", onPress: () => router.back(), style: "cancel" },
        ],
      );
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  /**
   * Saves the book (creates new or updates existing)
   * Validates all fields, resolves entity IDs, makes API calls, and handles errors
   * Prevents race conditions with saving flag
   *
   * @returns Promise<number | boolean | null>
   * - Create mode: Returns new book ID on success
   * - Edit mode: Returns true on success
   * - Both: Returns null on error
   */
  const handleSave = useCallback(async () => {
    if (!validateAllFields()) {
      Alert.alert("Validation Error", "Please correct all marked fields.");
      return null;
    }

    if (saving) return null;
    setSaving(true);

    try {
      const publisherId = await resolvePublisherId(formData.publisherName);
      const authorId = await resolveAuthorId(formData.authorName);
      const languageId = await resolveLanguageId(formData.languageName);

      if (mode === "create") {
        const newBook = await createBook({
          title: formData.title,
          num_pages: Number(formData.pages),
          publication_date: formData.releaseDate,
          publisher_id: publisherId,
          language_id: languageId,
          isbn13: formData.isbn13,
        });

        await updateAuthorLink(newBook.id!, authorId);

        Alert.alert("Success", "Book created!", [
          {
            text: "View",
            onPress: () => {
              router.push({
                pathname: "/(tabs)/BookDetailPage",
                params: { id: newBook.id },
              });
            },
          },
        ]);
        return newBook.id;
      } else {
        await api.put(`/book/${bookId}`, {
          title: formData.title,
          isbn13: formData.isbn13,
          num_pages: Number(formData.pages),
          publication_date: formData.releaseDate,
          publisher_id: publisherId,
          language_id: languageId,
        });

        await updateAuthorLink(bookId!, authorId);

        Alert.alert("Success", "Book updated!", [{ text: "OK" }]);
        return true;
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (!error.response) {
        Alert.alert("Network Error", "Couldn't connect to server.", [
          { text: "Retry", onPress: () => handleSave() },
          { text: "Cancel", style: "cancel" },
        ]);
      } else if (status === 404) {
        Alert.alert("Not Found", "Book was deleted.", [
          { text: "Go Back", onPress: () => router.back() },
        ]);
      } else if (status === 409) {
        Alert.alert("Conflict", "Book was modified. Reload?", [
          { text: "Reload", onPress: () => loadBookData() },
          { text: "Cancel", style: "cancel" },
        ]);
      } else {
        Alert.alert("Error", "Something went wrong while saving.", [
          { text: "Retry", onPress: () => handleSave() },
          { text: "Cancel", style: "cancel" },
        ]);
      }
      return null;
    } finally {
      setSaving(false);
    }
  }, [mode, bookId, formData, saving]);

  /**
   * Resets form to initial empty state and clears validation errors
   */
  const resetForm = () => {
    setFormData({
      title: "",
      isbn13: "",
      pages: "",
      releaseDate: "",
      publisherName: "",
      authorName: "",
      languageName: "",
    });
    setValidationErrors([]);
  };

  return {
    loading,
    saving,
    formData,
    validationErrors,
    loadBookData,
    handleFieldChange,
    handleSave,
    resetForm,
    getErrorForField: (field: keyof BookFormData) =>
      validationErrors.find((e) => e.field === field),
  };
};
