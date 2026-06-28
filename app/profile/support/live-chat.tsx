import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

type Message = {
  id: string;
  text: string;
  sender: "user" | "agent";
  time: string;
};

export default function LiveChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi Sudip! Welcome to Punjabi Kitchen Support. I am Simran.",
      sender: "agent",
      time: "10:00 PM",
    },
    {
      id: "2",
      text: "I see your active order #ORD-1041 is out for delivery. How can I help you today?",
      sender: "agent",
      time: "10:00 PM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    if (inputText.trim() === "") return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate Agent Response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for the details. I am contacting our delivery executive Ramesh right now to check the exact location. Please stay connected.",
        sender: "agent",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentResponse]);
    }, 2000);
  };

  useEffect(() => {
    // Scroll to end whenever messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  return (
    <ScreenHeader title="Support Live Chat" backHref="/(tabs)/profile">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* Agent Info bar */}
        <View style={styles.agentBar}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
            <View style={styles.onlineBadge} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.agentName}>Simran (Support Associate)</Text>
            <Text style={styles.agentStatus}>Online • Response time: under 1 min</Text>
          </View>
          <TouchableOpacity style={styles.callIcon} onPress={() => alert("Calling Helpline...")}>
            <Ionicons name="call-outline" size={18} color={colors.gold} />
          </TouchableOpacity>
        </View>

        {/* Message Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageScroll}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.bubbleWrapper,
                msg.sender === "user" ? styles.userWrapper : styles.agentWrapper,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  msg.sender === "user" ? styles.userBubble : styles.agentBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === "user" ? styles.userText : styles.agentText,
                  ]}
                >
                  {msg.text}
                </Text>
                <Text style={styles.timeText}>{msg.time}</Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.bubbleWrapper, styles.agentWrapper]}>
              <View style={[styles.bubble, styles.agentBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.gold} />
                <Text style={[styles.messageText, styles.agentText, { marginLeft: 8 }]}>
                  Simran is typing...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type your message here..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.8}>
            <Ionicons name="send" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    height: 520, // Provides a bounded height to render within ScreenHeader's ScrollView
  },
  agentBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.gold,
  },
  onlineBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  agentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  agentStatus: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageScroll: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.01)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  messageContent: {
    padding: 12,
  },
  bubbleWrapper: {
    flexDirection: "row",
    marginBottom: 12,
    width: "100%",
  },
  userWrapper: {
    justifyContent: "flex-end",
  },
  agentWrapper: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.gold,
    borderTopRightRadius: 2,
  },
  agentBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 2,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userText: {
    color: "#000",
    fontWeight: "500",
  },
  agentText: {
    color: colors.textPrimary,
  },
  timeText: {
    fontSize: 9,
    alignSelf: "flex-end",
    marginTop: 4,
    color: "rgba(0,0,0,0.4)",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    height: 38,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
});
