export async function generateAssistantText(params: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const token = process.env.HF_API_TOKEN;

  if (!token || !token.trim()) {
    throw new Error("HF_API_TOKEN is missing");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-3-12b-it/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "google/gemma-3-12b-it",
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt },
        ],
        max_tokens: 420,
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HF API HTTP ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("HF API returned an empty response");
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}
