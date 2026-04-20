import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toastQueue: [],
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast(state, action) {
      const { message, type } = action.payload;
      state.toastQueue.push({ id: Date.now().toString(), message, type });
    },
    removeToast(state, action) {
      state.toastQueue = state.toastQueue.filter((t) => t.id !== action.payload);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { addToast, removeToast, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
