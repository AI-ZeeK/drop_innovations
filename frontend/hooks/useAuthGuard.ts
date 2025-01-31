import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAppSelector } from "./useAppDispatch";

export function useAuthGuard() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/sign-in");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/rides");
    }
  }, [isAuthenticated, segments, router]);
}
