import { apiSlice } from "./apiSlice";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
}

interface AuthResponse {
  token: string;
  user: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/users/register",
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
