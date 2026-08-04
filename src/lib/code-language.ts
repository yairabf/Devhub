/**
 * Language is free text on an item — a user types "TS", "bash" or nothing at
 * all — while Monaco only tokenizes ids it knows. These two helpers are the
 * translation layer: one for Monaco, one for the editor header.
 */

interface LanguageEntry {
  /** The Monaco language id. */
  id: string;
  /** How the editor header spells it. */
  label: string;
}

export const PLAIN_TEXT_LANGUAGE_ID = "plaintext";

/**
 * Aliases the user might plausibly type → Monaco id + display label. Monaco has
 * no separate tsx/jsx tokenizer, so those fold into typescript/javascript, and
 * every shell dialect folds into `shell`.
 */
const LANGUAGES: Record<string, LanguageEntry> = {
  bash: { id: "shell", label: "Bash" },
  c: { id: "c", label: "C" },
  "c#": { id: "csharp", label: "C#" },
  "c++": { id: "cpp", label: "C++" },
  cpp: { id: "cpp", label: "C++" },
  cs: { id: "csharp", label: "C#" },
  csharp: { id: "csharp", label: "C#" },
  css: { id: "css", label: "CSS" },
  dockerfile: { id: "dockerfile", label: "Dockerfile" },
  go: { id: "go", label: "Go" },
  golang: { id: "go", label: "Go" },
  graphql: { id: "graphql", label: "GraphQL" },
  html: { id: "html", label: "HTML" },
  java: { id: "java", label: "Java" },
  javascript: { id: "javascript", label: "JavaScript" },
  js: { id: "javascript", label: "JavaScript" },
  json: { id: "json", label: "JSON" },
  jsx: { id: "javascript", label: "JSX" },
  kotlin: { id: "kotlin", label: "Kotlin" },
  kt: { id: "kotlin", label: "Kotlin" },
  markdown: { id: "markdown", label: "Markdown" },
  md: { id: "markdown", label: "Markdown" },
  php: { id: "php", label: "PHP" },
  py: { id: "python", label: "Python" },
  python: { id: "python", label: "Python" },
  rb: { id: "ruby", label: "Ruby" },
  ruby: { id: "ruby", label: "Ruby" },
  rs: { id: "rust", label: "Rust" },
  rust: { id: "rust", label: "Rust" },
  scss: { id: "scss", label: "SCSS" },
  sh: { id: "shell", label: "Shell" },
  shell: { id: "shell", label: "Shell" },
  sql: { id: "sql", label: "SQL" },
  swift: { id: "swift", label: "Swift" },
  text: { id: PLAIN_TEXT_LANGUAGE_ID, label: "Plain text" },
  toml: { id: "ini", label: "TOML" },
  ts: { id: "typescript", label: "TypeScript" },
  tsx: { id: "typescript", label: "TSX" },
  typescript: { id: "typescript", label: "TypeScript" },
  xml: { id: "xml", label: "XML" },
  yaml: { id: "yaml", label: "YAML" },
  yml: { id: "yaml", label: "YAML" },
  zsh: { id: "shell", label: "Zsh" },
};

function lookup(language: string | null | undefined): LanguageEntry | undefined {
  if (!language) return undefined;
  return LANGUAGES[language.trim().toLowerCase()];
}

/**
 * The Monaco language id for a stored language. Falls back to plaintext, which
 * is what an unknown or missing language should highlight as — Monaco throws no
 * error for an unregistered id, it just silently stops tokenizing.
 */
export function getMonacoLanguageId(language: string | null | undefined): string {
  return lookup(language)?.id ?? PLAIN_TEXT_LANGUAGE_ID;
}

/**
 * What the editor header shows. Known languages get their canonical casing;
 * anything else is echoed back trimmed, so a language we have no entry for is
 * still displayed rather than dropped.
 */
export function getLanguageLabel(language: string | null | undefined): string {
  const entry = lookup(language);
  if (entry) return entry.label;
  return language?.trim() ?? "";
}
