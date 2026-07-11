import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Message = {
  id: string;
  text: string;
  sender: "user" | "agent";
  time: string;
};

export default function LiveChatScreen() {
  const router = useRouter();
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
    <ScreenHeader title="Support Live Chat" backHref="/(tabs)/profile" scrollable={false}>
      {/* Toggle between AI Waiter and Live Support */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, styles.tabButtonActive]}
          disabled={true}
        >
          <Ionicons name="headset" size={14} color="#000" style={{ marginRight: 6 }} />
          <Text style={[styles.tabButtonText, styles.tabButtonTextActive]}>Live Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => router.push("/profile/support/ai-waiter")}
        >
          <Ionicons name="sparkles-outline" size={14} color={colors.gold} style={{ marginRight: 6 }} />
          <Text style={styles.tabButtonText}>AI Waiter (Tadka)</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 115 : 0}
        style={styles.keyboardContainer}
      >
        <View style={styles.pageBody}>
          {/* Agent Info bar */}
          <LinearGradient
            colors={["#16130F", "#0F0C0A"]}
            style={styles.agentBar}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>S</Text>
              <View style={styles.onlineBadge} />
            </View>
            <View style={styles.agentInfoText}>
              <Text style={styles.agentName}>Simran • Punjabi Kitchen</Text>
              <Text style={styles.agentStatus}>Support Executive • Active Now</Text>
            </View>
            <TouchableOpacity style={styles.callIcon} onPress={() => alert("Calling Helpline...")}> 
              <Ionicons name="call" size={18} color="#000" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Message Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageScroll}
            contentContainerStyle={styles.messageContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.bubbleWrapper,
                    isUser ? styles.userWrapper : styles.agentWrapper,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.smallAvatar}>
                      <Text style={styles.smallAvatarText}>S</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.userBubble : styles.agentBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.agentText,
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.agentTimeText]}>
                      {msg.time}
                    </Text>
                  </View>
                  {isUser && (
                    <View style={styles.smallUserAvatar}>
                      <Ionicons name="person" size={12} color="#000" />
                    </View>
                  )}
                </View>
              );
            })}

            {isTyping && (
              <View style={[styles.bubbleWrapper, styles.agentWrapper]}>
                <View style={styles.smallAvatar}>
                  <Text style={styles.smallAvatarText}>S</Text>
                </View>
                <View style={[styles.bubble, styles.agentBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color={colors.gold} style={{ marginRight: 8 }} />
                  <Text style={[styles.messageText, styles.agentText]}> 
                    Simran is typing...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your order, menu or delivery..."
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.8}>
            <Ionicons name="send" size={16} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  pageBody: {
    flex: 1,
    paddingHorizontal: 16,
  },
  agentBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.25)",
    marginVertical: 14,
    backgroundColor: "#16130F",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(201, 168, 76, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.35)",
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
    borderColor: "#16130F",
  },
  agentInfoText: {
    flex: 1,
  },
  agentName: {
    fontSize: 14,
    fontWeight: "700",
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
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  messageScroll: {
    flex: 1,
  },
  messageContent: {
    paddingVertical: 10,
    gap: 14,
  },
  bubbleWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    width: "100%",
  },
  userWrapper: {
    justifyContent: "flex-end",
  },
  agentWrapper: {
    justifyContent: "flex-start",
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(201, 168, 76, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.25)",
  },
  smallAvatarText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.gold,
  },
  smallUserAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    maxWidth: "75%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: colors.gold,
    borderBottomRightRadius: 2,
  },
  agentBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderBottomLeftRadius: 2,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  userText: {
    color: "#000",
    fontWeight: "600",
  },
  agentText: {
    color: "#FFF",
  },
  timeText: {
    fontSize: 9,
    alignSelf: "flex-end",
    marginTop: 6,
  },
  userTimeText: {
    color: "rgba(0,0,0,0.5)",
  },
  agentTimeText: {
    color: "rgba(255,255,255,0.4)",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16130F",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.25)",
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    height: 40,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#0A0A0A",
    borderBottomWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.15)",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  tabButtonText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: "#000",
  },
});

