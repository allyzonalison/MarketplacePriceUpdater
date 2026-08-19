import api from "./api";

export const exportTikTok = async (file: File) => {
  const formData = new FormData();

  formData.append("templates", file);

  const response = await api.post("/exports/tiktok", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });

  return response.data;
};
