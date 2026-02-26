import React, { useState, useCallback } from "react";
import { View, FlatList } from "react-native";
import {
  ActivityIndicator,
  Text,
  Button,
  Provider as PaperProvider,
  MD3DarkTheme,
} from "react-native-paper";
import { useFocusEffect } from "expo-router";
import { getBooks, Book } from "../../services/bookService";
import { Colors } from "../../constants/theme";
import BookCard from "../../components/BookCard";

const PAGE_SIZE = 10;

export default function BookListPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useFocusEffect(
    useCallback(() => {
      const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getBooks();
          setAllBooks(data);
          setCurrentPage(1);
        } catch (err: any) {
          console.error("Failed to fetch books:", err);
          setError("Could not load books. Is the server running?");
        } finally {
          setLoading(false);
        }
      };

      fetchBooks();
    }, [])
  );

  const totalPages = Math.ceil(allBooks.length / PAGE_SIZE);
  const paginatedBooks = allBooks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <PaperProvider theme={customTheme}>
        <View style={{ flex: 1, backgroundColor: Colors.light.background, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.light.textLight} />
        </View>
      </PaperProvider>
    );
  }

  if (error) {
    return (
      <PaperProvider theme={customTheme}>
        <View style={{ flex: 1, backgroundColor: Colors.light.background, justifyContent: "center", alignItems: "center" }}>
          <Text variant="bodyLarge" style={{ color: "#ff6b6b", textAlign: "center", paddingHorizontal: 20 }}>
            {error}
          </Text>
        </View>
      </PaperProvider>
    );
  }

  if (allBooks.length === 0) {
    return (
      <PaperProvider theme={customTheme}>
        <View style={{ flex: 1, backgroundColor: Colors.light.background, justifyContent: "center", alignItems: "center" }}>
          <Text variant="bodyLarge" style={{ color: Colors.light.textLight }}>
            No books yet. Add one!
          </Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={customTheme}>
      <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
        <FlatList
          data={paginatedBooks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingTop: 50, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <BookCard
              title={item.title}
              author={"Author"} // TODO: replace once author API is ready
            />
          )}
        />

        {/* Pagination controls */}
        <View style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 12,
          paddingBottom: 90,
          gap: 16,
        }}>
          <Button
            mode="contained"
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            buttonColor={Colors.light.button}
            textColor={Colors.light.textWhite}
            style={{ borderRadius: 10, borderWidth: 2, borderColor: Colors.light.buttonBorder }}
          >
            Previous
          </Button>

          <Text style={{ color: Colors.light.textWhite, fontSize: 16 }}>
            {currentPage} / {totalPages}
          </Text>

          <Button
            mode="contained"
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            buttonColor={Colors.light.button}
            textColor={Colors.light.textWhite}
            style={{ borderRadius: 10, borderWidth: 2, borderColor: Colors.light.buttonBorder }}
          >
            Next
          </Button>
        </View>
      </View>
    </PaperProvider>
  );
}