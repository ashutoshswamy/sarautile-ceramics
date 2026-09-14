import { getSiteSettings } from "@/lib/queries";
import HeroSettingsForm from "@/components/admin/HeroSettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-[560px]">
      <h1 className="display-2">Settings</h1>
      <p className="lede text-[0.95rem] mt-2">
        Set the storefront hero image per screen size, with a live preview and a focus point
        to control which part of the image stays visible in the crop. Leave a field blank to
        borrow another breakpoint&apos;s image; the hero is blank until at least one is set.
      </p>

      <HeroSettingsForm
        initial={{
          hero_image_mobile: settings.heroImageMobile ?? "",
          hero_image_tablet: settings.heroImageTablet ?? "",
          hero_image_desktop: settings.heroImageDesktop ?? "",
        }}
        initialPositions={{
          hero_image_mobile: settings.heroImageMobilePosition,
          hero_image_tablet: settings.heroImageTabletPosition,
          hero_image_desktop: settings.heroImageDesktopPosition,
        }}
      />
    </div>
  );
}
