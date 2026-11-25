
import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { ShoppingProvider } from "./src/context/ShoppingContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <ShoppingProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ShoppingProvider>
  );
}
