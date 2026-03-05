import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useFocusEffect } from "expo-router";
import { Colors } from "../../constants/theme";
import FormActions from "../../components/FormActions";
import { useBookForm } from "../../hooks/useBookForm";
import {
  FormInput,
  DatePicker,
  FormContainer,
} from "../../components/FormComponents";

/**
 * CreateBook page component
 * Allows users to create a new book with form validation
 *
 * All business logic is handled by the useBookForm hook
 * This component only handles UI rendering and user interactions
 *
 * @component
 * @returns {React.ReactElement} The create book page
 */
const CreateBook = () => {
  const {
    formData,
    handleFieldChange,
    handleSave,
    resetForm,
    getErrorForField,
  } = useBookForm("create");

  // Reset form when navigating away from this page
  useFocusEffect(
    React.useCallback(() => {
      return () => resetForm();
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Create new Book</Text>
        <Text style={styles.sectionTitle}>Book Details</Text>

        <FormContainer>
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

          <DatePicker
            label="Publication Date"
            value={formData.releaseDate}
            onChange={(date) => handleFieldChange("releaseDate", date)}
            error={getErrorForField("releaseDate")}
          />

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
        </FormContainer>

        <FormActions onSave={handleSave} onCancel={resetForm} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    padding: 25,
    paddingBottom: 100,
  },
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
});

export default CreateBook;
