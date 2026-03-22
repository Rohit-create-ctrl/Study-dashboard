export type ToastMessage = string;
export type ToastType = "success" | "error" | "info";
export type Listener = (msg: ToastMessage, type: ToastType) => void;

let listeners: Listener[] = [];

export const toast = {
  success: (msg: ToastMessage) => listeners.forEach((l) => l(msg, "success")),
  error: (msg: ToastMessage) => listeners.forEach((l) => l(msg, "error")),
  info: (msg: ToastMessage) => listeners.forEach((l) => l(msg, "info")),
};

export const subscribeToToasts = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};
