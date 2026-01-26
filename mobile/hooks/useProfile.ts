import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/axios";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

interface UpdateProfileData {
  name: string;
  avatar?: string;
}

export const useUpdateProfile = () => {
  const { apiWithAuth } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      console.log("📝 Updating profile with data:", data);
      
      const response = await apiWithAuth<User>({
        method: "PUT",
        url: "/users/profile",
        data,
      });
      
      console.log("✅ Profile updated:", response.data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update current user in cache
      queryClient.setQueryData(["currentUser"], data);
      
      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      // Update any chats where this user appears
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error: any) => {
      console.error("❌ Failed to update profile:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
};