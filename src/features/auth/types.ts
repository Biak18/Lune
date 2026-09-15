/**
 * Auth DTOs matching DressShop.Api (Clean Architecture + MediatR).
 * Backend: POST /auth/login, POST /auth/refresh -> AuthResult.
 * ASP.NET serializes to camelCase: { accessToken, refreshToken, expiresIn }.
 */

export type AuthResultDto = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthProfileDto = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName?: string;
};

export type ResetPasswordPayload = {
  email: string;
};
