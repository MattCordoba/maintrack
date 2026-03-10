import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";

// TODO: Fetch actual data from API
const mockData = {
  taskCounts: {
    overdue: 3,
    dueSoon: 5,
    scheduled: 12,
    total: 20,
  },
  overdueTasks: [
    { id: "1", title: "Oil Change", assetName: "Honda Civic", daysOverdue: 5 },
    { id: "2", title: "Tire Rotation", assetName: "Honda Civic", daysOverdue: 2 },
  ],
  dueSoonTasks: [
    { id: "3", title: "Change Furnace Filter", assetName: "House", daysUntil: 3 },
  ],
};

export default function HomeScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Refresh data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const styles = createStyles(isDark);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          {getGreeting()}, {user?.user_metadata?.name || "there"}
        </Text>
        <Text style={styles.subtitle}>
          {mockData.taskCounts.overdue > 0
            ? `You have ${mockData.taskCounts.overdue} overdue task${mockData.taskCounts.overdue > 1 ? "s" : ""}`
            : "All caught up on maintenance!"}
        </Text>
      </View>

      {/* Task Overview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Task Overview</Text>
        <View style={styles.statsRow}>
          <StatBadge
            label="Overdue"
            count={mockData.taskCounts.overdue}
            color={colors.overdue}
            isDark={isDark}
          />
          <StatBadge
            label="Due Soon"
            count={mockData.taskCounts.dueSoon}
            color={colors.dueSoon}
            isDark={isDark}
          />
          <StatBadge
            label="Scheduled"
            count={mockData.taskCounts.scheduled}
            color={colors.scheduled}
            isDark={isDark}
          />
        </View>
      </View>

      {/* Overdue Tasks */}
      {mockData.overdueTasks.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="warning" size={20} color={colors.overdue} />
              <Text style={styles.cardTitle}>Overdue</Text>
            </View>
            <Link href="/tasks?status=overdue" asChild>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </Link>
          </View>
          {mockData.overdueTasks.map((task) => (
            <Link key={task.id} href={`/tasks/${task.id}`} asChild>
              <TouchableOpacity style={styles.taskItem}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskSubtitle}>{task.assetName}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.overdue }]}>
                  <Text style={styles.badgeText}>{task.daysOverdue}d overdue</Text>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      )}

      {/* Due Soon Tasks */}
      {mockData.dueSoonTasks.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="time" size={20} color={colors.dueSoon} />
              <Text style={styles.cardTitle}>Due Soon</Text>
            </View>
            <Link href="/tasks?status=due_soon" asChild>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </Link>
          </View>
          {mockData.dueSoonTasks.map((task) => (
            <Link key={task.id} href={`/tasks/${task.id}`} asChild>
              <TouchableOpacity style={styles.taskItem}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskSubtitle}>{task.assetName}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.dueSoon }]}>
                  <Text style={styles.badgeText}>{task.daysUntil}d</Text>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatBadge({
  label,
  count,
  color,
  isDark,
}: {
  label: string;
  count: number;
  color: string;
  isDark: boolean;
}) {
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: color,
          marginBottom: 4,
        }}
      />
      <Text
        style={{
          fontSize: fontSize.xl,
          fontWeight: "bold",
          color: isDark ? colors.text.dark : colors.text.light,
        }}
      >
        {count}
      </Text>
      <Text
        style={{
          fontSize: fontSize.sm,
          color: isDark ? colors.muted.dark : colors.muted.light,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    greeting: {
      marginBottom: spacing.lg,
    },
    greetingText: {
      fontSize: fontSize["2xl"],
      fontWeight: "bold",
      color: isDark ? colors.text.dark : colors.text.light,
    },
    subtitle: {
      fontSize: fontSize.base,
      color: isDark ? colors.muted.dark : colors.muted.light,
      marginTop: spacing.xs,
    },
    card: {
      backgroundColor: isDark ? colors.card.dark : colors.card.light,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: isDark ? colors.border.dark : colors.border.light,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    cardTitle: {
      fontSize: fontSize.lg,
      fontWeight: "600",
      color: isDark ? colors.text.dark : colors.text.light,
    },
    viewAll: {
      fontSize: fontSize.sm,
      color: colors.primary,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: spacing.md,
    },
    taskItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: isDark ? colors.border.dark : colors.border.light,
    },
    taskInfo: {
      flex: 1,
    },
    taskTitle: {
      fontSize: fontSize.base,
      fontWeight: "500",
      color: isDark ? colors.text.dark : colors.text.light,
    },
    taskSubtitle: {
      fontSize: fontSize.sm,
      color: isDark ? colors.muted.dark : colors.muted.light,
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    badgeText: {
      fontSize: fontSize.xs,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });
}
