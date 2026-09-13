import { getSiteSettings } from "@/lib/queries";
import SubmitButton from "@/components/admin/SubmitButton";
import { updateSiteSettings, resetSiteSettings } from "./actions";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-[560px]">
      <h1 className="display-2">Settings</h1>
      <p className="lede text-[0.95rem] mt-2">Controls for the storefront hero.</p>

      <form action={updateSiteSettings} className="flex flex-col gap-4 mt-8">
        <label className="field-label">
          Hero photo label (picks a stock photo deterministically)
          <input
            name="hero_photo_label"
            defaultValue={settings.heroPhotoLabel}
            required
            className="field"
          />
        </label>
        <SubmitButton>Save changes</SubmitButton>
      </form>

      <form action={resetSiteSettings} className="mt-4">
        <button
          type="submit"
          className="text-sm text-ink-faint cursor-pointer transition-colors hover:text-warn-ink"
        >
          Reset to default
        </button>
      </form>
    </div>
  );
}
