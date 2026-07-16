import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getMuscleName } from '../src/data/exercises';

const OPENING_MESSAGE = { role: 'assistant', text: "I'm your AI coach. Ask me anything about your training." };
const ERROR_REPLY = 'Something went wrong. Try again.';

export default function AICoachScreen({ navigation }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState([OPENING_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const contextRef = useRef(null);

  const gatherUserContext = async () => {
    if (!user) return { split: null, recentWorkouts: [] };

    // Split lives on the user doc: array of {id, name, muscles} days, or a legacy preset string
    let split = null;
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const raw = snap.exists() ? snap.data().split : null;
      if (Array.isArray(raw) && raw.length > 0) {
        split = { name: null, days: raw };
      } else if (typeof raw === 'string' && raw) {
        split = { name: raw, days: [] };
      }
    } catch (e) {}

    // Workouts are posts without type 'song'. Newer posts carry userId; older ones only a name.
    let recentWorkouts = [];
    try {
      const toWorkouts = (snap) =>
        snap.docs.map(d => d.data()).filter(p => p.type !== 'song' && Array.isArray(p.exercises));

      let workouts = toWorkouts(
        await getDocs(query(collection(db, 'posts'), where('userId', '==', user.uid)))
      );
      if (workouts.length === 0 && profile?.name) {
        workouts = toWorkouts(
          await getDocs(query(collection(db, 'posts'), where('name', '==', profile.name)))
        );
      }
      recentWorkouts = workouts
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
        .slice(0, 5)
        .map(p => ({
          date: p.createdAt?.toDate?.()?.toISOString?.() || null,
          workout: p.workout || null,
          exercises: p.exercises,
        }));
    } catch (e) {}

    return { split, recentWorkouts };
  };

  useEffect(() => {
    gatherUserContext().then(ctx => {
      contextRef.current = ctx;
      console.log('AI Coach context:', JSON.stringify(ctx, null, 2));
    });
  }, []);

  const buildSystemPrompt = (ctx) => {
    let prompt = 'You are an AI fitness coach inside the GymSync app. Give short, practical, specific advice. Do not lecture. Do not add disclaimers about consulting professionals unless the question is medical.';
    const days = ctx?.split?.days || [];
    if (days.length > 0) {
      const dayList = days
        .map(d => `${d.name} (${(d.muscles || []).map(getMuscleName).join(', ')})`)
        .join('; ');
      prompt += `\n\nThe user's current training split has these days: ${dayList}.`;
    } else if (ctx?.split?.name) {
      prompt += `\n\nThe user follows a ${ctx.split.name} split.`;
    }
    const recent = ctx?.recentWorkouts?.[0];
    if (recent) {
      const when = recent.date ? new Date(recent.date).toDateString() : 'recently';
      const exList = (recent.exercises || []).map(ex => {
        const sets = Array.isArray(ex.sets) ? ex.sets : [];
        if (sets.length === 0) return ex.name;
        const top = sets.reduce(
          (best, s) => (Number(s.weight) || 0) > (Number(best.weight) || 0) ? s : best,
          sets[0]
        );
        return `${ex.name} ${top.weight || 0}kg x ${top.reps || 0}`;
      }).join(', ');
      prompt += `\n\nTheir most recent workout was ${recent.workout || 'a workout'} on ${when}, where they did: ${exList}.`;
    }
    if (days.length > 0 || recent) {
      prompt += '\n\nUse this context to give specific answers when relevant.';
    }
    return prompt;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    const nextMessages = [...messages, { role: 'user', text }];
    setMessages(nextMessages);
    setIsTyping(true);
    try {
      let ctx = contextRef.current;
      if (!ctx) {
        ctx = await gatherUserContext();
        contextRef.current = ctx;
      }
      // Anthropic format, skipping the opening greeting (index 0) — that's UI only
      const apiMessages = nextMessages.slice(1).map(m => ({ role: m.role, content: m.text }));

      const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 500,
          system: buildSystemPrompt(ctx),
          messages: apiMessages,
        }),
      });
      if (!res.ok) {
        console.error('AI Coach API error:', res.status, await res.text());
        setMessages(prev => [...prev, { role: 'assistant', text: ERROR_REPLY }]);
      } else {
        const data = await res.json();
        const reply = data?.content?.[0]?.text;
        if (reply) {
          setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        } else {
          console.error('AI Coach unexpected response:', JSON.stringify(data));
          setMessages(prev => [...prev, { role: 'assistant', text: ERROR_REPLY }]);
        }
      }
    } catch (e) {
      console.error('AI Coach fetch failed:', e);
      setMessages(prev => [...prev, { role: 'assistant', text: ERROR_REPLY }]);
    }
    setIsTyping(false);
  };

  // Inverted list renders newest at the bottom with no scroll management needed
  const data = messages.map((m, i) => ({ ...m, id: String(i) })).reverse();

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>AI Coach</Text>
      </View>

      <FlatList
        inverted
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={isTyping ? (
          <View style={[s.bubble, s.assistantBubble, s.typingBubble]}>
            <ActivityIndicator size="small" color={theme.accentLight} />
          </View>
        ) : null}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.assistantBubble]}>
            <Text style={item.role === 'user' ? s.userText : s.assistantText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Ask your coach..."
          placeholderTextColor={theme.subtext}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[s.sendButton, (!input.trim() || isTyping) && s.sendButtonDisabled]}
          onPress={send}
          disabled={!input.trim() || isTyping}
        >
          <Text style={s.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16,
    },
    backBtn: { marginRight: 16 },
    backText: { color: t.accentLight, fontSize: 16 },
    title: { color: t.text, fontSize: 22, fontWeight: 'bold' },
    listContent: { paddingHorizontal: 24, paddingVertical: 16 },
    bubble: {
      maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14,
      paddingVertical: 10, marginBottom: 10,
    },
    userBubble: {
      alignSelf: 'flex-end', backgroundColor: t.accent,
      borderBottomRightRadius: 4,
    },
    assistantBubble: {
      alignSelf: 'flex-start', backgroundColor: t.card,
      borderWidth: 0.5, borderColor: t.border,
      borderBottomLeftRadius: 4,
    },
    typingBubble: { paddingVertical: 12, paddingHorizontal: 20 },
    userText: { color: '#ffffff', fontSize: 14, lineHeight: 20 },
    assistantText: { color: t.text, fontSize: 14, lineHeight: 20 },
    inputRow: {
      flexDirection: 'row', gap: 8, paddingHorizontal: 24,
      paddingTop: 10, paddingBottom: 28, alignItems: 'center',
    },
    input: {
      flex: 1, backgroundColor: t.inputBg, borderRadius: 22,
      paddingHorizontal: 16, paddingVertical: 12, color: t.text,
      fontSize: 14, borderWidth: 0.5, borderColor: t.border,
    },
    sendButton: {
      backgroundColor: t.accent, borderRadius: 22,
      paddingHorizontal: 18, paddingVertical: 12,
    },
    sendButtonDisabled: { opacity: 0.4 },
    sendButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  });
}
