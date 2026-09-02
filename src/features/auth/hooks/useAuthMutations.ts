import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import type { LoginPayload, RegisterPayload, ResetPasswordPayload } from "../types";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.signIn(payload),
    onSuccess: () => {
      // Session will be updated via onAuthStateChange; invalidate any auth queries
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.signUp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
  });
}

export function useGoogleAuthMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.signInWithGoogle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}
