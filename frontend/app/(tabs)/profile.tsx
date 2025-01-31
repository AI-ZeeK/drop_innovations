import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { logout } from "@/store/slices/authSlice";
import { successToast } from "@/utils/toast";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    successToast("Goodbye!", "You have been logged out successfully");
    router.replace("/sign-in");
  };

  return (
    <View className="flex-1 bg-background p-4">
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-xl font-bold mb-2">Profile Information</Text>
        <Text className="text-gray-600">
          Name: {user?.first_name} {user?.last_name}
        </Text>
        <Text className="text-gray-600">Email: {user?.email}</Text>
        <Text className="text-gray-600">Phone: {user?.phone_number}</Text>
      </View>

      <TouchableOpacity
        className="bg-danger p-4 rounded-lg"
        onPress={handleLogout}
      >
        <Text className="text-white text-center font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
