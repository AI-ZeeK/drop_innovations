import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

export const showToast = (type: ToastType, text1: string, text2?: string) => {
  Toast.show({
    type,
    text1,
    text2,
    position: "top",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });
};

export const successToast = (title: string, message?: string) => {
  showToast("success", title, message);
};

export const errorToast = (title: string, message?: string) => {
  showToast("error", title, message);
};

export const infoToast = (title: string, message?: string) => {
  showToast("info", title, message);
};
