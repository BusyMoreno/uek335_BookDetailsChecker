import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
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

const EditBook = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const bookId = params.bookId || params.id;

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [pages, setPages] = useState("");
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [publisherName, setPublisherName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [languageName, setLanguageName] = useState("");
  const [image, setImage] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!bookId) {
        console.error("No id found in edit page!");
        return;
      }

      const loadInitialData = async () => {
        setLoading(true);
        try {
          const bookRes = await api.get<any>(`/book/${bookId}`);
          const book = bookRes.data;

          setTitle(book.title || "");
          setPages(book.num_pages?.toString() || "");
          setReleaseDate(
            book.publication_date ? new Date(book.publication_date) : null,
          );
          setImage(book.image || "");

          if (book.publisher_id) {
            api
              .get<any>(`/publisher/${book.publisher_id}`)
              .then((res) => setPublisherName(res.data.publisher_name))
              .catch(() => console.log("Publisher not found"));
          }

          if (book.language_id) {
            api
              .get<any>(`/book_language/${book.language_id}`)
              .then((res) =>
                setLanguageName(
                  res.data.language_name || res.data.language_code,
                ),
              )
              .catch(() => console.log("Language not found"));
          }

          api
            .get<any[]>(`/book_author?book_id=${bookId}`)
            .then(async (linkRes) => {
              if (linkRes.data.length > 0) {
                const authRes = await api.get<any>(
                  `/author/${linkRes.data[0].author_id}`,
                );
                setAuthorName(authRes.data.author_name);
              }
            })
            .catch(() => console.log("Author link not found"));
        } catch (error) {
          console.error("Error while loading details:", error);
          Alert.alert("Error", "Couldn't load book details.");
        } finally {
          setLoading(false);
        }
      };

      loadInitialData();
    }, [bookId]),
  );

  const handleSave = async () => {
    try {
      const formattedDate = releaseDate
        ? releaseDate.toISOString().split("T")[0]
        : "";

      const publishers = await getPublisherByName(publisherName);
      const publisherId = publishers.length
        ? publishers[0].id
        : (await createPublisher(publisherName)).id;

      const authors = await getAuthorByName(authorName);
      const authorId = authors.length
        ? authors[0].id
        : (await createAuthor(authorName)).id;

      const languages = await getLanguageByName(languageName);
      const languageId = languages.length
        ? languages[0].id
        : (await createLanguage(languageName)).id;

      await api.put(`/book/${bookId}`, {
        title,
        num_pages: Number(pages),
        publication_date: formattedDate,
        publisher_id: publisherId,
        language_id: languageId,
        image: image,
      });

      const oldLinksRes = await api.get<any[]>(
        `/book_author?book_id=${bookId}`,
      );
      const oldLinks = oldLinksRes.data;

      if (oldLinks.length > 0) {
        await api.put(`/book_author/${oldLinks[0].id}`, {
          book_id: Number(bookId),
          author_id: authorId,
        });
      } else {
        await api.post("/book_author", {
          book_id: Number(bookId),
          author_id: authorId,
        });
      }

      Alert.alert("Success", "Book updated successfully");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while updating.");
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
        <Text style={{ color: "white" }}>Loading book details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Edit Book</Text>
        <Text style={styles.subHeader}>Update your book details</Text>

        <View style={styles.form}>
          <FormInput label="Title" value={title} onChangeText={setTitle} />
          <FormInput
            label="Number of Pages"
            value={pages}
            onChangeText={setPages}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Publication Date</Text>
          <View style={styles.calendarWrapper}>
            <Calendar
              onDayPress={(day: any) =>
                setReleaseDate(new Date(day.dateString))
              }
              markedDates={{
                [releaseDate?.toISOString().split("T")[0] || ""]: {
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

          <FormInput
            label="Publisher"
            value={publisherName}
            onChangeText={setPublisherName}
          />
          <FormInput
            label="Author"
            value={authorName}
            onChangeText={setAuthorName}
          />
          <FormInput
            label="Language"
            value={languageName}
            onChangeText={setLanguageName}
          />
          <FormInput label="Image URL" value={image} onChangeText={setImage} />
        </View>

        <FormActions onSave={handleSave} onCancel={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
};

const FormInput = ({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
}: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={Colors.light.textField}
    />
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
  inputGroup: { marginBottom: 18 },
  label: { color: "white", marginBottom: 6, fontSize: 14 },
  input: {
    backgroundColor: Colors.light.textLight,
    padding: 14,
    borderRadius: 10,
    color: Colors.light.textFieldText,
    fontSize: 16,
  },
  calendarWrapper: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.buttonBorder,
  },
});

export default EditBook;
