import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, ScrollView, Image, Alert } from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  Provider as PaperProvider,
  MD3DarkTheme,
  Snackbar,
} from "react-native-paper";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { api } from "../../services/api";
import { Colors } from "../../constants/theme";
import type { Book } from "../../types/models/Book";
import type { BookAuthorLink } from "../../types/models/BookAuthorLink";
import type { Publisher } from "../../types/models/Publisher";
import type { Language } from "../../types/models/Language";
import type { Author } from "../../types/models/Author";

/**

 * Displays detailed information for a single book.

 *

 * Reads the `id` route parameter and fetches the book record together with

 * its related author, language, and publisher via separate API calls.

 * Cover art is loaded from the OpenLibrary covers API using the book's ISBN-13.

 * If no ISBN is present, or the image request fails, a fallback text is shown.

 * The delete button also doesn't immediately delete the book, but shows a confirmation dialog first. If the user confirms, a 5-second undoable countdown starts,
 *  during which the user can cancel the delete action. If the countdown completes without cancellation, the book is deleted and the user is navigated back to the book list.

 * @remarks

 * Navigates back to BookListPage after a successful delete.

 */

export default function BookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [authorName, setAuthorName] = useState<string>("Unknown");
  const [languageName, setLanguageName] = useState<string>("Unknown");
  const [publisherName, setPublisherName] = useState<string>("Unknown");
  const [loading, setLoading] = useState(true);

  const [undoVisible, setUndoVisible] = useState(false);
  const [isPendingDelete, setIsPendingDelete] = useState(false);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const customTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: Colors.light.textLight,
      background: Colors.light.background,
      surface: Colors.light.button,
      onSurface: Colors.light.textLight,
    },
  };

  const fetchBookDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setBook(null);
    setAuthorName("Unknown");
    setLanguageName("Unknown");
    setPublisherName("Unknown");

    try {
      const bookRes = await api.get<Book>(`/book/${id}`);
      const bookData = bookRes.data;
      setBook(bookData);

      try {
        const authorRes = await api.get<BookAuthorLink[]>(
          `/book_author?book_id=${id}`,
        );
        if (authorRes.data.length > 0) {
          const authorId = authorRes.data[0].author_id;
          const authorDetail = await api.get<Author>(`/author/${authorId}`);
          setAuthorName(authorDetail.data.author_name || "Unknown");
        }
      } catch {
        setAuthorName("Unknown");
      }

      try {
        const langRes = await api.get<Language>(
          `/book_language/${bookData.language_id}`,
        );
        setLanguageName(
          langRes.data.language_name || langRes.data.language_code || "Unknown",
        );
      } catch {
        setLanguageName("Unknown");
      }

      try {
        const pubRes = await api.get<Publisher>(
          `/publisher/${bookData.publisher_id}`,
        );
        setPublisherName(pubRes.data.publisher_name || "Unknown");
      } catch {
        setPublisherName("Unknown");
      }
    } catch (err) {
      console.error("Failed to load book details:", err);
      Alert.alert("Error", "Could not load book details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchBookDetails();
    }, [fetchBookDetails]),
  );

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
        api.delete(`/book/${id}`).catch((err) => console.error("Unmount delete failed", err));
      }
    };
  }, [id]);

  const performActualDelete = async () => {
    try {
      deleteTimeoutRef.current = null;
      await api.delete(`/book/${id}`);
      router.replace("/(tabs)/BookListPage");
    } catch (err) {
      console.error("Failed to delete book:", err);
      Alert.alert("Error", "Could not delete book.");
      setIsPendingDelete(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setIsPendingDelete(true);
          setUndoVisible(true);
          
          deleteTimeoutRef.current = setTimeout(() => {
            setUndoVisible(false);
            performActualDelete();
          }, 5000);
        },
      },
    ]);
  };

  const handleUndo = () => {
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
    setUndoVisible(false);
    setIsPendingDelete(false);
  };

  const coverUrl = book?.isbn13
    ? `https://covers.openlibrary.org/b/isbn/${book.isbn13}-L.jpg?default=false`
    : null;

  if (loading) {
    return (
      <PaperProvider theme={customTheme}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.light.background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={Colors.light.textLight} />
        </View>
      </PaperProvider>
    );
  }

  if (!book) {
    return (
      <PaperProvider theme={customTheme}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.light.background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text variant="bodyLarge" style={{ color: "#ff6b6b" }}>
            Book not found.
          </Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={customTheme}>
      <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: Colors.light.textWhite,
              paddingHorizontal: 20,
              paddingTop: 50,
              marginBottom: 16,
            }}
          >
            Info
          </Text>

          <View
            style={{
              backgroundColor: Colors.light.textLight,
              marginHorizontal: 20,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 20,
              marginBottom: 20,
              minHeight: 300,
              opacity: isPendingDelete ? 0.5 : 1, // Visually dim the card during delete countdown
            }}
          >
            {coverUrl ? (
              <CoverImage uri={coverUrl} />
            ) : (
              <Text style={{ color: "#555", fontSize: 15 }}>No image found</Text>
            )}
          </View>

          <View style={{ paddingHorizontal: 20, opacity: isPendingDelete ? 0.5 : 1 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: Colors.light.textLight,
                marginBottom: 4,
              }}
            >
              About {book.title}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: Colors.light.textWhite,
                marginBottom: 20,
                fontWeight: "bold",
              }}
            >
              Book Details Checker
            </Text>

            <DetailRow
              label="Published"
              value={book.publication_date || "Unknown"}
            />
            <DetailRow label="Author" value={authorName} />
            <DetailRow label="Language" value={languageName} />
            <DetailRow
              label="Numbers of pages"
              value={book.num_pages?.toString() || "Unknown"}
            />
            <DetailRow label="ISBN" value={book.isbn13 || "Unknown"} />
            <DetailRow label="Publisher" value={publisherName} />

            <Text
              style={{
                color: Colors.light.textWhite,
                fontSize: 13,
                marginTop: 20,
                opacity: 0.7,
              }}
            >
              This is a student project for ÜK 335.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <Button
                mode="outlined"
                disabled={isPendingDelete}
                onPress={() =>
                  router.push({
                    pathname: "/EditPage",
                    params: { id: book.id?.toString() },
                  })
                }
                textColor={Colors.light.textWhite}
                style={{
                  borderColor: Colors.light.buttonBorder,
                  borderWidth: 2,
                  borderRadius: 20,
                }}
              >
                Edit
              </Button>

              <Button
                mode="contained"
                disabled={isPendingDelete}
                onPress={handleDelete}
                buttonColor="#8B0000"
                textColor={Colors.light.textWhite}
                style={{ borderRadius: 20 }}
              >
                Delete
              </Button>
            </View>
          </View>
        </ScrollView>

        {/* --- Undo Snackbar --- */}
        <Snackbar
          visible={undoVisible}
          onDismiss={() => setUndoVisible(false)}
          duration={5000}
          action={{
            label: "Undo",
            onPress: handleUndo,
          }}
        >
          Deleted book, undo?
        </Snackbar>
      </View>
    </PaperProvider>
  );
}

const CoverImage = ({ uri }: { uri: string }) => {
  const [error, setError] = useState(false);

  if (error) {
    return <Text style={{ color: "#555", fontSize: 15 }}>No image found</Text>;
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: 180, height: 260, borderRadius: 8 }}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: "rgba(255,255,255,0.15)",
    }}
  >
    <Text style={{ color: Colors.light.textWhite, fontSize: 15 }}>{label}</Text>
    <Text
      style={{ color: Colors.light.textWhite, fontSize: 15, fontWeight: "600" }}
    >
      {value}
    </Text>
  </View>
);