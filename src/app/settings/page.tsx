import ThemePicker from "@/components/ThemePicker";

export default function SettingsPage() {
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
    </div>
  );
}
