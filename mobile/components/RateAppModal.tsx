import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useSubmitRating } from "@/hooks/useRating";
import Constants from "expo-constants";

interface RateAppModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RateAppModal({ visible, onClose }: RateAppModalProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  const { mutate: submitRating, isPending: isSubmitting } = useSubmitRating();

  const handleStarPress = (star: number) => {
    setRating(star);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Please select a rating", "Tap on the stars to rate the app");
      return;
    }

    const platform = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";
    const version = Constants.expoConfig?.version || "1.0.0";

    submitRating(
      {
        rating,
        feedback: feedback.trim() || undefined,
        platform,
        version,
      },
      {
        onSuccess: () => {
          if (rating >= 4) {
            // High rating - redirect to app store
            Alert.alert(
              "Thank you! 🎉",
              "Would you like to rate us on the App Store?",
              [
                { 
                  text: "Later", 
                  style: "cancel",
                  onPress: () => {
                    setRating(0);
                    setFeedback("");
                    onClose();
                  }
                },
                {
                  text: "Sure!",
                  onPress: () => {
                    // Replace with your actual app store URL
                    const appStoreUrl = Platform.OS === "ios"
                      ? "https://apps.apple.com/app/your-app-id"
                      : "https://play.google.com/store/apps/details?id=your.app.id";
                    Linking.openURL(appStoreUrl);
                    setRating(0);
                    setFeedback("");
                    onClose();
                  },
                },
              ]
            );
          } else {
            // Low rating - thank for feedback
            Alert.alert(
              "Thank you for your feedback!",
              "We're sorry you're not satisfied. We'll work hard to improve your experience.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    setRating(0);
                    setFeedback("");
                    onClose();
                  },
                },
              ]
            );
          }
        },
        onError: () => {
          Alert.alert("Error", "Failed to submit rating. Please try again.");
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-surface-dark rounded-3xl p-6 w-full max-w-md">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-foreground text-xl font-bold">Rate Mumble</Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-surface-card items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#F8FAFC" />
            </Pressable>
          </View>

          {/* Rating Stars */}
          <View className="items-center mb-6">
            <Text className="text-muted-foreground text-sm mb-4">How would you rate your experience?</Text>
            <View className="flex-row gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => handleStarPress(star)}
                  className="active:scale-110"
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={40}
                    color={star <= rating ? "#FACC15" : "#6B7280"}
                  />
                </Pressable>
              ))}
            </View>
            {rating > 0 && (
              <Text className="text-primary text-base mt-2 font-semibold">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </Text>
            )}
          </View>

          {/* Feedback Input */}
          {rating > 0 && (
            <View className="mb-6">
              <Text className="text-muted-foreground text-sm mb-2">
                Tell us more (optional)
              </Text>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="What did you like or dislike?"
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-surface-card text-foreground px-4 py-3 rounded-xl h-24"
              />
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className={`py-4 rounded-xl items-center ${
              rating === 0 ? "bg-surface-light" : "bg-primary"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#0B0D10" />
            ) : (
              <Text
                className={`font-bold text-base ${
                  rating === 0 ? "text-muted-foreground" : "text-surface-dark"
                }`}
              >
                Submit Rating
              </Text>
            )}
          </Pressable>

          {/* Privacy Note */}
          <Text className="text-subtle-foreground text-xs text-center mt-4">
            Your feedback helps us improve Mumble
          </Text>
        </View>
      </View>
    </Modal>
  );
}