import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/home/Hero";
import { TrustBand } from "@/components/sections/home/TrustBand";
import { ServicesRail } from "@/components/sections/home/ServicesRail";
import { Story } from "@/components/sections/home/Story";
import { FleetShowroom } from "@/components/sections/home/FleetShowroom";
import { OperationsMap } from "@/components/sections/home/OperationsMap";
import { Safety } from "@/components/sections/home/Safety";
import { ScenicTeaser } from "@/components/sections/home/ScenicTeaser";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { CtaBand } from "@/components/sections/CtaBand";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <TrustBand />
      <ServicesRail />
      <Story />
      <FleetShowroom />
      <OperationsMap />
      <Safety />
      <ScenicTeaser />
      <Testimonials />
      <CtaBand />
    </>
  );
}
