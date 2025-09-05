import { EmptyFileSystem } from "langium";
import { parseHelper } from "langium/test";
import type { Floorplan } from "floorplans-language";
import { createFloorplansServices } from "floorplans-language";
import render from "./renderer.js";
import { EditorInstance, initializeEditor } from "./editor.js";
import { OpenAIChatService } from "./openai-chat.js";

const services = createFloorplansServices(EmptyFileSystem);
const parse = parseHelper<Floorplan>(services.Floorplans);
const chatService = new OpenAIChatService();

export default async function main(): Promise<void> {
  const editorTemplate = document.getElementById(
    "editor-template"
  ) as HTMLTemplateElement | null;
  const initialContent = editorTemplate?.content?.textContent?.trim();

  const container = document.getElementById("svg") as SVGElement | null;
  if (!container) {
    throw new Error("Container not found");
  }

  const editorInstance = await initializeEditor(
    "editor-container",
    initialContent ?? ""
  );

  initializeChat(editorInstance);

  try {
    container.innerHTML = await renderSvg(editorInstance.getValue());
  } catch (error) {
    container.innerHTML = `<div style="color: red;">${
      (error as Error).message
    }</div>`;
  }

  editorInstance.onDidChangeModelContent(async () => {
    try {
      container.innerHTML = await renderSvg(editorInstance.getValue());
    } catch (error) {
      container.innerHTML = `<div style="color: red;">${
        (error as Error).message
      }</div>`;
    }
  });
}

function initializeChat(editorInstance: EditorInstance) {
  const chatMessages = document.getElementById("chat-messages") as HTMLElement;
  const chatInput = document.getElementById("chat-input") as HTMLInputElement;
  const sendButton = document.getElementById(
    "send-button"
  ) as HTMLButtonElement;
  const apiKeyInput = document.getElementById(
    "api-key-input"
  ) as HTMLInputElement;
  const saveApiKeyButton = document.getElementById(
    "save-api-key"
  ) as HTMLButtonElement;
  const removeApiKeyButton = document.getElementById(
    "remove-api-key"
  ) as HTMLButtonElement;
  const apiKeyStatus = document.getElementById("api-key-status") as HTMLElement;
  const modelSelect = document.getElementById(
    "model-select"
  ) as HTMLSelectElement;

  // Load saved API key and model
  const savedApiKey = localStorage.getItem("openai_api_key");
  const savedModel = localStorage.getItem("openai_model") || "gpt-3.5-turbo";

  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
    chatService.setApiKey(savedApiKey);
    updateChatUI(true);
    removeApiKeyButton.style.display = "inline-block";
  }

  modelSelect.value = savedModel;
  chatService.setModel(savedModel);

  function updateChatUI(apiKeyValid: boolean) {
    if (apiKeyValid) {
      apiKeyStatus.textContent = "✅ API key saved and valid";
      apiKeyStatus.className = "api-key-status valid";
      chatInput.disabled = false;
      sendButton.disabled = false;
      removeApiKeyButton.style.display = "inline-block";
    } else {
      apiKeyStatus.textContent = "Please enter a valid OpenAI API key";
      apiKeyStatus.className = "api-key-status invalid";
      chatInput.disabled = true;
      sendButton.disabled = true;
      removeApiKeyButton.style.display = "none";
    }
  }

  function addMessage(
    content: string,
    isUser: boolean,
    isLoading: boolean = false
  ) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${
      isUser
        ? "user-message"
        : isLoading
        ? "loading-message"
        : "assistant-message"
    }`;

    if (isLoading) {
      messageDiv.innerHTML = `
        <span>Thinking</span>
        <div class="loading-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      `;
    } else {
      messageDiv.textContent = content;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
  }

  function extractFloorplanContent(response: string): {
    floorplan: string | null;
    cleanedResponse: string;
  } {
    const floorplanRegex = /```\n*fp\n([\s\S]*?)\n```/g;
    const match = floorplanRegex.exec(response);

    if (match) {
      const floorplan = match[1].trim();
      const cleanedResponse = response.replace(floorplanRegex, "").trim();
      return { floorplan, cleanedResponse };
    }

    return { floorplan: null, cleanedResponse: response };
  }

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    chatInput.value = "";
    sendButton.disabled = true;

    // Show loading indicator
    const loadingMessage = addMessage("", false, true);

    try {
      const response = await chatService.sendMessage(
        message,
        editorInstance.getValue()
      );

      const { floorplan, cleanedResponse } = extractFloorplanContent(response);

      // If floorplan content was found, update the editor
      if (floorplan) {
        editorInstance.setValue(floorplan);
      }

      // Replace loading message with actual response (cleaned of floorplan content)
      loadingMessage.className = "message assistant-message";
      loadingMessage.textContent = cleanedResponse;
    } catch (error) {
      // Replace loading message with error
      loadingMessage.className = "message assistant-message";
      loadingMessage.textContent = "Error: " + (error as Error).message;
    } finally {
      sendButton.disabled = false;
    }
  }

  async function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      apiKeyStatus.textContent = "Please enter an API key";
      apiKeyStatus.className = "api-key-status invalid";
      return;
    }

    saveApiKeyButton.disabled = true;
    saveApiKeyButton.textContent = "Validating...";

    try {
      const isValid = await chatService.validateApiKey(apiKey);
      if (isValid) {
        chatService.setApiKey(apiKey);
        localStorage.setItem("openai_api_key", apiKey);
        updateChatUI(true);
      } else {
        apiKeyStatus.textContent =
          "Invalid API key. Please check and try again.";
        apiKeyStatus.className = "api-key-status invalid";
      }
    } catch (error) {
      apiKeyStatus.textContent = "Error validating API key. Please try again.";
      apiKeyStatus.className = "api-key-status invalid";
    } finally {
      saveApiKeyButton.disabled = false;
      saveApiKeyButton.textContent = "Save API Key";
    }
  }

  function removeApiKey() {
    localStorage.removeItem("openai_api_key");
    chatService.setApiKey("");
    apiKeyInput.value = "";
    updateChatUI(false);
  }

  function updateModel() {
    const selectedModel = modelSelect.value;
    chatService.setModel(selectedModel);
    localStorage.setItem("openai_model", selectedModel);
  }

  saveApiKeyButton.addEventListener("click", saveApiKey);
  removeApiKeyButton.addEventListener("click", removeApiKey);
  modelSelect.addEventListener("change", updateModel);
  apiKeyInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveApiKey();
    }
  });

  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
}

async function renderSvg(input: string): Promise<string> {
  const doc = await parse(input);
  if (doc.parseResult.parserErrors.length) {
    throw new Error(doc.parseResult.parserErrors.join("\n"));
  }
  const svg = await render(doc);
  return svg;
}

main();
