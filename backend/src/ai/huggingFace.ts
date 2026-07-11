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

    const data = (await response.json()) as any;

    // Robust extraction of the assistant's response content.
    // The Hugging Face chat completion endpoint may return the content in different shapes.
    // Preferred: choices[0].message.content
    // Fallbacks: choices[0].message, choices[0].text, generated_text
    let content: string | undefined;
    if (Array.isArray(data.choices) && data.choices.length > 0) {
      const firstChoice = data.choices[0];
      if (firstChoice?.message?.content) {
        content = firstChoice.message.content;
      } else if (firstChoice?.message) {
        // Some models may return a plain message string.
        content = typeof firstChoice.message === 'string' ? firstChoice.message : undefined;
      } else if (firstChoice?.text) {
        content = firstChoice.text;
      }
    }
    if (!content && typeof data?.generated_text === 'string') {
      content = data.generated_text;
    }
    if (!content) {
      // If still undefined, include the raw response for debugging.
      console.error('HF response missing expected content:', JSON.stringify(data, null, 2));
      throw new Error('HF API returned no content in response');
    }
    return content.trim();
  } finally {
    clearTimeout(timeoutId);
  }
}
