import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const styles = createStyles(isDark);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.user_metadata?.name?.[0]?.toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.name}>{user?.user_metadata?.name || "User"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Settings */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons
            name="moon-outline"
            size={22}
            color={isDark ? colors.text.dark : colors.text.light}
          />
          <Text style={styles.settingText}>Appearance</Text>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={isDark ? colors.muted.dark : colors.muted.light}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={isDark ? colors.text.dark : colors.text.light}
          />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={isDark ? colors.muted.dark : colors.muted.light}
          />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutContent}>
          <Text style={styles.appName}>MainTrack</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
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
    card: {
      backgroundColor: isDark ? colors.card.dark : colors.card.light,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: isDark ? colors.border.dark : colors.border.light,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginBottom: spacing.md,
    },
    avatarText: {
      fontSize: fontSize["3xl"],
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    name: {
      fontSize: fontSize.xl,
      fontWeight: "bold",
      color: isDark ? colors.text.dark : colors.text.light,
      textAlign: "center",
    },
    email: {
      fontSize: fontSize.base,
      color: isDark ? colors.muted.dark : colors.muted.light,
      textAlign: "center",
      marginTop: spacing.xs,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: "600",
      color: isDark ? colors.text.dark : colors.text.light,
      marginBottom: spacing.md,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: isDark ? colors.border.dark : colors.border.light,
    },
    settingText: {
      flex: 1,
      fontSize: fontSize.base,
      color: isDark ? colors.text.dark : colors.text.light,
      marginLeft: spacing.md,
    },
    aboutContent: {
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    appName: {
      fontSize: fontSize.xl,
      fontWeight: "bold",
      color: colors.primary,
    },
    version: {
      fontSize: fontSize.sm,
      color: isDark ? colors.muted.dark : colors.muted.light,
      marginTop: spacing.xs,
    },
    signOutButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.overdue,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    signOutText: {
      fontSize: fontSize.base,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });
}
