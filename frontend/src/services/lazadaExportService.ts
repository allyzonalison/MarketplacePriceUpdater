import api from "./api";

export const exportLazada = async (file: File) => {
  const formData = new FormData();

  formData.append("templates", file);

  const response = await api.post("/exports/lazada", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });

  return response.data;
};
