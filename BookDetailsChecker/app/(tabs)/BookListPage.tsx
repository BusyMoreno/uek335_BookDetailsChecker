import React, { useState, useCallback, useEffect } from "react";
import { View, FlatList } from "react-native";
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
import { getAuthors, getBookAuthorLinks } from "../../services/authorService";
import { BookAuthorLink } from "@/types/models/BookAuthorLink";

const PAGE_SIZE = 10;

/**
 * Displays a paginated, searchable, and sortable list of books.
 *
 * On mount and whenever the page, sort order, or search query changes,
 * the component fetches books from the API alongside their author and
 * junction-table data. Tapping a card navigates to {@link BookDetailPage}.
 */
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

    /** Fetches all authors and stores them in state. */
    const fetchAuthors = async () => {
        try {
            const data = await getAuthors();
            setAuthors(data);
        } catch (err) {
            console.error("Failed to fetch authors:", err);
        }
    };

    /** Fetches all book-author junction records and stores them in state. */
    const fetchLinks = async () => {
        try {
            const data = (await getBookAuthorLinks()) as BookAuthorLink[];
            setLinks(data);
        } catch (err) {
            console.error("Failed to fetch links:", err);
        }
    };

    /**
     * Fetches a page of books matching the current search query and sort order.
     * Updates {@link books}, {@link totalBooks}, and {@link error} accordingly.
     */
    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const { books: data, total } = await getBooks({
                page: currentPage,
                limit: PAGE_SIZE,
                sort: "title",
                order: sortOrder,
                titleSearch: searchQuery || undefined,
            });
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

    /**
     * Handles search input changes.
     * Resets pagination to page 1 whenever the query changes.
     *
     * @param query - The current value of the search input.
     */
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
                                        pathname: "/(tabs)/BookDetailPage",
                                        params: { id: item.id },
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
                            paddingBottom: 16,
                            gap: 16,
                        }}
                    >
                        <Button
                            mode="contained"
                            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            buttonColor="#A89575"
                            textColor="#69DE20"
                            style={{
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: "#69DE20",
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
                            buttonColor="#A89575"
                            textColor="#A60000"
                            style={{
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: "#A60000",
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