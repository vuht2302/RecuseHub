export const formatTimestamp = (value: Date): string => {
  return value.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
