
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BudgetScreen from "../screens/BudgetScreen";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import OptimizationScreen from "../screens/OptimizationScreen";

export type RootStackParamList = {
  Budget: undefined;
  ShoppingList: undefined;
  Optimization: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Budget"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right"
      }}
    >
      <Stack.Screen name="Budget" component={BudgetScreen} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
      <Stack.Screen name="Optimization" component={OptimizationScreen} />
    </Stack.Navigator>
  );
}
