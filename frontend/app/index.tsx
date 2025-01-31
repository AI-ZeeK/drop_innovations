import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAppSelector } from "../hooks/useAppDispatch";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace("/(tabs)/rides");
      } else {
        router.replace("/(auth)/sign-in");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-primary">Loading...</Text>
    </View>
  );
}
