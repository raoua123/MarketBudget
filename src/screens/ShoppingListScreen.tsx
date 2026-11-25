
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useShopping } from "../context/ShoppingContext";
import { Priority, ShoppingItem } from "../models/ShoppingItem";
import { validateItem } from "../utils/validation";

type Props = NativeStackScreenProps<RootStackParamList, "ShoppingList">;

const COLORS = {
  green: "#557A60",
  dark: "#243B2D",
  cream: "#F7F6EF",
  white: "#FFFFFF",
  muted: "#899189",
  border: "#E6E9E2",
  red: "#C34848"
};

const priorityLabels: Record<Priority, string> = {
  essential: "Essentiel",
  useful: "Utile",
  comfort: "Confort"
};

const priorityColors: Record<Priority, string> = {
  essential: "#DCEBDD",
  useful: "#F5EACB",
  comfort: "#F4DFDA"
};

export default function ShoppingListScreen({ navigation }: Props) {
  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    togglePurchased
  } = useShopping();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [priority, setPriority] = useState<Priority>("essential");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const total = items
    .filter(item => !item.purchased)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && !item.purchased) ||
        (filter === "purchased" && item.purchased) ||
        item.priority === filter;

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  function resetForm() {
    setName("");
    setPrice("");
    setQuantity("1");
    setPriority("essential");
    setEditingId(null);
    setError("");
  }

  function handleSave() {
    const existingNames = items
      .filter(item => item.id !== editingId)
      .map(item => item.name);

    const validation = validateItem(
      name,
      price,
      quantity,
      existingNames
    );

    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    const newItem: ShoppingItem = {
      id: editingId ?? `${Date.now()}-${Math.random()}`,
      name: name.trim(),
      price: Math.round(
        Number(price.replace(",", ".")) * 1000
      ),
      quantity: Number(quantity),
      priority,
      purchased: editingId
        ? items.find(item => item.id === editingId)?.purchased ?? false
        : false
    };

    if (editingId) {
      updateItem(newItem);
    } else {
      addItem(newItem);
    }

    resetForm();
  }

  function handleEdit(item: ShoppingItem) {
    setEditingId(item.id);
    setName(item.name);
    setPrice((item.price / 1000).toFixed(3));
    setQuantity(String(item.quantity));
    setPriority(item.priority);
    setError("");
  }

  function handleDelete(id: string) {
    const item = items.find(product => product.id === id);

    if (!item) return;

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Voulez-vous supprimer "${item.name}" de votre liste de courses ?`
      );

      if (confirmed) {
        deleteItem(id);

        if (editingId === id) {
          resetForm();
        }
      }
    } else {
      Alert.alert(
        "Supprimer l'article",
        `Voulez-vous supprimer "${item.name}" de votre liste de courses ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: () => {
              deleteItem(id);

              if (editingId === id) {
                resetForm();
              }
            }
          }
        ]
      );
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Retour au tableau de bord</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ma liste de courses</Text>

      <Text style={styles.subtitle}>
        Chaque article, chaque dinar : tout est maîtrisé.
      </Text>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>TOTAL ACTUEL DU PANIER</Text>

        <Text style={styles.totalValue}>
          {(total / 1000).toFixed(3)} DT
        </Text>

        <Text style={styles.totalHint}>
          {items.filter(item => !item.purchased).length} articles à acheter
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {editingId ? "Modifier l'article" : "Ajouter un article"}
        </Text>

        <Text style={styles.fieldLabel}>NOM DE L'ARTICLE</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex. : Lait, Pain, Œufs..."
          value={name}
          onChangeText={value => {
            setName(value);
            setError("");
          }}
        />

        <View style={styles.fieldsRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.fieldLabel}>PRIX (DT)</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex. : 2,500"
              value={price}
              onChangeText={value => {
                setPrice(value);
                setError("");
              }}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.fieldHalf}>
            <Text style={styles.fieldLabel}>QUANTITÉ</Text>

            <TextInput
              style={styles.input}
              placeholder="1"
              value={quantity}
              onChangeText={value => {
                setQuantity(value);
                setError("");
              }}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>PRIORITÉ DE L'ARTICLE</Text>

        <View style={styles.priorityRow}>
          {(["essential", "useful", "comfort"] as Priority[]).map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => setPriority(option)}
              style={[
                styles.priorityButton,
                { backgroundColor: priorityColors[option] },
                priority === option && styles.prioritySelected
              ]}
            >
              <Text style={styles.priorityText}>
                {priorityLabels[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.formActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSave}
          >
            <Text style={styles.addButtonText}>
              {editingId
                ? "Enregistrer les modifications"
                : "+ Ajouter l'article"}
            </Text>
          </TouchableOpacity>

          {editingId ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetForm}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Text style={styles.listTitle}>
        Vos articles ({items.length})
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un article..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
      >
        {[
          { key: "all", label: "Tous" },
          { key: "pending", label: "À acheter" },
          { key: "purchased", label: "Achetés" },
          { key: "essential", label: "Essentiels" },
          { key: "useful", label: "Utiles" },
          { key: "comfort", label: "Confort" }
        ].map(option => (
          <TouchableOpacity
            key={option.key}
            onPress={() => setFilter(option.key)}
            style={[
              styles.filterButton,
              filter === option.key && styles.activeFilter
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === option.key && styles.activeFilterText
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🛒</Text>

          <Text style={styles.emptyTitle}>
            {items.length === 0
              ? "Votre liste est vide"
              : "Aucun article trouvé"}
          </Text>

          <Text style={styles.emptyText}>
            {items.length === 0
              ? "Ajoutez votre premier article pour commencer à préparer votre panier."
              : "Essayez de modifier votre recherche ou votre filtre."}
          </Text>
        </View>
      ) : (
        filteredItems.map(item => (
          <View
            key={item.id}
            style={[
              styles.productCard,
              item.purchased && styles.purchasedCard
            ]}
          >
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text
                  style={[
                    styles.productName,
                    item.purchased && styles.striked
                  ]}
                >
                  {item.name}
                </Text>

                <Text style={styles.productDetails}>
                  {(item.price / 1000).toFixed(3)} DT × {item.quantity}
                  {"  ·  "}
                  {(item.price * item.quantity / 1000).toFixed(3)} DT
                </Text>
              </View>

              <View
                style={[
                  styles.badge,
                  { backgroundColor: priorityColors[item.priority] }
                ]}
              >
                <Text style={styles.badgeText}>
                  {priorityLabels[item.priority]}
                </Text>
              </View>
            </View>

            <View style={styles.productActions}>
              <TouchableOpacity
                onPress={() => togglePurchased(item.id)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>
                  {item.purchased ? "↩ Annuler l'achat" : "✓ Acheté"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.actionButton}
              >
                <Text style={styles.deleteText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.optimizeButton}
        onPress={() => navigation.navigate("Optimization")}
      >
        <Text style={styles.optimizeText}>
          Optimiser mon panier →
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: 22, paddingTop: 45, paddingBottom: 45 },
  back: { color: COLORS.green, fontWeight: "600", marginBottom: 22 },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.dark },
  subtitle: { color: COLORS.muted, marginTop: 7, marginBottom: 22 },
  totalCard: {
    backgroundColor: COLORS.green,
    borderRadius: 20,
    padding: 22,
    marginBottom: 25
  },
  totalLabel: { color: "#E4EDE4", fontSize: 11, letterSpacing: 1.3 },
  totalValue: { color: COLORS.white, fontSize: 31, fontWeight: "800", marginTop: 10 },
  totalHint: { color: "#E4EDE4", marginTop: 7, fontSize: 12 },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 19,
    marginBottom: 28
  },
  formTitle: { color: COLORS.dark, fontSize: 19, fontWeight: "700", marginBottom: 20 },
  fieldLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 8, marginTop: 10 },
  input: {
    backgroundColor: "#F8F9F5",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    padding: 13,
    color: COLORS.dark,
    fontSize: 14
  },
  fieldsRow: { flexDirection: "row", gap: 12 },
  fieldHalf: { flex: 1 },
  priorityRow: { flexDirection: "row", gap: 7, marginTop: 5 },
  priorityButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent"
  },
  prioritySelected: { borderColor: COLORS.green, borderWidth: 2 },
  priorityText: { color: COLORS.dark, fontSize: 10, fontWeight: "700" },
  error: { color: COLORS.red, fontSize: 12, marginTop: 12 },
  formActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.dark,
    padding: 15,
    borderRadius: 11,
    alignItems: "center"
  },
  addButtonText: { color: COLORS.white, fontWeight: "700" },
  cancelButton: {
    padding: 15,
    borderRadius: 11,
    backgroundColor: "#F0F1EB",
    justifyContent: "center"
  },
  cancelText: { color: COLORS.dark, fontWeight: "600" },
  listTitle: { color: COLORS.dark, fontSize: 20, fontWeight: "800", marginBottom: 14 },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 12
  },
  filters: { marginBottom: 15, flexGrow: 0 },
  filterButton: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 7
  },
  activeFilter: { backgroundColor: COLORS.dark },
  filterText: { color: COLORS.muted, fontSize: 12, fontWeight: "600" },
  activeFilterText: { color: COLORS.white },
  emptyCard: {
    backgroundColor: COLORS.white,
    padding: 28,
    borderRadius: 16,
    alignItems: "center"
  },
  emptyEmoji: { fontSize: 35 },
  emptyTitle: { color: COLORS.dark, fontSize: 17, fontWeight: "700", marginTop: 12 },
  emptyText: { color: COLORS.muted, textAlign: "center", marginTop: 7, lineHeight: 20 },
  productCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  purchasedCard: { opacity: 0.65 },
  productHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  productInfo: { flex: 1 },
  productName: { color: COLORS.dark, fontSize: 16, fontWeight: "700" },
  striked: { textDecorationLine: "line-through" },
  productDetails: { color: COLORS.muted, fontSize: 12, marginTop: 7 },
  badge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  badgeText: { color: COLORS.dark, fontSize: 10, fontWeight: "700" },
  productActions: { flexDirection: "row", gap: 15, marginTop: 17, flexWrap: "wrap" },
  actionButton: { paddingVertical: 5 },
  actionText: { color: COLORS.green, fontSize: 12, fontWeight: "700" },
  deleteText: { color: COLORS.red, fontSize: 12, fontWeight: "700" },
  optimizeButton: {
    backgroundColor: COLORS.green,
    borderRadius: 13,
    padding: 17,
    alignItems: "center",
    marginTop: 18
  },
  optimizeText: { color: COLORS.white, fontWeight: "700", fontSize: 15 }
});
