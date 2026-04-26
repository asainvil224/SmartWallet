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
import { CreditCard, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

type AuthMode = 'sign-in' | 'sign-up';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === 'sign-up';
  const accentColor = isSignUp ? '#16a34a' : '#111827';
  const accentSoft = isSignUp ? '#E9F9EF' : '#EEF2F7';
  const accentBorder = isSignUp ? '#BBF7D0' : '#D1D5DB';

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword('');
    setConfirmPassword('');
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Enter your email', 'Type your email first, then tap Forgot password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: 'smartwallet://reset-password',
      });

      if (error) throw error;

      Alert.alert(
        'Check your email',
        'Open the reset link from Supabase, then set your new password in the app.'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Reset email failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert('Missing info', 'Enter your email and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Confirm your password and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: normalizedEmail,
          });
        }

        if (!data.session) {
          Alert.alert('Check your email', 'Confirm your email, then sign in.');
          setMode('sign-in');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert(isSignUp ? 'Sign up failed' : 'Sign in failed', message);
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
        <View className={`items-center ${isSignUp ? 'mb-7' : 'mb-10'}`}>
          <View
            className="w-20 h-20 rounded-3xl items-center justify-center mb-5"
            style={{ backgroundColor: accentColor }}
          >
            <CreditCard size={34} color="white" />
          </View>
          <Text className="text-4xl font-bold text-gray-900">SmartWallet</Text>
          <Text className="text-gray-500 font-medium mt-2">
            {isSignUp ? 'Create your wallet account' : 'Welcome back'}
          </Text>
        </View>

        {isSignUp && (
          <View
            className="rounded-3xl p-5 mb-4 border"
            style={{ backgroundColor: accentSoft, borderColor: accentBorder }}
          >
            <Text className="text-lg font-bold text-gray-900">Start fresh</Text>
            <Text className="text-sm text-gray-600 font-medium mt-1">
              Create an account to save cards and track payments securely.
            </Text>
          </View>
        )}

        <View
          className="bg-white rounded-3xl p-5 shadow-sm border"
          style={{ borderColor: isSignUp ? accentBorder : '#FFFFFF' }}
        >
          <Text className="text-2xl font-bold text-gray-900 mb-5">
            {isSignUp ? 'Sign up' : 'Log in'}
          </Text>

          <View className="gap-4">
            <View>
              <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Email</Text>
              <View
                className="flex-row items-center rounded-2xl border px-4"
                style={{ backgroundColor: isSignUp ? '#F8FEFA' : '#F9FAFB', borderColor: isSignUp ? accentBorder : '#E5E7EB' }}
              >
                <Mail size={18} color={isSignUp ? accentColor : '#6b7280'} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 p-4 font-medium text-gray-900"
                />
              </View>
            </View>

            <View>
              <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Password</Text>
              <View
                className="flex-row items-center rounded-2xl border px-4"
                style={{ backgroundColor: isSignUp ? '#F8FEFA' : '#F9FAFB', borderColor: isSignUp ? accentBorder : '#E5E7EB' }}
              >
                <Lock size={18} color={isSignUp ? accentColor : '#6b7280'} />
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

            {isSignUp && (
              <View>
                <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Confirm Password</Text>
                <View
                  className="flex-row items-center rounded-2xl border px-4"
                  style={{ backgroundColor: '#F8FEFA', borderColor: accentBorder }}
                >
                  <Lock size={18} color={accentColor} />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Retype your password"
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    className="flex-1 p-4 font-medium text-gray-900"
                  />
                </View>
              </View>
            )}
          </View>

          {!isSignUp && (
            <TouchableOpacity onPress={handleForgotPassword} disabled={isSubmitting} className="mt-4 self-end">
              <Text className="text-gray-900 font-bold">Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="mt-6 py-4 rounded-2xl items-center"
            style={{ backgroundColor: isSubmitting ? '#6B7280' : accentColor }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">{isSignUp ? 'Create Account' : 'Log In'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleModeChange(isSignUp ? 'sign-in' : 'sign-up')}
            className="mt-5 items-center"
          >
            <Text className="text-gray-500 font-medium">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text className="text-gray-900 font-bold">{isSignUp ? 'Log in' : 'Sign up'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
