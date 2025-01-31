import { apiSlice } from "./apiSlice";

interface Ride {
  ride_id: number;
  user_id: number;
  pickup_location: string;
  dropoff_location: string;
  car_type: "STANDARD" | "PREMIUM" | "LUXURY";
  fare: number;
  status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
}

interface GetRidesParams {
  status?: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "fare";
  sortOrder?: "asc" | "desc";
}

interface GetRidesResponse {
  rides: Ride[];
  total: number;
  page: number;
  totalPages: number;
}

export const ridesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRides: builder.query<GetRidesResponse, GetRidesParams>({
      query: (params) => ({
        url: "/rides",
        method: "GET",
        params: {
          status: params?.status,
          page: params?.page,
          limit: params?.limit,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
      providesTags: ["Rides"],
    }),
    seedRides: builder.mutation<any, void>({
      query: () => ({
        url: "/rides/seed",
        method: "POST",
      }),
      invalidatesTags: ["Rides"],
    }),
  }),
});

export const { useGetRidesQuery, useSeedRidesMutation } = ridesApi;
