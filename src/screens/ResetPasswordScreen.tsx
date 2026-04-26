import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeOff, KeyRound, Lock } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

interface ResetPasswordScreenProps {
  onComplete: () => void;
}

export function ResetPasswordScreen({ onComplete }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Missing password', 'Enter and confirm your new password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Confirm your password and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      Alert.alert('Password updated', 'You can now use your new password.');
      onComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Update failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F2F3F5]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-3xl bg-gray-900 items-center justify-center mb-5">
            <KeyRound size={34} color="white" />
          </View>
          <Text className="text-4xl font-bold text-gray-900">New Password</Text>
          <Text className="text-gray-500 font-medium mt-2">Choose a new password for your wallet</Text>
        </View>

        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-2xl font-bold text-gray-900 mb-5">Set a new password</Text>

          <View className="gap-4">
            <View>
              <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">New Password</Text>
              <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-200 px-4">
                <Lock size={18} color="#6b7280" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  className="flex-1 p-4 font-medium text-gray-900"
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible((current) => !current)} className="p-1">
                  {isPasswordVisible ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Confirm Password</Text>
              <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-200 px-4">
                <Lock size={18} color="#6b7280" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Retype your new password"
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  className="flex-1 p-4 font-medium text-gray-900"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUpdatePassword}
            disabled={isSubmitting}
            className={`mt-6 py-4 rounded-2xl items-center ${isSubmitting ? 'bg-gray-500' : 'bg-gray-900'}`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
