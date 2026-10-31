import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API, Next internals, static files and the legacy WordPress paths (handled by redirects()).
  matcher: [
    "/((?!api|_next|_vercel|media|about|aeronaves|services|contact-us|welcome-to-helibol-s-r-l|404-2|.*\\..*).*)",
  ],
};
