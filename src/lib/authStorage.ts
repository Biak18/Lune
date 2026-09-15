import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "dressshop.accessToken";
const REFRESH_TOKEN_KEY = "dressshop.refreshToken";

export const authStorage = {
  async saveTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  async getTokens() {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  },

  async clearTokens() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};
