import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { createBook } from "../../services/bookService";
import { api } from "../../services/api";
import FormActions from "../../components/FormActions";
import {
  getPublisherByName,
  createPublisher,
} from "../../services/publisherService";
import { getAuthorByName, createAuthor } from "../../services/authorService";
import {
  getLanguageByCode,
  createLanguage,
} from "../../services/languageService";
import { Calendar } from "react-native-calendars";
import { Button } from "react-native";

const CreateBook = () => {
  const [title, setTitle] = useState("");
  const [isbn13, setIsbn13] = useState("");
  const [pages, setPages] = useState("");
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [publisherName, setPublisherName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [languageName, setLanguageName] = useState("");

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (selectedDate) setReleaseDate(selectedDate);
  };

  const handleSave = async () => {
    const formattedDate = releaseDate
      ? releaseDate.toISOString().split("T")[0]
      : "";

    // check/create publisher
    const publishers = await getPublisherByName(publisherName);
    const publisherId = publishers.length
      ? publishers[0].id
      : (await createPublisher(publisherName)).id;

    // check/create author
    const authors = await getAuthorByName(authorName);
    const authorId = authors.length
      ? authors[0].id
      : (await createAuthor(authorName)).id;

    // check/create language
    const languages = await getLanguageByCode(languageName);
    const languageId = languages.length
      ? languages[0].id
      : (await createLanguage(languageName)).id;

    // create book
    const newBook = await createBook({
      title,
      isbn13,
      num_pages: Number(pages),
      publication_date: formattedDate,
      publisher_id: publisherId,
      language_id: languageId,
    });

    // connect book and author
    await api.post("/book_author", {
      book_id: newBook.id,
      author_id: authorId,
    });

    Alert.alert("Success", "Book saved");
  };

  const handleCancel = () => {
    setTitle("");
    setIsbn13("");
    setPages("");
    setReleaseDate(null);
    setPublisherName("");
    setAuthorName("");
    setLanguageName("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Create new Book</Text>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Book Details</Text>

        <FormInput label="Title" value={title} onChangeText={setTitle} />
        <FormInput label="ISBN13" value={isbn13} onChangeText={setIsbn13} />
        <FormInput
          label="Number of Pages"
          value={pages}
          onChangeText={setPages}
          keyboardType="numeric"
        />
        <View style={styles.calendarWrapper}>
          <Calendar
            onDayPress={(day) => {
              setReleaseDate(new Date(day.dateString));
            }}
            markedDates={{
              [releaseDate?.toISOString().split("T")[0] || ""]: {
                selected: true,
                selectedColor: "#E6D3AB",
              },
            }}
            theme={{
              backgroundColor: "#244937",
              calendarBackground: "#244937",
              textSectionTitleColor: "#E6D3AB",
              selectedDayBackgroundColor: "#E6D3AB",
              selectedDayTextColor: "#244937",
              todayTextColor: "#E6D3AB",
              dayTextColor: "#ffffff",
              arrowColor: "#E6D3AB",
              monthTextColor: "#ffffff",
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

        <FormActions onSave={handleSave} onCancel={handleCancel} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateBook;

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
}

const FormInput = ({
  label,
  value,
  onChangeText,
  keyboardType,
}: InputProps) => (
  <View style={{ marginBottom: 15 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#244937" },
  container: { padding: 25, paddingBottom: 100 },
  header: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  divider: { height: 1, backgroundColor: "#ccc", marginVertical: 10 },
  sectionTitle: { color: "white", fontSize: 18, marginBottom: 20 },
  label: { color: "#ddd", marginBottom: 6 },
  input: { backgroundColor: "#E6D3AB", padding: 14, borderRadius: 10 },
  calendarWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#244937",
    marginBottom: 20,
  },
});
