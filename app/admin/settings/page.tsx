import { getSiteSettings } from "@/lib/queries";
import HeroSettingsForm from "@/components/admin/HeroSettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-[560px]">
      <h1 className="display-2">Settings</h1>
      <p className="lede text-[0.95rem] mt-2">
        Set the storefront hero image per screen size, with a live preview. Leave a field
        blank to fall back to the default photo.
      </p>

      <HeroSettingsForm
        initial={{
          hero_image_mobile: settings.heroImageMobile ?? "",
          hero_image_tablet: settings.heroImageTablet ?? "",
          hero_image_desktop: settings.heroImageDesktop ?? "",
        }}
      />
    </div>
  );
}
