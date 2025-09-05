import * as monaco from "monaco-editor";
import { monarchConfig } from "floorplans-language";

export interface EditorInstance {
  editor: monaco.editor.IStandaloneCodeEditor;
  getValue: () => string;
  setValue: (value: string) => void;
  onDidChangeModelContent: (callback: () => void) => void;
}

export async function initializeEditor(
  containerId: string,
  initialContent: string
): Promise<EditorInstance> {
  // Register the floorplans language
  monaco.languages.register({ id: "floorplans" });

  // Use the imported monarch configuration
  monaco.languages.setLanguageConfiguration("floorplans", {
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  });

  monaco.languages.setMonarchTokensProvider("floorplans", monarchConfig);

  // Create the editor
  const editor = monaco.editor.create(document.getElementById(containerId)!, {
    value: initialContent,
    language: "floorplans",
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  });

  // Return the editor instance with callbacks
  return {
    editor,
    getValue: () => editor.getValue(),
    setValue: (value: string) => editor.setValue(value),
    onDidChangeModelContent: (callback: () => void) =>
      editor.onDidChangeModelContent(callback),
  };
}
