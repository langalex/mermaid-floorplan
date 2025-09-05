import floorplanGrammar from "./floorplans.mdc?raw";

export class OpenAIChatService {
  private apiKey: string | null = null;
  private messages: Array<{ role: string; content: string }> = [];

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async sendMessage(
    userMessage: string,
    floorplanContent: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Please enter your OpenAI API key first");
    }

    if (this.messages.length === 0) {
      this.messages.push({
        role: "system",
        content: `You are a helpful assistant for a floorplan application. Users can ask questions about their floorplans, request modifications, or get help with the syntax. The current floorplan content is: ${floorplanContent}. This is how floorplans are written: ${floorplanGrammar}`,
      });
    }

    this.messages.push({
      role: "user",
      content: userMessage,
    });

    this.messages.push({
      role: "system",
      content: `When modifying the floorplan, return the modified floorplan content, surrounded with \`\`\`floorplans and \`\`\``,
    });

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: this.messages,
            max_tokens: 1000,
            temperature: 0.7,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API error: ${errorData.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      const assistantMessage =
        data.choices[0]?.message?.content ||
        "Sorry, I could not generate a response.";

      this.messages.push({
        role: "assistant",
        content: assistantMessage,
      });

      return assistantMessage;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }

  clearHistory() {
    this.messages = [];
  }

  isApiKeySet(): boolean {
    return this.apiKey !== null;
  }
}
