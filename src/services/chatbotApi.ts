import { BASE_URL } from "./apiConfig";

function extractAssistantText(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return "No response from server.";

  const obj = payload as Record<string, unknown>;

  // Common shapes
  const candidates = [
    obj.reply,
    obj.response,
    obj.content,
    obj.message,
    obj.answer,
    obj.output,
    obj.result,
    obj.text,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
  }

  // Sometimes APIs wrap output inside a data field
  const data = obj.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const dataObj = data as Record<string, unknown>;
    for (const c of [
      dataObj.reply,
      dataObj.response,
      dataObj.content,
      dataObj.message,
      dataObj.answer,
      dataObj.output,
      dataObj.result,
      dataObj.text,
    ]) {
      if (typeof c === "string" && c.trim()) return c;
    }
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return "Received an unreadable response from server.";
  }
}

export async function postResourcingChatbot(
  chatInput: string,
  isTestMode: boolean
): Promise<string> {
  // Support both direct FastAPI-style route (/resourcing_chatbot) and the n8n-style
  // prod/test webhook prefixes used elsewhere in this app.
  const candidates = isTestMode
    ? [
        `${BASE_URL}/webhook-test/resourcing_chatbot`,
        `${BASE_URL}/resourcing_chatbot`,
        `${BASE_URL}/webhook/resourcing_chatbot`,
      ]
    : [
        `${BASE_URL}/webhook/resourcing_chatbot`,
        `${BASE_URL}/resourcing_chatbot`,
        `${BASE_URL}/webhook-test/resourcing_chatbot`,
      ];

  let lastError: unknown = null;
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          // Send a couple common keys to maximize backend compatibility.
          input: chatInput,
          message: chatInput,
        }),
      });

      if (!res.ok) {
        // If this endpoint doesn't exist in this environment, try the next one.
        if (res.status === 404) {
          lastError = new Error(`Chatbot endpoint not found (404) at ${url}`);
          continue;
        }

        const text = await res.text().catch(() => "");
        throw new Error(
          `Chatbot API error: ${res.status}${text ? ` - ${text}` : ""}`
        );
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = (await res.json()) as unknown;
        return extractAssistantText(data);
      }

      const text = await res.text();
      return extractAssistantText(text);
    } catch (e) {
      lastError = e;
      // Try next candidate URL
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Chatbot request failed.");
}


