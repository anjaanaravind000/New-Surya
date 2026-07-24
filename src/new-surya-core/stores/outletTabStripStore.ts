import { create } from 'zustand';

interface PrimaryOutletTabStripState {
  expanded: boolean;
  toggle: () => void;
  collapse: () => void;
}

// Lightweight, non-persisted UI toggle shared between Header.tsx (the button)
// and BranchOperationsModule.tsx (the tab strip it shows/hides). Kept in its own
// store since the two components don't otherwise share a parent that can
// hold this state.
export const useOutletTabStripStore = create<PrimaryOutletTabStripState>((set) => ({
  expanded: false,
  toggle: () => set((s) => ({ expanded: !s.expanded })),
  collapse: () => set({ expanded: false }),
}));
