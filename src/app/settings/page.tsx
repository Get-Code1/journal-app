import ThemePicker from "@/components/ThemePicker";
import SettingsForm from "@/components/SettingsForm";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const settings = getSettings();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-medium tracking-tight">Settings</h1>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium">Appearance</h2>
          <p className="text-sm text-foreground-muted">
            Choose the theme that feels right for your writing.
          </p>
        </div>
        <ThemePicker />
      </section>

      <section className="flex flex-col gap-3 border-t border-border-subtle pt-6">
        <SettingsForm initialSettings={settings} />
      </section>
    </div>
  );
}
