import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/axios";

interface Rating {
  _id: string;
  user: string;
  rating: number;
  feedback?: string;
  version?: string;
  platform?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubmitRatingData {
  rating: number;
  feedback?: string;
  version?: string;
  platform?: string;
}

interface RatingStats {
  totalRatings: number;
  averageRating: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const useSubmitRating = () => {
  const { apiWithAuth } = useApi();

  return useMutation({
    mutationFn: async (data: SubmitRatingData) => {
      console.log("⭐ Submitting rating:", data);
      
      const response = await apiWithAuth<{ message: string; rating: Rating }>({
        method: "POST",
        url: "/ratings",
        data,
      });
      
      console.log("✅ Rating submitted:", response.data);
      return response.data;
    },
    onError: (error: any) => {
      console.error("❌ Failed to submit rating:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
};

export const useUserRating = () => {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ["user-rating"],
    queryFn: async () => {
      const response = await apiWithAuth<Rating>({
        method: "GET",
        url: "/ratings/me",
      });
      return response.data;
    },
    retry: false, // Don't retry if user hasn't rated yet (404)
  });
};

export const useRatingStats = () => {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ["rating-stats"],
    queryFn: async () => {
      const response = await apiWithAuth<RatingStats>({
        method: "GET",
        url: "/ratings/stats",
      });
      return response.data;
    },
  });
};