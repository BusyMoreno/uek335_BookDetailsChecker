import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface Props {
  onSave: () => void;
  onCancel: () => void;
}

const FormActions: React.FC<Props> = ({ onSave, onCancel }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};
export default FormActions;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  saveButton: {
    backgroundColor: "#A89575",
    borderColor: "#69DE20",
    borderWidth: 2,
    padding: 15,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#A89575",
    borderColor: "#A60000",
    borderWidth: 2,
    padding: 15,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  saveText: {
    color: "#69DE20",
    fontWeight: "bold",
  },
  cancelText: {
    color: "#A60000",
    fontWeight: "bold",
  },
});
