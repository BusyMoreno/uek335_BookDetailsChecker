import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.textLight,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="StartingPage"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="LoginPage"
        options={{
          title: "Login",
        }}
      />
      <Tabs.Screen
        name="RegisterPage"
        options={{
          title: "Register",
        }}
      />
      <Tabs.Screen
        name="BookListPage"
        options={{
          title: "Book List",
        }}
      />
    </Tabs>
  );
}
