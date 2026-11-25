
import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useShopping } from "../context/ShoppingContext";
import { optimizeBasket } from "../services/optimizationService";
import { ShoppingItem } from "../models/ShoppingItem";

type Props = NativeStackScreenProps<RootStackParamList, "Optimization">;

const COLORS = {
  green: "#557A60",
  dark: "#243B2D",
  cream: "#F7F6EF",
  white: "#FFFFFF",
  muted: "#899189",
  red: "#C34848",
  lightGreen: "#E4EDE4",
  lightRed: "#F6E6E2"
};

function formatPrice(value: number): string {
  return `${(value / 1000).toFixed(3)} DT`;
}

function ProductRow({
  item,
  removed = false
}: {
  item: ShoppingItem;
  removed?: boolean;
}) {
  return (
    <View style={styles.productRow}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>

        <Text style={styles.productDetails}>
          {formatPrice(item.price)} × {item.quantity}
        </Text>
      </View>

      <View style={styles.productPrice}>
        <Text style={styles.productSubtotal}>
          {formatPrice(item.price * item.quantity)}
        </Text>

        <Text style={styles.productStatus}>
          {removed ? "À retirer" : "À conserver"}
        </Text>
      </View>
    </View>
  );
}

export default function OptimizationScreen({ navigation }: Props) {
  const { budget, items } = useShopping();

  const result = useMemo(
    () => optimizeBasket(items, budget),
    [items, budget]
  );

  const pendingItems = items.filter(item => !item.purchased);

  const essentialTotal = pendingItems
    .filter(item => item.priority === "essential")
    .reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

  const essentialsOverBudget =
    budget > 0 && essentialTotal > budget;

  const noBudget = budget <= 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Retour à la liste de courses</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Optimisation intelligente</Text>

      <Text style={styles.subtitle}>
        Chaque dinar compte. Voici votre panier optimisé.
      </Text>

      {noBudget ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Budget non défini</Text>

          <Text style={styles.warningText}>
            Veuillez retourner au tableau de bord et saisir un budget
            valide avant d'optimiser votre panier.
          </Text>

          <TouchableOpacity
            style={styles.warningButton}
            onPress={() => navigation.navigate("Budget")}
          >
            <Text style={styles.warningButtonText}>
              Définir mon budget
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              VOTRE PANIER OPTIMISÉ
            </Text>

            <Text style={styles.summaryAmount}>
              {formatPrice(result.total)}
            </Text>

            <Text style={styles.summaryDescription}>
              Sur un budget de {formatPrice(budget)}
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      (result.total / budget) * 100,
                      100
                    )}%`
                  }
                ]}
              />
            </View>

            <View style={styles.summaryStats}>
              <View>
                <Text style={styles.summaryStatLabel}>
                  Budget restant
                </Text>

                <Text style={styles.summaryStatValue}>
                  {formatPrice(result.remaining)}
                </Text>
              </View>

              <View>
                <Text style={styles.summaryStatLabel}>
                  Articles conservés
                </Text>

                <Text style={styles.summaryStatValue}>
                  {result.selectedItems.length}
                </Text>
              </View>

              <View>
                <Text style={styles.summaryStatLabel}>
                  À retirer
                </Text>

                <Text style={styles.summaryStatValue}>
                  {result.removedItems.length}
                </Text>
              </View>
            </View>
          </View>

          {essentialsOverBudget && (
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>
                Attention : vos articles essentiels dépassent votre budget !
              </Text>

              <Text style={styles.warningText}>
                Le coût de vos articles essentiels est de{" "}
                {formatPrice(essentialTotal)}, alors que votre budget
                est de {formatPrice(budget)}.
                Envisagez d'augmenter votre budget ou de revoir les
                prix et les quantités de ces articles.
              </Text>
            </View>
          )}

          {pendingItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                Votre panier est vide
              </Text>

              <Text style={styles.emptyText}>
                Ajoutez des articles à votre liste de courses pour
                obtenir des suggestions d'optimisation.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    ✓ Articles à conserver
                  </Text>

                  <Text style={styles.count}>
                    {result.selectedItems.length}
                  </Text>
                </View>

                <Text style={styles.sectionDescription}>
                  Ces articles respectent votre budget disponible.
                </Text>

                {result.selectedItems.length === 0 ? (
                  <Text style={styles.emptyText}>
                    Aucun article ne peut actuellement être inclus
                    dans votre budget.
                  </Text>
                ) : (
                  result.selectedItems.map(item => (
                    <ProductRow key={item.id} item={item} />
                  ))
                )}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    Total des articles conservés
                  </Text>

                  <Text style={styles.totalValue}>
                    {formatPrice(result.total)}
                  </Text>
                </View>
              </View>

              <View style={styles.removedCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.removedTitle}>
                    ✕ Articles à reconsidérer
                  </Text>

                  <Text style={styles.removedCount}>
                    {result.removedItems.length}
                  </Text>
                </View>

                <Text style={styles.sectionDescription}>
                  Selon notre règle de priorité, ces articles ne
                  rentrent pas dans le budget restant.
                </Text>

                {result.removedItems.length === 0 ? (
                  <Text style={styles.emptyText}>
                    Excellent ! Tous vos articles respectent votre budget.
                  </Text>
                ) : (
                  result.removedItems.map(item => (
                    <ProductRow
                      key={item.id}
                      item={item}
                      removed
                    />
                  ))
                )}
              </View>
            </>
          )}

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>
              💡 Comment fonctionne l'optimisation ?
            </Text>

            <Text style={styles.tipText}>
              1. Les articles essentiels sont prioritaires.
            </Text>

            <Text style={styles.tipText}>
              2. Les articles utiles sont considérés ensuite.
            </Text>

            <Text style={styles.tipText}>
              3. Les articles de confort sont considérés en dernier.
            </Text>

            <Text style={styles.tipText}>
              4. Pour chaque priorité, les articles les moins chers
              sont sélectionnés en premier.
            </Text>

            <Text style={styles.tipFootnote}>
              Cette méthode utilise un algorithme glouton fondé sur
              les priorités. Elle ne garantit pas la combinaison
              globalement la moins chère.
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("ShoppingList")}
      >
        <Text style={styles.primaryButtonText}>
          Retour à ma liste de courses →
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Budget")}
      >
        <Text style={styles.secondaryButtonText}>
          Retour au tableau de bord
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream
  },
  content: {
    padding: 22,
    paddingTop: 45,
    paddingBottom: 45
  },
  back: {
    color: COLORS.green,
    fontWeight: "600",
    marginBottom: 22
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.dark
  },
  subtitle: {
    color: COLORS.muted,
    marginTop: 7,
    marginBottom: 23
  },
  summaryCard: {
    backgroundColor: COLORS.green,
    borderRadius: 20,
    padding: 22,
    marginBottom: 20
  },
  summaryLabel: {
    color: "#E4EDE4",
    fontSize: 11,
    letterSpacing: 1.3
  },
  summaryAmount: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: "800",
    marginTop: 13
  },
  summaryDescription: {
    color: "#E4EDE4",
    fontSize: 12,
    marginTop: 5
  },
  progressBackground: {
    height: 8,
    backgroundColor: "#A8BDAA",
    borderRadius: 10,
    marginTop: 20,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 10
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22
  },
  summaryStatLabel: {
    color: "#E4EDE4",
    fontSize: 11
  },
  summaryStatValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 18,
    marginBottom: 15
  },
  removedCard: {
    backgroundColor: "#FFF9F7",
    borderColor: "#F0DAD4",
    borderWidth: 1,
    borderRadius: 17,
    padding: 18,
    marginBottom: 15
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: COLORS.dark,
    fontSize: 17,
    fontWeight: "800"
  },
  removedTitle: {
    color: COLORS.red,
    fontSize: 16,
    fontWeight: "800"
  },
  count: {
    color: COLORS.green,
    fontWeight: "800",
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20
  },
  removedCount: {
    color: COLORS.red,
    fontWeight: "800",
    backgroundColor: COLORS.lightRed,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20
  },
  sectionDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
    marginBottom: 12
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cream
  },
  productInfo: {
    flex: 1
  },
  productName: {
    color: COLORS.dark,
    fontWeight: "700",
    fontSize: 14
  },
  productDetails: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5
  },
  productPrice: {
    alignItems: "flex-end"
  },
  productSubtotal: {
    color: COLORS.dark,
    fontWeight: "800",
    fontSize: 13
  },
  productStatus: {
    color: COLORS.green,
    fontSize: 10,
    marginTop: 4
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 17,
    gap: 8
  },
  totalLabel: {
    color: COLORS.dark,
    fontWeight: "700",
    flex: 1
  },
  totalValue: {
    color: COLORS.green,
    fontWeight: "800",
    fontSize: 16
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 16,
    marginBottom: 15
  },
  emptyTitle: {
    color: COLORS.dark,
    fontSize: 17,
    fontWeight: "700"
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 20
  },
  warningCard: {
    backgroundColor: COLORS.lightRed,
    borderRadius: 15,
    padding: 18,
    marginBottom: 18
  },
  warningTitle: {
    color: COLORS.red,
    fontSize: 16,
    fontWeight: "800"
  },
  warningText: {
    color: "#754A43",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8
  },
  warningButton: {
    backgroundColor: COLORS.red,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15
  },
  warningButtonText: {
    color: COLORS.white,
    fontWeight: "700"
  },
  tipCard: {
    backgroundColor: "#EDF1E9",
    borderRadius: 16,
    padding: 19,
    marginTop: 5,
    marginBottom: 20
  },
  tipTitle: {
    color: COLORS.dark,
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 12
  },
  tipText: {
    color: COLORS.dark,
    fontSize: 12,
    lineHeight: 21
  },
  tipFootnote: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12
  },
  primaryButton: {
    backgroundColor: COLORS.dark,
    padding: 16,
    borderRadius: 13,
    alignItems: "center"
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: "700"
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.green,
    padding: 15,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 10
  },
  secondaryButtonText: {
    color: COLORS.green,
    fontWeight: "700"
  }
});
