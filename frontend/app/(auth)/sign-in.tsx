import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { setCredentials } from "../../store/slices/authSlice";
import { useLoginMutation } from "../../store/api/authApi";
import { successToast, errorToast } from "@/utils/toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [login, { isLoading }] = useLoginMutation();

  const validateEmail = useCallback((email: string) => {
    if (!email) {
      return "Email is required";
    }
    if (!EMAIL_REGEX.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  }, []);

  const handleEmailChange = (text: string) => {
    const sanitizedEmail = text.trim().toLowerCase();
    setEmail(sanitizedEmail);
    setEmailError(validateEmail(sanitizedEmail));
  };

  const handleLogin = async () => {
    try {
      const emailValidationError = validateEmail(email);
      if (emailValidationError) {
        errorToast("Validation Error", emailValidationError);
        return;
      }

      const result = await login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();

      dispatch(setCredentials(result));
      successToast(
        "Welcome back!",
        `Good to see you, ${result.user.first_name}`
      );
      router.replace("/(tabs)/rides");
    } catch (error) {
      errorToast(
        "Login Failed",
        (error as any).data?.message || "Please check your credentials"
      );
    }
  };

  return (
    <View className="flex-1 justify-center px-4 bg-background">
      <Text className="text-2xl font-bold text-center mb-8">Welcome Back</Text>

      <View className="mb-4">
        <TextInput
          className={`bg-white p-4 rounded-lg ${
            emailError ? "border-2 border-red-500" : ""
          }`}
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoCorrect={false}
        />
        {emailError ? (
          <Text className="text-red-500 text-sm mt-1 ml-1">{emailError}</Text>
        ) : null}
      </View>

      <TextInput
        className="bg-white p-4 rounded-lg mb-6"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className={`p-4 rounded-lg ${
          isLoading || emailError ? "bg-gray-400" : "bg-primary"
        }`}
        onPress={handleLogin}
        disabled={isLoading || !!emailError}
      >
        <Text className="text-white text-center font-semibold">
          {isLoading ? "Signing in..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push("/sign-up")}
      >
        <Text className="text-primary text-center">
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}
