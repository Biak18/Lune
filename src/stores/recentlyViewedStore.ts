import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type State = {
  ids: string[];
  add: (id: string) => void;
  clear: () => void;
};

export const useRecentlyViewedStore = create<State>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id: string) => {
        const cur = get().ids;
        const next = [id, ...cur.filter((x) => x !== id)].slice(0, 20);
        set({ ids: next });
      },
      clear: () => set({ ids: [] }),
    }),
    {
      name: "recently-viewed",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
