import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/common';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export default function SignupScreen({ navigation }: any) {
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!phone) e.phone = 'Phone is required';
    else if (phone.length < 10) e.phone = 'Enter valid 10-digit phone';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    await signup(name, email, phone, password);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={[COLORS.accent, COLORS.accentDark]} style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={36} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join 10 million+ users on HealthCare+</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            leftIcon="person-outline"
            error={errors.name}
          />
          <Input
            label="Email Address"
            placeholder="Your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon="mail-outline"
            error={errors.email}
          />
          <Input
            label="Phone Number"
            placeholder="10-digit phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon="call-outline"
            error={errors.phone}
          />
          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon="lock-closed-outline"
            rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>

          <Button
            title="Create Account"
            onPress={handleSignup}
            isLoading={isLoading}
            variant="secondary"
            style={{ marginBottom: SPACING.lg }}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setSent(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.warning, '#E67E22']} style={[styles.header, { paddingBottom: 30 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.logoCircle}>
          <Ionicons name="lock-open-outline" size={36} color={COLORS.white} />
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>No worries, we'll help you reset it</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        {!sent ? (
          <>
            <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.xl, fontSize: FONT_SIZES.md, lineHeight: 22 }}>
              Enter your registered email address and we'll send you a link to reset your password.
            </Text>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              leftIcon="mail-outline"
            />
            <Button title="Send Reset Link" onPress={handleSendOTP} isLoading={isLoading} variant="primary" />
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: SPACING['2xl'] }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg }}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
            </View>
            <Text style={{ fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm }}>Email Sent!</Text>
            <Text style={{ color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl }}>
              We've sent a password reset link to{'\n'}<Text style={{ fontWeight: '600', color: COLORS.primary }}>{email}</Text>
            </Text>
            <Button title="Back to Sign In" onPress={() => navigation.navigate('Login')} />
          </View>
        )}

        <View style={[styles.loginRow, { marginTop: SPACING.lg }]}>
          <Text style={styles.loginText}>Remember password?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: SPACING.base,
    top: 55,
    padding: SPACING.sm,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: SPACING.xl,
    paddingTop: SPACING['2xl'],
  },
  termsText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  link: { color: COLORS.primary, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.base },
  loginLink: { color: COLORS.primary, fontSize: FONT_SIZES.base, fontWeight: '700' },
});
