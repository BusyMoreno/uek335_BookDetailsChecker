import React, { useState, useEffect } from "react";
import { View, ScrollView, Image, Alert } from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  Provider as PaperProvider,
  MD3DarkTheme,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getBookById, Book } from "../../services/bookService";
import { api } from "../../services/api";
import { Colors } from "../../constants/theme";

const COVER_PLACEHOLDER = require("../../assets/images/book-placeholder.png");

export default function BookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [authorName, setAuthorName] = useState<string>("Unknown");
  const [languageName, setLanguageName] = useState<string>("Unknown");
  const [publisherName, setPublisherName] = useState<string>("Unknown");
  const [loading, setLoading] = useState(true);
  const [coverError, setCoverError] = useState(false);

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

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) return;

      setLoading(true);
      setBook(null);
      setAuthorName("Unknown");
      setLanguageName("Unknown");
      setPublisherName("Unknown");
      setCoverError(false);

      try {
        const bookData = await getBookById(Number(id));
        setBook(bookData);

        // Fetch author via book_author junction
        try {
          const authorRes = await api.get<
            { book_id: number; author_id: number }[]
          >(`/book_author?book_id=${id}`);
          if (authorRes.data.length > 0) {
            const authorId = authorRes.data[0].author_id;
            const authorDetail = await api.get<{ author_name: string }>(
              `/author/${authorId}`,
            );
            setAuthorName(authorDetail.data.author_name || "Unknown");
          }
        } catch {
          setAuthorName("Unknown");
        }

        // Fetch language
        try {
          const langRes = await api.get<{
            language_name?: string;
            language_code?: string;
          }>(`/book_language/${bookData.language_id}`);
          setLanguageName(
            langRes.data.language_name ||
              langRes.data.language_code ||
              "Unknown",
          );
        } catch {
          setLanguageName("Unknown");
        }

        // Fetch publisher
        try {
          const pubRes = await api.get<{ publisher_name: string }>(
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
    };

    fetchBookDetails();
  }, [id]);

  const handleDelete = async () => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/book/${id}`);
            Alert.alert("Deleted", "Book has been deleted.");
            router.replace("/(tabs)/BookListPage");
          } catch (err) {
            console.error("Failed to delete book:", err);
            Alert.alert("Error", "Could not delete book.");
          }
        },
      },
    ]);
  };

  const coverUrl = book?.isbn13
    ? `https://covers.openlibrary.org/b/isbn/${book.isbn13}-L.jpg`
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
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.light.background }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
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

        {/* Cover Image */}
        <View
          style={{
            backgroundColor: Colors.light.textLight,
            marginHorizontal: 20,
            borderRadius: 12,
            alignItems: "center",
            paddingVertical: 20,
            marginBottom: 20,
          }}
        >
          <Image
            source={
              coverUrl && !coverError ? { uri: coverUrl } : COVER_PLACEHOLDER
            }
            style={{ width: 180, height: 260, borderRadius: 8 }}
            resizeMode="cover"
            onError={() => setCoverError(true)}
          />
        </View>

        {/* About Section */}
        <View style={{ paddingHorizontal: 20 }}>
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

          {/* Detail Rows */}
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

          {/* Footer text */}
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

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 20,
            }}
          >
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: "/EditPage",
                  params: {
                    bookId: book.id?.toString(),
                  },
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
    </PaperProvider>
  );
}

// Reusable row component for detail fields
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
