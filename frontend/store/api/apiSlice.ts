import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout } from "../slices/authSlice";
import { errorToast } from "@/utils/toast";
import environmentConfig from "../configs/environment.config";

const baseQuery = fetchBaseQuery({
  baseUrl: environmentConfig.API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithLogging = async (args: any, api: any, extraOptions: any) => {
  const fullUrl = typeof args === "string" ? args : args.url;
  console.log("ARGS", args);
  console.log("🚀 API Request:", {
    fullUrl: `${fullUrl}`,
    method: args.method || "GET",
    body: args.body,
    headers: args.headers,
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await baseQuery(args, api, extraOptions);

    console.log("✅ API Response:", {
      url: `${fullUrl}`,
      status: result.meta?.response?.status,
      data: result.data,
      error: result.error,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    console.log("❌ API Error:", {
      url: `${fullUrl}`,
      error,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

const baseQueryWithReauthAndLogging = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  const result = await baseQueryWithLogging(args, api, extraOptions);

  // Handle authentication errors
  if (result.error) {
    const status = (result.error as { status?: number }).status;
    const data = result.error.data as { message?: string };

    switch (status) {
      case 401:
        errorToast("Authentication Error", "Please login again");
        api.dispatch(logout());
        break;
      case 403:
        errorToast(
          "Access Denied",
          "You don't have permission for this action"
        );
        api.dispatch(logout());
        break;
      case 500:
        errorToast(
          "Server Error",
          "Something went wrong. Please try again later"
        );
        break;
      default:
        errorToast("Error", data?.message || "An unexpected error occurred");
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauthAndLogging,
  endpoints: (builder) => ({}),
  tagTypes: ["Rides"],
  keepUnusedDataFor: 50000,
  refetchOnReconnect: true,
});
