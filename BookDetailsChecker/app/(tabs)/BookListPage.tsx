import React, { useState, useCallback, useEffect } from "react";
import { View, FlatList, Alert } from "react-native";
import {
  ActivityIndicator,
  Text,
  Button,
  Searchbar,
  Provider as PaperProvider,
  MD3DarkTheme,
} from "react-native-paper";
import { useFocusEffect, useRouter } from "expo-router";
import { getBooks, Book } from "../../services/bookService";
import { Colors } from "../../constants/theme";
import BookCard from "../../components/BookCard";
import { useRouter } from "expo-router";
import { getAuthors, getBookAuthorLinks } from "../../services/authorService";
import { BookAuthorLink } from "@/types/models/BookAuthorLink";

const PAGE_SIZE = 10;

export default function BookListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [authors, setAuthors] = useState<any[]>([]);
  const [links, setLinks] = useState<BookAuthorLink[]>([]);

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

  const fetchAuthors = async () => {
    try {
      const data = await getAuthors();
      setAuthors(data);
    } catch (err) {
      console.error("Failed to fetch authors:", err);
    }
  };

  const fetchLinks = async () => {
    try {
      const data = (await getBookAuthorLinks()) as BookAuthorLink[];
      setLinks(data);
    } catch (err) {
      console.error("Failed to fetch links:", err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching with params:", {
        page: currentPage,
        limit: PAGE_SIZE,
        sort: "title",
        order: sortOrder,
        titleSearch: searchQuery || undefined,
      });
      const { books: data, total } = await getBooks({
        page: currentPage,
        limit: PAGE_SIZE,
        sort: "title",
        order: sortOrder,
        titleSearch: searchQuery || undefined,
      });
      console.log("Got back:", data.length, "books, total:", total);
      setBooks(data);
      setTotalBooks(total);
    } catch (err: any) {
      console.error("Failed to fetch books:", err);
      setError("Could not load books. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAuthors();
      fetchLinks();
      fetchBooks();
    }, [currentPage, sortOrder, searchQuery]),
  );

  useEffect(() => {
    fetchBooks();
  }, [currentPage, sortOrder, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalBooks / PAGE_SIZE));

  if (loading && books.length === 0) {
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

  if (error && books.length === 0) {
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
          <Text
            variant="bodyLarge"
            style={{
              color: "#ff6b6b",
              textAlign: "center",
              paddingHorizontal: 20,
            }}
          >
            {error}
          </Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={customTheme}>
      <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
        <Searchbar
          placeholder="Search by title"
          onChangeText={handleSearch}
          value={searchQuery}
          style={{
            marginHorizontal: 16,
            marginTop: 50,
            backgroundColor: Colors.light.textWhite,
            borderRadius: 12,
          }}
          inputStyle={{ color: "#1a1a1a" }}
          iconColor="#555"
          placeholderTextColor="#555"
        />

        <Button
          mode="text"
          onPress={() => {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
            setCurrentPage(1);
          }}
          textColor={Colors.light.textWhite}
          icon={
            sortOrder === "asc"
              ? "sort-alphabetical-ascending"
              : "sort-alphabetical-descending"
          }
          style={{ alignSelf: "flex-end", marginRight: 16, marginTop: 8 }}
        >
          {sortOrder === "asc" ? "A → Z" : "Z → A"}
        </Button>

        {loading && (
          <ActivityIndicator
            size="small"
            color={Colors.light.textLight}
            style={{ marginVertical: 8 }}
          />
        )}

        <FlatList
          data={books}
          keyExtractor={(item) =>
            item.id?.toString() ?? Math.random().toString()
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          renderItem={({ item }) => {
            const bookAuthorEntry = links.find((l) => l.book_id === item.id);

            const authorData = authors.find(
              (a) => a.id === bookAuthorEntry?.author_id,
            );

            const displayAuthor = authorData
              ? authorData.author_name
              : "Unknown Author";

            return (
              <BookCard
                title={item.title}
                author={displayAuthor}
                onPress={() =>
                  router.push({
                    pathname: "/BookDetailPage",
                    params: { id: item.id?.toString() },
                  })
                }
              />
            );
          }}
        />

        {books.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 12,
              paddingBottom: 90,
              gap: 16,
            }}
          >
            <Button
              mode="contained"
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              buttonColor={Colors.light.button}
              textColor={Colors.light.textWhite}
              style={{
                borderRadius: 10,
                borderWidth: 2,
                borderColor: Colors.light.buttonBorder,
              }}
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
              style={{
                borderRadius: 10,
                borderWidth: 2,
                borderColor: Colors.light.buttonBorder,
              }}
            >
              Next
            </Button>
          </View>
        )}
      </View>
    </PaperProvider>
  );
}
