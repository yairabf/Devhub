"use client";

import { FormField } from "@/components/dashboard/FormField";
import { useEditorPreferences } from "@/components/editor-preferences/EditorPreferencesContext";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  EDITOR_FONT_SIZES,
  EDITOR_TAB_SIZES,
  EDITOR_THEMES,
  type EditorFontSize,
  type EditorTabSize,
  type EditorTheme,
} from "@/types/editor-preferences";

const THEME_LABELS: Record<EditorTheme, string> = {
  "vs-dark": "VS Dark",
  monokai: "Monokai",
  "github-dark": "GitHub Dark",
};

export function EditorPreferencesForm() {
  const { preferences, updatePreferences } = useEditorPreferences();

  return (
    <Card className="p-6">
      <h2 className="text-sm font-medium text-foreground">Editor preferences</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Applies to every code snippet and command editor. Saved automatically.
      </p>

      <div className="mt-4 space-y-4">
        <FormField htmlFor="editor-font-size" label="Font size">
          <Select
            id="editor-font-size"
            value={preferences.fontSize}
            onChange={event =>
              updatePreferences({
                fontSize: Number(event.target.value) as EditorFontSize,
              })
            }
          >
            {EDITOR_FONT_SIZES.map(size => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </Select>
        </FormField>

        <FormField htmlFor="editor-tab-size" label="Tab size">
          <Select
            id="editor-tab-size"
            value={preferences.tabSize}
            onChange={event =>
              updatePreferences({
                tabSize: Number(event.target.value) as EditorTabSize,
              })
            }
          >
            {EDITOR_TAB_SIZES.map(size => (
              <option key={size} value={size}>
                {size} spaces
              </option>
            ))}
          </Select>
        </FormField>

        <FormField htmlFor="editor-theme" label="Editor theme">
          <Select
            id="editor-theme"
            value={preferences.theme}
            onChange={event =>
              updatePreferences({ theme: event.target.value as EditorTheme })
            }
          >
            {EDITOR_THEMES.map(theme => (
              <option key={theme} value={theme}>
                {THEME_LABELS[theme]}
              </option>
            ))}
          </Select>
        </FormField>

        <ToggleRow label="Word wrap">
          <Switch
            aria-label="Word wrap"
            checked={preferences.wordWrap}
            onCheckedChange={checked => updatePreferences({ wordWrap: checked })}
          />
        </ToggleRow>

        <ToggleRow label="Minimap">
          <Switch
            aria-label="Minimap"
            checked={preferences.minimap}
            onCheckedChange={checked => updatePreferences({ minimap: checked })}
          />
        </ToggleRow>
      </div>
    </Card>
  );
}

/** Same label styling as `FormField`, laid out as a row for a switch instead of stacked over an input. */
function ToggleRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
