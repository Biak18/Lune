import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FieldInput } from "@/components/ui/FieldInput";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Divider } from "@/components/ui/Divider";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { useLoginMutation, useGoogleAuthMutation } from "@/features/auth/hooks/useAuthMutations";
import { loginSchema, type LoginFormValues } from "@/utils/validation";
import { getAuthErrorMessage } from "@/utils/errors";
import { colors } from "@/design/colors";
import { env } from "@/config/env";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const login = useLoginMutation();
  const googleAuth = useGoogleAuthMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    setProviderError(null);
    login.mutate(values, {
      onSuccess: () => router.replace("/"),
    });
  };

  const handleGooglePress = () => {
    setProviderError(null);
    googleAuth.mutate(undefined, {
      onSuccess: () => router.replace("/"),
      onError: (e) => setProviderError(getAuthErrorMessage(e)),
    });
  };

  const googleError = googleAuth.isError ? getAuthErrorMessage(googleAuth.error) : null;
  const formError = login.isError ? getAuthErrorMessage(login.error) : null;
  const isEnvMissing = !env.isSupabaseConfigured();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={24}
        enableAutomaticScroll
      >
        <Animated.View entering={FadeInUp.duration(480).springify().damping(16)}>
          <AuthHeader
            title="Welcome back"
            subtitle="Sign in to continue your boutique experience."
          />
        </Animated.View>

        {isEnvMissing ? (
          <Animated.View entering={FadeInUp.delay(80).duration(420).springify()}>
            <View style={styles.envWarning}>
              <Text style={styles.envWarningText}>
                Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and
                EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env to enable authentication.
              </Text>
            </View>
          </Animated.View>
        ) : null}

        <View style={styles.form}>
        <Animated.View entering={FadeInUp.delay(100).duration(420).springify()}>
          <FormError message={providerError ?? googleError ?? formError} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(140).duration(420).springify()}>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldInput
                label="Email"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                editable={!login.isPending}
              />
            )}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(420).springify()}>
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldInput
                label="Password"
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                textContentType="password"
                autoComplete="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                editable={!login.isPending}
                rightElement={
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.toggle}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  >
                    <Text style={styles.toggleText}>{showPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                }
              />
            )}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260).duration(420).springify()}>
          <Link href="/auth/forgot-password" asChild>
            <Pressable style={styles.forgotLink}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </Link>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(320).duration(420).springify()}>
          <Button
            title="Sign in"
            onPress={handleSubmit(onSubmit)}
            loading={login.isPending}
            disabled={isEnvMissing}
            accessibilityLabel="Sign in"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(380).duration(420).springify()}>
          <Divider label="or" />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(440).duration(420).springify()}>
          <Button
            title="Continue with Google"
            variant="secondary"
            onPress={handleGooglePress}
            loading={googleAuth.isPending}
            disabled={isEnvMissing}
            style={styles.googleBtn}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(420).springify()} style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Link href="/auth/register" asChild>
            <Pressable>
              <Text style={styles.link}>Create account</Text>
            </Pressable>
          </Link>
        </Animated.View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  form: {
    gap: 16,
    paddingTop: 24,
  },
  toggle: {
    height: 36,
    paddingHorizontal: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    color: colors.muted,
  },
  forgotLink: {
    alignSelf: "flex-end",
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    color: colors.muted,
    textDecorationLine: "underline",
  },
  googleBtn: {
    borderColor: colors.border,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.muted,
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
    textDecorationLine: "underline",
  },
  envWarning: {
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: "#FFE082",
    borderRadius: 12,
    padding: 12,
  },
  envWarningText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#7A5C00",
  },
});
