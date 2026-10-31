import { site } from "./site";
import type { Localized } from "./site";

type Section = { h: Localized; p: Localized };

/** Plain-language policies. Have Helibol's counsel review before launch (TODO.md). */
export const privacy: { updated: string; sections: Section[] } = {
  updated: "2026-10-31",
  sections: [
    {
      h: { es: "Quién es responsable", en: "Who is responsible" },
      p: {
        es: `${site.legalName}, ${site.address.street}, ${site.address.city}, ${site.address.country}. Contacto: ${site.email}.`,
        en: `${site.legalName}, ${site.address.street}, ${site.address.city}, ${site.address.country}. Contact: ${site.email}.`,
      },
    },
    {
      h: { es: "Qué datos recogemos", en: "What we collect" },
      p: {
        es: "Los datos que usted nos da en los formularios de cotización y contacto, o a Heli (nombre, empresa, correo, teléfono/WhatsApp y detalles de su misión), y datos técnicos básicos de navegación.",
        en: "The details you give us in the quote and contact forms, or to Heli (name, company, email, phone/WhatsApp and mission details), plus basic technical browsing data.",
      },
    },
    {
      h: { es: "Para qué los usamos", en: "Why we use it" },
      p: {
        es: "Solo para responder a su solicitud, preparar una cotización y darle seguimiento. No vendemos sus datos.",
        en: "Only to reply to your request, prepare a quote and follow up. We don't sell your data.",
      },
    },
    {
      h: { es: "Heli, nuestra asistente con IA", en: "Heli, our AI assistant" },
      p: {
        es: "Heli es una inteligencia artificial operada con la API de Anthropic (Claude). Los mensajes que le envía se procesan para generar respuestas y se guardan para mejorar el servicio y dar seguimiento. Conservamos las conversaciones con Heli durante 90 días y luego se eliminan. Heli solo toma sus datos de contacto con su consentimiento.",
        en: "Heli is an artificial intelligence running on the Anthropic API (Claude). Messages you send are processed to generate replies and stored to improve the service and follow up. We keep Heli conversations for 90 days, after which they are deleted. Heli only takes your contact details with your consent.",
      },
    },
    {
      h: { es: "Proveedores", en: "Service providers" },
      p: {
        es: "Usamos Vercel (alojamiento), Supabase (base de datos), Resend (correo) y Anthropic (Heli). Si usted lo acepta, también Google Analytics y Meta Pixel para medir el uso del sitio.",
        en: "We use Vercel (hosting), Supabase (database), Resend (email) and Anthropic (Heli). If you accept, also Google Analytics and Meta Pixel to measure site usage.",
      },
    },
    {
      h: { es: "Cookies", en: "Cookies" },
      p: {
        es: "Las cookies de analítica de terceros solo se activan si usted las acepta en el aviso de cookies. Puede cambiar su decisión borrando los datos del sitio en su navegador.",
        en: "Third-party analytics cookies only switch on if you accept them in the cookie notice. You can change your choice by clearing this site's data in your browser.",
      },
    },
    {
      h: { es: "Sus derechos", en: "Your rights" },
      p: {
        es: `Puede pedirnos acceder, corregir o eliminar sus datos escribiendo a ${site.email}.`,
        en: `You can ask us to access, correct or delete your data by writing to ${site.email}.`,
      },
    },
  ],
};

export const terms: { updated: string; sections: Section[] } = {
  updated: "2026-10-31",
  sections: [
    {
      h: { es: "Uso del sitio", en: "Use of the site" },
      p: {
        es: "Este sitio informa sobre los servicios de Helibol. El contenido es referencial y puede cambiar sin aviso.",
        en: "This site describes Helibol's services. Content is for reference and may change without notice.",
      },
    },
    {
      h: { es: "Cotizaciones", en: "Quotes" },
      p: {
        es: "Las solicitudes enviadas por el sitio o a Heli no constituyen una reserva ni una oferta. Precios, disponibilidad, horarios y aeronave se confirman por escrito por un especialista de Helibol.",
        en: "Requests sent through the site or to Heli are not a booking or an offer. Prices, availability, schedules and aircraft are confirmed in writing by a Helibol specialist.",
      },
    },
    {
      h: { es: "Especificaciones", en: "Specifications" },
      p: {
        es: "Las especificaciones de aeronaves son de referencia. La capacidad real depende de altitud, temperatura y configuración.",
        en: "Aircraft specifications are for reference. Real capacity depends on altitude, temperature and configuration.",
      },
    },
    {
      h: { es: "Heli", en: "Heli" },
      p: {
        es: "Heli es una IA y puede equivocarse. No da asesoría de seguridad de vuelo, meteorológica ni médica. En una emergencia, llame al +591 3 352 9469 y a los servicios de emergencia locales.",
        en: "Heli is an AI and can make mistakes. It does not give flight-safety, weather or medical advice. In an emergency, call +591 3 352 9469 and local emergency services.",
      },
    },
    {
      h: { es: "Propiedad intelectual", en: "Intellectual property" },
      p: {
        es: `Las fotografías, videos, logotipos y textos pertenecen a ${site.legalName}. No pueden usarse sin autorización.`,
        en: `Photographs, videos, logos and text belong to ${site.legalName}. They may not be used without permission.`,
      },
    },
  ],
};
