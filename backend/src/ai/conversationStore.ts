import type { ConversationMemory } from "./types";

const MAX_CONVERSATIONS = 200;
const CONVERSATION_TTL_MS = 1000 * 60 * 60 * 6;

const memoryStore = new Map<string, ConversationMemory>();

function cleanupExpiredEntries() {
  const now = Date.now();

  for (const [key, value] of memoryStore.entries()) {
    if (now - value.updatedAt > CONVERSATION_TTL_MS) {
      memoryStore.delete(key);
    }
  }

  if (memoryStore.size <= MAX_CONVERSATIONS) {
    return;
  }

  const sortedEntries = [...memoryStore.entries()].sort((a, b) => a[1].updatedAt - b[1].updatedAt);
  const extraCount = sortedEntries.length - MAX_CONVERSATIONS;

  for (let index = 0; index < extraCount; index += 1) {
    memoryStore.delete(sortedEntries[index][0]);
  }
}

export function getConversationMemory(conversationId: string): ConversationMemory | undefined {
  cleanupExpiredEntries();
  return memoryStore.get(conversationId);
}

export function setConversationMemory(conversationId: string, memory: ConversationMemory): void {
  cleanupExpiredEntries();
  memoryStore.set(conversationId, {
    ...memory,
    updatedAt: Date.now(),
  });
}
