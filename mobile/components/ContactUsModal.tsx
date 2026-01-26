import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCreateSupportTicket } from "@/hooks/useSupport";

interface ContactUsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SUPPORT_CATEGORIES = [
  { id: "bug", label: "Report a Bug", icon: "bug-outline" },
  { id: "feature", label: "Feature Request", icon: "bulb-outline" },
  { id: "help", label: "Need Help", icon: "help-circle-outline" },
  { id: "other", label: "Other", icon: "chatbubble-outline" },
];

export default function ContactUsModal({ visible, onClose }: ContactUsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const { mutate: createTicket, isPending: isSending } = useCreateSupportTicket();

  const handleSubmit = async () => {
    if (!selectedCategory || !subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    createTicket(
      {
        category: selectedCategory,
        subject: subject.trim(),
        message: message.trim(),
      },
      {
        onSuccess: () => {
          Alert.alert(
            "Message Sent!",
            "Thank you for contacting us. We'll get back to you soon.",
            [
              {
                text: "OK",
                onPress: () => {
                  setSelectedCategory(null);
                  setSubject("");
                  setMessage("");
                  onClose();
                },
              },
            ]
          );
        },
        onError: () => {
          Alert.alert("Error", "Failed to send message. Please try again.");
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-surface-dark rounded-t-3xl h-[90%]">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="p-6 pb-10">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-foreground text-xl font-bold">Contact Us</Text>
                <Pressable
                  onPress={onClose}
                  className="w-8 h-8 rounded-full bg-surface-card items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#F8FAFC" />
                </Pressable>
              </View>

              {/* Category Selection */}
              <View className="mb-6">
                <Text className="text-muted-foreground text-sm mb-3">Select Category</Text>
                <View className="gap-3">
                  {SUPPORT_CATEGORIES.map((category) => (
                    <Pressable
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                      className={`flex-row items-center p-4 rounded-xl border ${
                        selectedCategory === category.id
                          ? "bg-primary/20 border-primary"
                          : "bg-surface-card border-surface-light"
                      }`}
                    >
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center ${
                          selectedCategory === category.id
                            ? "bg-primary"
                            : "bg-surface-light"
                        }`}
                      >
                        <Ionicons
                          name={category.icon as any}
                          size={20}
                          color={selectedCategory === category.id ? "#0B0D10" : "#4FD1C5"}
                        />
                      </View>
                      <Text
                        className={`ml-3 font-medium ${
                          selectedCategory === category.id
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {category.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Subject */}
              <View className="mb-4">
                <Text className="text-muted-foreground text-sm mb-2">Subject</Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Brief description of your issue"
                  placeholderTextColor="#6B7280"
                  className="bg-surface-card text-foreground px-4 py-3 rounded-xl"
                />
              </View>

              {/* Message */}
              <View className="mb-6">
                <Text className="text-muted-foreground text-sm mb-2">Message</Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Describe your issue in detail..."
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="bg-surface-card text-foreground px-4 py-3 rounded-xl h-32"
                />
              </View>

              {/* Contact Info */}
              <View className="bg-surface-card rounded-xl p-4 mb-6">
                <Text className="text-foreground font-semibold mb-3">Other Ways to Reach Us</Text>
                <View className="gap-2">
                  <View className="flex-row items-center">
                    <Ionicons name="mail-outline" size={16} color="#4FD1C5" />
                    <Text className="text-muted-foreground text-sm ml-2">
                      support@mumble.com
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="call-outline" size={16} color="#4FD1C5" />
                    <Text className="text-muted-foreground text-sm ml-2">
                      +1 (555) 123-4567
                    </Text>
                  </View>
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isSending}
                className="bg-primary py-4 rounded-xl items-center"
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#0B0D10" />
                ) : (
                  <Text className="text-surface-dark font-bold text-base">Send Message</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}