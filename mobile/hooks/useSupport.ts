import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/axios";

interface SupportTicket {
  _id: string;
  user: string;
  category: "bug" | "feature" | "help" | "other";
  subject: string;
  message: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
}

interface CreateTicketData {
  category: string;
  subject: string;
  message: string;
}

export const useCreateSupportTicket = () => {
  const { apiWithAuth } = useApi();

  return useMutation({
    mutationFn: async (data: CreateTicketData) => {
      console.log("🎫 Creating support ticket with data:", data);
      
      const response = await apiWithAuth<{ message: string; ticket: SupportTicket }>({
        method: "POST",
        url: "/support",
        data,
      });
      
      console.log("✅ Support ticket created:", response.data);
      return response.data;
    },
    onError: (error: any) => {
      console.error("❌ Failed to create support ticket:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
};

export const useUserSupportTickets = () => {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const response = await apiWithAuth<SupportTicket[]>({
        method: "GET",
        url: "/support",
      });
      return response.data;
    },
  });
};

export const useSupportTicket = (ticketId: string) => {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ["support-ticket", ticketId],
    queryFn: async () => {
      const response = await apiWithAuth<SupportTicket>({
        method: "GET",
        url: `/support/${ticketId}`,
      });
      return response.data;
    },
    enabled: !!ticketId,
  });
};