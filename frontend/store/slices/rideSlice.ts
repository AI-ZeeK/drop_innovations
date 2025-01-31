import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Ride {
  ride_id: number;
  pickup_location: string;
  dropoff_location: string;
  car_type: string;
  fare: number;
  status: string;
  created_at: string;
}

interface RideState {
  rides: Ride[];
  loading: boolean;
  error: string | null;
}

const initialState: RideState = {
  rides: [],
  loading: false,
  error: null,
};

const rideSlice = createSlice({
  name: "rides",
  initialState,
  reducers: {
    setRides: (state, action: PayloadAction<Ride[]>) => {
      state.rides = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setRides, setLoading, setError } = rideSlice.actions;
export default rideSlice.reducer;
