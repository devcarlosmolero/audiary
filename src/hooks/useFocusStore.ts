import { create } from "zustand";

interface FocusStore {
  focusedRowId: string | null;
  setFocusedRowId: (rowId: string | null) => void;
}

export const useFocusStore = create<FocusStore>((set) => ({
  focusedRowId: null,
  setFocusedRowId: (rowId) => set({ focusedRowId: rowId }),
}));
