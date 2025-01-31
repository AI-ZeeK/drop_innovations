import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { successToast, errorToast } from "@/utils/toast";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useRegisterMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
const NAME_REGEX = /^[a-zA-Z\s]{2,30}$/;

interface FormErrors {
  email?: string;
  password?: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

interface SignUpForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone_number: string;
}

const initialFormState: SignUpForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
  phone_number: "",
};

export default function SignUp() {
  const [formData, setFormData] = useState<SignUpForm>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const validators = {
    email: (value: string) => {
      if (!value) return "Email is required";
      if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address";
      return "";
    },
    password: (value: string) => {
      if (!value) return "Password is required";
      if (value.length < 6) return "Password must be at least 6 characters";
      return "";
    },
    confirm_password: (value: string) => {
      if (!value) return "Please confirm your password";
      if (value !== formData.password) return "Passwords do not match";
      return "";
    },
    first_name: (value: string) => {
      if (!value) return "First name is required";
      if (!NAME_REGEX.test(value)) return "Please enter a valid first name";
      return "";
    },
    last_name: (value: string) => {
      if (!value) return "Last name is required";
      if (!NAME_REGEX.test(value)) return "Please enter a valid last name";
      return "";
    },
    phone_number: (value: string) => {
      if (!value) return "Phone number is required";
      if (!PHONE_REGEX.test(value))
        return "Phone number must be in E.164 format (e.g., +1234567890)";
      return "";
    },
  };

  const handleChange = (name: keyof SignUpForm) => (value: string) => {
    let processedValue = value;

    if (name === "email") {
      processedValue = value.trim().toLowerCase();
    } else if (name === "phone_number") {
      processedValue = value.startsWith("+") ? value : `+${value}`;
    } else if (["first_name", "last_name"].includes(name)) {
      processedValue = value
        .trim()
        .replace(/\s+/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    const error = validators[name](processedValue);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };
  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      if (key === "confirm_password") return;
      const error = validators[key](formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    const confirmPasswordError = validators.confirm_password(
      formData.confirm_password
    );
    if (confirmPasswordError) {
      newErrors.confirm_password = confirmPasswordError;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    try {
      if (!validateForm()) {
        errorToast("Validation Error", "Please check the form for errors");
        return;
      }

      const { confirm_password, ...signUpData } = formData;
      const result = await register(signUpData).unwrap();

      dispatch(setCredentials(result));
      successToast(
        "Welcome!",
        `Account created successfully, ${result.user.first_name}`
      );
      router.replace("/(tabs)/rides");
    } catch (error) {
      errorToast(
        "Registration Failed",
        (error as any).data?.message || "Please check your information"
      );
    }
  };

  const isFormValid = () => {
    const hasAllFields = Object.values(formData).every(
      (value) => value.length > 0
    );
    const hasNoErrors = Object.keys(errors).length === 0;

    return hasAllFields && hasNoErrors;
  };

  const formFields = [
    {
      name: "first_name" as const,
      placeholder: "First Name",
      autoCapitalize: "words" as const,
    },
    {
      name: "last_name" as const,
      placeholder: "Last Name",
      autoCapitalize: "words" as const,
    },
    {
      name: "email" as const,
      placeholder: "Email",
      autoCapitalize: "none" as const,
      keyboardType: "email-address" as const,
    },
    {
      name: "phone_number" as const,
      placeholder: "Phone Number",
      keyboardType: "phone-pad" as const,
    },
    {
      name: "password" as const,
      placeholder: "Password",
      secureTextEntry: true,
    },
    {
      name: "confirm_password" as const,
      placeholder: "Confirm Password",
      secureTextEntry: true,
    },
  ];

  return (
    <View className="flex-1 justify-center px-4 bg-background">
      <Text className="text-2xl font-bold text-center mb-8">
        Create Account
      </Text>

      {formFields.map((field) => (
        <View key={field.name} className="mb-4">
          <TextInput
            className={`bg-white p-4 rounded-lg ${
              errors[field.name] ? "border-2 border-red-500" : ""
            }`}
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChangeText={handleChange(field.name)}
            autoCapitalize={field.autoCapitalize}
            keyboardType={field.keyboardType}
            autoComplete={
              field.name === "email"
                ? "email"
                : field.name === "password"
                ? "password"
                : "off"
            }
            secureTextEntry={field.secureTextEntry}
            autoCorrect={false}
          />
          {errors[field.name] ? (
            <Text className="text-red-500 text-sm mt-1 ml-1">
              {errors[field.name]}
            </Text>
          ) : null}
        </View>
      ))}

      <TouchableOpacity
        className={`p-4 rounded-lg ${
          isLoading || !isFormValid() ? "bg-gray-400" : "bg-primary"
        }`}
        onPress={handleSignUp}
        disabled={isLoading || !isFormValid()}
      >
        <Text className="text-white text-center font-semibold">
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push("/sign-in")}
      >
        <Text className="text-primary text-center">
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
