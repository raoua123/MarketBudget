
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useShopping } from "../context/ShoppingContext";
import { validateBudget } from "../utils/validation";

type Props = NativeStackScreenProps<RootStackParamList, "Budget">;

const GREEN = "#557A60";
const DARK = "#243B2D";
const CREAM = "#F7F6EF";

export default function BudgetScreen({ navigation }: Props) {
  const { budget, items, setBudget, loading } = useShopping();

  const [budgetInput, setBudgetInput] = useState(
    budget > 0 ? (budget / 1000).toFixed(3) : ""
  );

  const [error, setError] = useState("");

  const total = items
    .filter(item => !item.purchased)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const remaining = budget - total;
  const progress = budget > 0 ? Math.min(total / budget, 1) : 0;

  function handleBudget() {
    const result = validateBudget(budgetInput);

    if (!result.valid) {
      setError(result.message);
      return;
    }

    setBudget(
      Math.round(Number(budgetInput.replace(",", ".")) * 1000)
    );

    setError("");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Chargement de MarketBudget...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.brand}>MarketBudget.</Text>

      <Text style={styles.subtitle}>
        VOTRE COMPAGNON DE COURSES INTELLIGENT
      </Text>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>VOTRE BUDGET DE COURSES</Text>

        <Text style={styles.heroAmount}>
          {(budget / 1000).toFixed(3)} DT
        </Text>

        <Text style={styles.heroDescription}>
          Dépensez mieux. Économisez intelligemment.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Définir votre budget</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Montant en DT"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
          value={budgetInput}
          onChangeText={value => {
            setBudgetInput(value);
            setError("");
          }}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleBudget}
        >
          <Text style={styles.saveText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total du panier</Text>
          <Text style={styles.statValue}>
            {(total / 1000).toFixed(3)} DT
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Budget restant</Text>
          <Text
            style={[
              styles.statValue,
              remaining < 0 && styles.error
            ]}
          >
            {(remaining / 1000).toFixed(3)} DT
          </Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>
            Utilisation du budget
          </Text>

          <Text style={styles.percentage}>
            {Math.round(progress * 100)} %
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` }
            ]}
          />
        </View>

        <Text style={styles.muted}>
          {total > budget && budget > 0
            ? "Attention ! Votre panier dépasse votre budget."
            : "Gardez le contrôle de vos dépenses."}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("ShoppingList")}
      >
        <Text style={styles.primaryText}>
          Ma liste de courses →
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Optimization")}
      >
        <Text style={styles.secondaryText}>
          Optimiser mon panier ✨
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  content: { padding: 24, paddingTop: 55, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { color: DARK },
  brand: { fontSize: 30, fontWeight: "800", color: DARK },
  subtitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: GREEN,
    marginTop: 5
  },
  hero: {
    backgroundColor: GREEN,
    borderRadius: 22,
    padding: 25,
    marginTop: 30,
    marginBottom: 30
  },
  heroLabel: { color: "#E4EDE4", fontSize: 11, letterSpacing: 1.5 },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 15
  },
  heroDescription: { color: "#E4EDE4", marginTop: 8 },
  sectionTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12
  },
  inputRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 15
  },
  saveButton: {
    backgroundColor: DARK,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 18
  },
  saveText: { color: "#FFFFFF", fontWeight: "700" },
  error: { color: "#C34848", marginTop: 8 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 25 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17
  },
  statLabel: { color: "#7D897D", fontSize: 12 },
  statValue: {
    color: DARK,
    fontSize: 19,
    fontWeight: "700",
    marginTop: 10
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  percentage: { color: GREEN, fontWeight: "700" },
  progressBackground: {
    height: 9,
    backgroundColor: "#E9EDE7",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 12
  },
  progressFill: {
    height: "100%",
    backgroundColor: GREEN,
    borderRadius: 10
  },
  muted: { color: "#899189", fontSize: 12 },
  primaryButton: {
    backgroundColor: DARK,
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 25
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: GREEN,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12
  },
  secondaryText: { color: GREEN, fontWeight: "700" }
});
