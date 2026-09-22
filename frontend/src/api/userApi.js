import api from "./axios";

export const updateUserApi = async (userData) => {
  const response = await api.patch("/user/update-user", userData);
  return response.data;
};

export const uploadUserImageApi = async (formData) => {
  const response = await api.post(
    "/user/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};