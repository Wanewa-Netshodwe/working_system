import { createSlice } from "@reduxjs/toolkit";

type appState = {
  clock_out_modal_open: boolean;
};

const initialState: appState = {
  clock_out_modal_open: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAppDetails: (state, action) => {
      state.clock_out_modal_open = action.payload;
    },
  },
});

// Export the actions
export const { setAppDetails } = appSlice.actions;

// Export the reducer to be added to the store
export default appSlice.reducer;
