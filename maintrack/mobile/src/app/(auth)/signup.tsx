import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/lib/auth";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    const result = await signUp(email, password, name);
    setIsLoading(false);

    if (result.error) {
      Alert.alert("Error", result.error);
    }
  };

  const styles = createStyles(isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>MainTrack</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={isDark ? colors.muted.dark : colors.muted.light}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={isDark ? colors.muted.dark : colors.muted.light}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={isDark ? colors.muted.dark : colors.muted.light}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Creating account..." : "Create account"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      padding: spacing.lg,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    logo: {
      fontSize: fontSize["3xl"],
      fontWeight: "bold",
      color: colors.primary,
    },
    subtitle: {
      fontSize: fontSize.base,
      color: isDark ? colors.muted.dark : colors.muted.light,
      marginTop: spacing.sm,
    },
    form: {
      backgroundColor: isDark ? colors.card.dark : colors.card.light,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.border.dark : colors.border.light,
    },
    inputGroup: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: "500",
      color: isDark ? colors.text.dark : colors.text.light,
      marginBottom: spacing.xs,
    },
    input: {
      height: 48,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? colors.border.dark : colors.border.light,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      paddingHorizontal: spacing.md,
      fontSize: fontSize.base,
      color: isDark ? colors.text.dark : colors.text.light,
    },
    button: {
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginTop: spacing.md,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      fontSize: fontSize.base,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: spacing.lg,
    },
    footerText: {
      fontSize: fontSize.sm,
      color: isDark ? colors.muted.dark : colors.muted.light,
    },
    link: {
      fontSize: fontSize.sm,
      color: colors.primary,
      fontWeight: "500",
    },
  });
}
