import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';
import { useAuth } from '@/context/AuthContext';

const QUICK_QUESTIONS = [
  'Is this medicine available?',
  'Do you have a generic version?',
  'What are the side effects?',
  'Is a prescription required?',
  'What is the expiry date?',
  'Do you offer home delivery?',
];

export default function AskQuestionScreen() {
  const { storeId, storeName } = useLocalSearchParams<{ storeId: string; storeName: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/stores/${storeId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          phoneNumber: user?.phoneNumber ?? '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.replace({
          pathname: '/question-sent' as any,
          params: { storeName },
        });
      } else {
        Alert.alert('Error', data.message || 'Failed to send question. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ask a Question</Text>
          <Text style={styles.headerSub}>{storeName}</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={18} color="#1565C0" />
            <Text style={styles.infoText}>
              Your question will be sent directly to the pharmacy vendor. They typically respond within a few hours.
            </Text>
          </View>

          {/* Quick question chips */}
          <Text style={styles.sectionLabel}>Common Questions</Text>
          <View style={styles.chipsRow}>
            {QUICK_QUESTIONS.map(q => (
              <TouchableOpacity
                key={q}
                style={[styles.chip, question === q && styles.chipActive]}
                onPress={() => setQuestion(q)}
              >
                <Text style={[styles.chipText, question === q && styles.chipTextActive]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text input */}
          <Text style={styles.sectionLabel}>Your Question</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Type your question here..."
              placeholderTextColor="#aaa"
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{question.length}/500</Text>
          </View>

          {user?.phoneNumber ? (
            <View style={styles.phoneNote}>
              <Ionicons name="call-outline" size={14} color="#666" />
              <Text style={styles.phoneNoteText}>
                Vendor will contact you on +91 {user.phoneNumber} if needed
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Send button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sendBtn, !question.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={sending || !question.trim()}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.sendBtnText}>Send to Vendor</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#C62828', paddingHorizontal: 16, paddingVertical: 14,
  },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  scroll: { padding: 16, gap: 12, paddingBottom: 16 },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12,
  },
  infoText: { flex: 1, fontSize: 13, color: '#1565C0', lineHeight: 18 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5, borderColor: '#C62828', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chipActive: { backgroundColor: '#C62828' },
  chipText: { fontSize: 12, color: '#C62828', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  inputBox: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5,
    borderColor: '#e0e0e0', padding: 14,
  },
  input: { fontSize: 14, color: '#1a1a1a', minHeight: 120, lineHeight: 20 },
  charCount: { fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 6 },
  phoneNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
  },
  phoneNoteText: { fontSize: 12, color: '#666', flex: 1 },
  footer: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  sendBtn: {
    backgroundColor: '#C62828', borderRadius: 12,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  sendBtnDisabled: { backgroundColor: '#e0a0a0' },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
