import type { Request, Response } from "express";
import { getConversationMemory, setConversationMemory } from "./conversationStore";
import { generateAssistantText } from "./huggingFace";
import { resolveIntent } from "./intentDetector";
import { buildAssistantPrompt } from "./promptBuilder";
import { buildFallbackText, formatAssistantReply } from "./responseFormatter";
import { retrieveBusinessData } from "./retrievers";
import type { AssistantDependencies, AssistantRequestBody, AssistantResponse } from "./types";

function createConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createAssistantHandler(deps: AssistantDependencies) {
  return async function assistantHandler(req: Request, res: Response) {
    const body = req.body as AssistantRequestBody;

    if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const conversationId = body.conversationId || createConversationId();
    const memory = getConversationMemory(conversationId);
    const latestMessage = body.messages[body.messages.length - 1];

    if (!latestMessage?.content?.trim()) {
      return res.status(400).json({ error: "latest message content is required" });
    }

    try {
      const intent = resolveIntent(latestMessage.content, memory);
      const retrieval = await retrieveBusinessData(deps, intent, body.userEmail);
      const prompt = buildAssistantPrompt({
        intent,
        retrieval,
        messages: body.messages,
      });

      let text: string;

      try {
        text = await generateAssistantText(prompt);
      } catch (error) {
        console.error("[Assistant] Hugging Face generation failed, using grounded fallback:", error);
        text = buildFallbackText(intent, retrieval);
      }

      const response: AssistantResponse = {
        conversationId,
        intent: intent.intent,
        reply: formatAssistantReply({
          intent,
          retrieval,
          text,
        }),
      };

      setConversationMemory(conversationId, {
        lastIntent: intent.intent,
        lastResolvedQuery: intent.resolvedMessage,
        lastTopic: intent.intent.startsWith("menu") || intent.intent === "dish_details"
          ? intent.resolvedMessage
          : memory?.lastTopic,
        lastMenuResults: retrieval.menu.slice(0, 6),
        lastNavigationRoute: retrieval.navigation[0]?.route || memory?.lastNavigationRoute,
        updatedAt: Date.now(),
      });

      return res.json(response);
    } catch (error: any) {
      console.error("[Assistant] Request failed:", error);
      return res.status(500).json({
        error: error?.message || "Assistant request failed",
      });
    }
  };
}
