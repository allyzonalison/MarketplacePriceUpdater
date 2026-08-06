import api from "./api";

export const exportShopee = async (files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("templates", file);
  });

  const response = await api.post("/exports/shopee", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });

  return response.data;
};
