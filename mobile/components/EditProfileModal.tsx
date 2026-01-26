import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useUser } from "@clerk/clerk-expo";
import { useUpdateProfile } from "@/hooks/useProfile";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { user } = useUser();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const handleUpdate = async () => {
    if (!user) return;

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    if (!fullName) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    // Update Clerk first
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Then update backend
      updateProfile(
        { name: fullName },
        {
          onSuccess: () => {
            Alert.alert("Success", "Profile updated successfully!");
            onClose();
          },
          onError: () => {
            Alert.alert("Error", "Failed to update profile in database. Please try again.");
          },
        }
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-surface-dark rounded-t-3xl p-6 pb-10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-foreground text-xl font-bold">Edit Profile</Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-surface-card items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#F8FAFC" />
            </Pressable>
          </View>

          {/* Avatar */}
          <View className="items-center mb-6">
            <View className="relative">
              <Image
                source={user?.imageUrl}
                style={{ width: 100, height: 100, borderRadius: 999 }}
              />
              <Pressable className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full items-center justify-center border-2 border-surface-dark">
                <Ionicons name="camera" size={20} color="#0B0D10" />
              </Pressable>
            </View>
            <Text className="text-muted-foreground text-sm mt-2">Tap to change photo</Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <View>
              <Text className="text-muted-foreground text-sm mb-2">First Name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor="#6B7280"
                className="bg-surface-card text-foreground px-4 py-3 rounded-xl"
              />
            </View>

            <View>
              <Text className="text-muted-foreground text-sm mb-2">Last Name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor="#6B7280"
                className="bg-surface-card text-foreground px-4 py-3 rounded-xl"
              />
            </View>

            <View>
              <Text className="text-muted-foreground text-sm mb-2">Email</Text>
              <TextInput
                value={user?.emailAddresses[0]?.emailAddress}
                editable={false}
                className="bg-surface-light text-subtle-foreground px-4 py-3 rounded-xl"
              />
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 mt-6">
            <Pressable
              onPress={onClose}
              className="flex-1 bg-surface-card py-3 rounded-xl items-center"
            >
              <Text className="text-foreground font-semibold">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-primary py-3 rounded-xl items-center"
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#0B0D10" />
              ) : (
                <Text className="text-surface-dark font-semibold">Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}