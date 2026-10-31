import { siInstagram, siFacebook, siWhatsapp, siYoutube, siTiktok } from "simple-icons";
import { whatsappHref } from "./site";

/** Plan §9. Entries with an empty URL are never rendered — no dead links. */
export type Social = { name: string; url: string; path: string; verified: boolean };

// LinkedIn was removed from simple-icons for trademark reasons; inline path from the LinkedIn brand kit.
const linkedinPath =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

export const socials: Social[] = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/helibolhelicopters/",
    path: siInstagram.path,
    verified: true,
  },
  // VERIFY exact URLs with the client (plan §12.6)
  { name: "Facebook", url: "https://www.facebook.com/helibol", path: siFacebook.path, verified: false },
  { name: "LinkedIn", url: "https://www.linkedin.com/company/helibol", path: linkedinPath, verified: false },
  { name: "WhatsApp", url: whatsappHref(), path: siWhatsapp.path, verified: false },
  { name: "YouTube", url: "", path: siYoutube.path, verified: false },
  { name: "TikTok", url: "", path: siTiktok.path, verified: false },
];

export const visibleSocials = () => socials.filter((s) => s.url.trim().length > 0);
