import type { ImageKey } from "./media";
import type { Localized, LocalizedList } from "./site";

export type ServiceSlug =
  | "energia-y-mineria"
  | "rescate-y-medevac"
  | "combate-de-incendios"
  | "carga-y-construccion"
  | "vip-y-turismo"
  | "cine-y-fotografia";

export type StepIcon =
  "search" | "route" | "plane" | "shield" | "clock" | "phone" | "droplets" | "users" | "camera" | "package";

export type Service = {
  slug: ServiceSlug;
  index: string;
  /** Home rail title + one-liner (plan §6.4). */
  title: Localized;
  line: Localized;
  /** Detail page (plan §7). */
  h1: Localized;
  promise: Localized;
  challenge: Localized;
  steps: { icon: StepIcon; title: Localized; body: Localized }[];
  capabilities: LocalizedList;
  aircraft: Array<"bell-212" | "bell-412" | "h125">;
  operationId?: string;
  faqs: { q: Localized; a: Localized }[];
  card: ImageKey;
  hero: ImageKey;
  emergency?: boolean;
  /** Pre-fill for the quote form / Heli. */
  quoteType: "energy" | "rescue" | "fire" | "cargo" | "vip" | "scenic" | "film";
};

const specialistConfirms: Localized = {
  es: "Cada misión es distinta. Un especialista confirma aeronave, tiempos y costos después de conocer su requerimiento; no publicamos tarifas.",
  en: "Every mission is different. A specialist confirms aircraft, timing and costs once we understand your requirement — we don't publish rates.",
};

export const services: Service[] = [
  {
    slug: "energia-y-mineria",
    index: "01",
    title: { es: "Energía y Minería", en: "Energy & Mining" },
    line: {
      es: "Sísmica, perforación y campamentos donde no hay caminos.",
      en: "Seismic, drilling and camp support where there are no roads.",
    },
    h1: {
      es: "Logística aérea para la exploración más exigente.",
      en: "Air logistics for the toughest exploration.",
    },
    promise: {
      es: "Más de 100 proyectos de exploración en Bolivia, Argentina y Perú, bajo estándares IOGP.",
      en: "100+ exploration projects across Bolivia, Argentina and Peru, flown to IOGP standards.",
    },
    challenge: {
      es: "Las campañas de exploración ocurren donde no llegan los caminos: selva, pie de monte y altiplano. Cada día de retraso cuesta, y cada movimiento de personal y carga debe ser seguro, trazable y auditado.",
      en: "Exploration happens where roads don't reach: jungle, foothills and altiplano. Every day of delay is expensive, and every movement of crew and cargo has to be safe, traceable and auditable.",
    },
    steps: [
      {
        icon: "search",
        title: { es: "Planificamos con su equipo", en: "We plan with your team" },
        body: {
          es: "Revisamos el área, las altitudes, los pesos y el cronograma del proyecto junto a su HSE y operaciones.",
          en: "We review the area, altitudes, payloads and project schedule alongside your HSE and operations teams.",
        },
      },
      {
        icon: "plane",
        title: { es: "Asignamos la aeronave exacta", en: "We assign the right aircraft" },
        body: {
          es: "Bell 212 para carga pesada y movimientos de taladro; H125 para trabajo en altura y apoyo ligero.",
          en: "Bell 212 for heavy lifts and drill moves; H125 for high-altitude work and light support.",
        },
      },
      {
        icon: "shield",
        title: { es: "Operamos y reportamos", en: "We fly and report" },
        body: {
          es: "Tripulaciones con experiencia en campo, reportes diarios y cumplimiento de los estándares de la operadora.",
          en: "Field-experienced crews, daily reporting and compliance with the operator's standards.",
        },
      },
    ],
    capabilities: {
      es: [
        "Adquisición sísmica",
        "Movimientos de equipos de perforación",
        "Apoyo a campamentos",
        "Transporte de muestras",
        "Geofísica y aeromagnetometría",
        "Trabajo geológico de campo",
        "Despliegue de respuesta ambiental",
      ],
      en: [
        "Seismic acquisition",
        "Drill moves",
        "Camp support",
        "Sample transport",
        "Geophysics and aeromagnetics",
        "Geological field work",
        "Environmental-response deployment",
      ],
    },
    aircraft: ["bell-212", "h125"],
    operationId: "sara-boomerang-2023",
    faqs: [
      {
        q: { es: "¿En qué países operan?", en: "Which countries do you operate in?" },
        a: {
          es: "Tenemos base en Santa Cruz de la Sierra y hemos operado proyectos en Bolivia, Argentina y Perú.",
          en: "We're based in Santa Cruz de la Sierra and have flown projects in Bolivia, Argentina and Peru.",
        },
      },
      {
        q: { es: "¿Cumplen estándares de la industria?", en: "Do you meet industry standards?" },
        a: {
          es: "Sí. Cumplimos estándares IOGP y hemos sido auditados y aprobados por operadoras internacionales.",
          en: "Yes. We meet IOGP standards and have been audited and approved by international operators.",
        },
      },
      {
        q: {
          es: "¿Pueden apoyar campañas sísmicas de varios meses?",
          en: "Can you support multi-month seismic campaigns?",
        },
        a: {
          es: "Sí. Es el núcleo de nuestro trabajo desde hace décadas. Diseñamos el apoyo aéreo según la duración y logística de la campaña.",
          en: "Yes — it has been the core of our work for decades. We size the air support to the campaign's length and logistics.",
        },
      },
      {
        q: { es: "¿Cuánto cuesta?", en: "How much does it cost?" },
        a: specialistConfirms,
      },
    ],
    card: "bell212-jungle",
    hero: "logistics-camp",
    quoteType: "energy",
  },
  {
    slug: "rescate-y-medevac",
    index: "02",
    title: { es: "Rescate y MEDEVAC", en: "Rescue & MEDEVAC" },
    line: {
      es: "Cuando cada minuto cuenta, despegamos.",
      en: "When every minute counts, we're already airborne.",
    },
    h1: { es: "Cuando cada minuto cuenta.", en: "When every minute counts." },
    promise: {
      es: "Búsqueda y rescate, evacuación aeromédica y apoyo a emergencias. Línea 24/7.",
      en: "Search and rescue, medical evacuation and emergency support. 24/7 line.",
    },
    challenge: {
      es: "En una emergencia, la distancia y el terreno son el enemigo. Una persona herida en la selva o la montaña puede estar a días de un hospital por tierra, y a minutos por aire.",
      en: "In an emergency, distance and terrain are the enemy. Someone injured in the jungle or the mountains can be days from a hospital by road — and minutes by air.",
    },
    steps: [
      {
        icon: "phone",
        title: { es: "Llame a la línea 24/7", en: "Call the 24/7 line" },
        body: {
          es: "Coordinamos de inmediato con usted, el equipo médico y las autoridades.",
          en: "We coordinate immediately with you, the medical team and the authorities.",
        },
      },
      {
        icon: "clock",
        title: { es: "Despacho de la aeronave", en: "Aircraft dispatched" },
        body: {
          es: "Asignamos la aeronave y tripulación disponibles más adecuadas para la misión.",
          en: "We assign the most suitable available aircraft and crew for the mission.",
        },
      },
      {
        icon: "shield",
        title: { es: "Evacuación y entrega", en: "Evacuation and handover" },
        body: {
          es: "Trasladamos al paciente o al equipo de rescate y lo entregamos al centro de atención.",
          en: "We fly the patient or rescue team out and hand over to the receiving facility.",
        },
      },
    ],
    capabilities: {
      es: [
        "Búsqueda y rescate (SAR)",
        "Evacuación aeromédica (MEDEVAC)",
        "Apoyo a emergencias médicas",
        "Inserción de equipos de rescate",
      ],
      en: [
        "Search and rescue (SAR)",
        "Medical evacuation (MEDEVAC)",
        "Medical emergency support",
        "Rescue team insertion",
      ],
    },
    aircraft: ["bell-412", "bell-212"],
    faqs: [
      {
        q: { es: "¿Cómo solicito una evacuación?", en: "How do I request an evacuation?" },
        a: {
          es: "Llame directamente a +591 3 352 9469. Para emergencias con riesgo de vida, llame también a los servicios de emergencia locales.",
          en: "Call +591 3 352 9469 directly. For life-threatening emergencies, also call local emergency services.",
        },
      },
      {
        q: { es: "¿Atienden fuera de horario?", en: "Do you respond out of hours?" },
        a: {
          es: "Sí, mantenemos una línea de respuesta a emergencias 24/7.",
          en: "Yes, we keep a 24/7 emergency response line.",
        },
      },
      {
        q: {
          es: "¿Ofrecen contratos de respaldo MEDEVAC para proyectos?",
          en: "Do you offer MEDEVAC standby contracts for projects?",
        },
        a: {
          es: "Sí. Podemos diseñar un esquema de respaldo aeromédico para su campaña. Un especialista le asesora.",
          en: "Yes. We can design an aeromedical standby plan for your campaign. A specialist will advise you.",
        },
      },
      {
        q: { es: "¿Cuánto cuesta?", en: "How much does it cost?" },
        a: specialistConfirms,
      },
    ],
    card: "rescue-skid",
    // ig_18 (rescue-crew) is 480px — small cards only (plan §5).
    hero: "bw-headon",
    emergency: true,
    quoteType: "rescue",
  },
  {
    slug: "combate-de-incendios",
    index: "03",
    title: { es: "Combate de Incendios", en: "Aerial Firefighting" },
    line: {
      es: "1.220 litros por descarga. Precisión cuando el fuego avanza.",
      en: "1,220 litres per drop. Precision when the fire won't wait.",
    },
    h1: { es: "Agua precisa, donde el fuego avanza.", en: "Precise water, right where the fire is." },
    promise: {
      es: "Bambi Bucket de 1.220 litros por descarga e inserción de brigadas.",
      en: "A 1,220-litre Bambi Bucket per drop, plus crew insertion.",
    },
    challenge: {
      es: "Los incendios forestales en Bolivia avanzan rápido y en terreno difícil. La diferencia la hacen la precisión de cada descarga y la capacidad de llevar brigadistas al frente del fuego.",
      en: "Wildfires in Bolivia move fast across difficult terrain. What makes the difference is the precision of every drop and the ability to put firefighters on the fire line.",
    },
    steps: [
      {
        icon: "route",
        title: { es: "Coordinación con el mando", en: "Coordination with command" },
        body: {
          es: "Trabajamos con las autoridades y el mando del incidente para definir prioridades.",
          en: "We work with the authorities and incident command to set priorities.",
        },
      },
      {
        icon: "droplets",
        title: { es: "Descargas precisas", en: "Precise drops" },
        body: {
          es: "Bambi Bucket de 1.220 litros por descarga, con fuentes de agua cercanas al frente.",
          en: "1,220 litres per Bambi Bucket drop, using water sources close to the fire line.",
        },
      },
      {
        icon: "users",
        title: { es: "Inserción de brigadas", en: "Crew insertion" },
        body: {
          es: "El Bell 212 transporta de 12 a 13 brigadistas hasta el frente del fuego.",
          en: "The Bell 212 carries 12–13 firefighters to the fire line.",
        },
      },
    ],
    capabilities: {
      es: [
        "Bambi Bucket: 1.220 L por descarga",
        "Bell 212 como referencia de combate Categoría 2",
        "Inserción de 12–13 brigadistas",
        "Reconocimiento aéreo",
      ],
      en: [
        "Bambi Bucket: 1,220 L per drop",
        "Bell 212 as a Category-2 firefighting reference",
        "Insertion of 12–13 firefighters",
        "Aerial reconnaissance",
      ],
    },
    aircraft: ["bell-212"],
    faqs: [
      {
        q: { es: "¿Cuánta agua lleva cada descarga?", en: "How much water does each drop carry?" },
        a: {
          es: "Nuestro Bambi Bucket descarga hasta 1.220 litros por vuelo.",
          en: "Our Bambi Bucket releases up to 1,220 litres per run.",
        },
      },
      {
        q: { es: "¿Trabajan con instituciones públicas?", en: "Do you work with public institutions?" },
        a: {
          es: "Sí. Apoyamos a gobiernos, municipios y organizaciones en la temporada de incendios.",
          en: "Yes. We support governments, municipalities and organisations during fire season.",
        },
      },
      {
        q: { es: "¿Cuánto cuesta?", en: "How much does it cost?" },
        a: specialistConfirms,
      },
    ],
    card: "fire-drop",
    hero: "fire-bambi",
    quoteType: "fire",
  },
  {
    slug: "carga-y-construccion",
    index: "04",
    title: { es: "Carga y Construcción", en: "Cargo & Construction" },
    line: {
      es: "Long-line, montaje e inspección: la grúa que vuela.",
      en: "Long-line, lifting and inspection: the crane that flies.",
    },
    h1: { es: "La grúa que vuela.", en: "The crane that flies." },
    promise: {
      es: "Carga interna y externa, long-line, montaje de torres e inspección.",
      en: "Internal and external cargo, long-line, tower erection and inspection.",
    },
    challenge: {
      es: "Llevar materiales a una cumbre, una torre o un sitio sin acceso exige precisión al centímetro. Construir caminos o helipuertos sería más lento, más caro y más invasivo.",
      en: "Getting material to a summit, a tower or a site with no access takes centimetre precision. Building roads or helipads would be slower, costlier and more invasive.",
    },
    steps: [
      {
        icon: "package",
        title: { es: "Analizamos la carga", en: "We study the load" },
        body: {
          es: "Peso, dimensiones, altitud y distancia determinan la aeronave y la técnica.",
          en: "Weight, dimensions, altitude and distance decide the aircraft and the technique.",
        },
      },
      {
        icon: "route",
        title: { es: "Plan de izaje", en: "Lift plan" },
        body: {
          es: "Definimos la secuencia, las zonas de carga y descarga y la comunicación con tierra.",
          en: "We define the sequence, pick-up and drop zones and ground communications.",
        },
      },
      {
        icon: "plane",
        title: { es: "Ejecución precisa", en: "Precise execution" },
        body: {
          es: "Pilotos con experiencia en long-line colocan la carga donde se necesita.",
          en: "Long-line-experienced pilots place the load exactly where it's needed.",
        },
      },
    ],
    capabilities: {
      es: [
        "Carga interna y externa",
        "Operaciones long-line",
        "Construcción de torres y líneas",
        "Inspección",
        "Levantamientos aéreos",
      ],
      en: [
        "Internal and external cargo",
        "Long-line operations",
        "Tower and line construction",
        "Inspection",
        "Aerial survey",
      ],
    },
    aircraft: ["bell-212", "h125"],
    faqs: [
      {
        q: { es: "¿Cuánto peso pueden levantar?", en: "How much can you lift?" },
        a: {
          es: "Depende de la aeronave, la altitud y la temperatura. Como referencia, el Bell 212 hasta 2.041 kg en el gancho y el H125 hasta 1.400 kg. Un especialista confirma la capacidad para su caso.",
          en: "It depends on the aircraft, altitude and temperature. As a guide, the Bell 212 lifts up to 2,041 kg on the hook and the H125 up to 1,400 kg. A specialist confirms capacity for your case.",
        },
      },
      {
        q: { es: "¿Qué es el long-line?", en: "What is long-line?" },
        a: {
          es: "Es transportar carga colgada de una línea larga bajo el helicóptero. Permite trabajar en sitios sin espacio para aterrizar y reduce la necesidad de abrir helipuertos.",
          en: "Carrying a load slung on a long line beneath the helicopter. It lets us work where there's no room to land and reduces the need to clear helipads.",
        },
      },
      {
        q: { es: "¿Cuánto cuesta?", en: "How much does it cost?" },
        a: specialistConfirms,
      },
    ],
    card: "cargo-pair",
    hero: "h125-longline",
    quoteType: "cargo",
  },
  {
    slug: "vip-y-turismo",
    index: "05",
    title: { es: "VIP y Vuelos Panorámicos", en: "VIP & Scenic Flights" },
    line: {
      es: "Bolivia desde arriba, con tu familia o tu equipo.",
      en: "See Bolivia from above, with your family or your team.",
    },
    h1: { es: "Llegue descansado. Llegue a tiempo.", en: "Arrive rested. Arrive on time." },
    promise: {
      es: "Traslados ejecutivos, transporte de personal, eventos y vuelos panorámicos.",
      en: "Executive transfers, personnel transport, events and scenic flights.",
    },
    challenge: {
      es: "Un viaje de horas por carretera puede ser un vuelo de minutos. Para ejecutivos, equipos y familias, el tiempo y la tranquilidad valen tanto como el destino.",
      en: "Hours on the road can be minutes in the air. For executives, teams and families, time and peace of mind matter as much as the destination.",
    },
    steps: [
      {
        icon: "route",
        title: { es: "Cuéntenos su viaje", en: "Tell us your trip" },
        body: {
          es: "Origen, destino, fecha y número de pasajeros.",
          en: "Origin, destination, date and number of passengers.",
        },
      },
      {
        icon: "shield",
        title: { es: "Confirmamos ruta y clima", en: "We confirm route and weather" },
        body: {
          es: "Un especialista confirma la aeronave, el horario y las condiciones.",
          en: "A specialist confirms the aircraft, timing and conditions.",
        },
      },
      {
        icon: "plane",
        title: { es: "Vuele con tranquilidad", en: "Fly with peace of mind" },
        body: {
          es: "Tripulación profesional y, si lo desea, interior VIP en el Bell 412.",
          en: "Professional crew and, if you wish, a VIP interior on the Bell 412.",
        },
      },
    ],
    capabilities: {
      es: [
        "Traslados VIP y ejecutivos",
        "Interior VIP en Bell 412",
        "Transporte de personal",
        "Eventos",
        "Vuelos panorámicos",
      ],
      en: [
        "VIP and executive transfers",
        "Bell 412 VIP interior",
        "Personnel transport",
        "Events",
        "Scenic flights",
      ],
    },
    aircraft: ["bell-412", "h125"],
    faqs: [
      {
        q: { es: "¿Cuántos pasajeros pueden viajar?", en: "How many passengers can fly?" },
        a: {
          es: "Hasta 14 pasajeros en el Bell 412 y hasta 5 en el H125, según configuración.",
          en: "Up to 14 passengers on the Bell 412 and up to 5 on the H125, depending on configuration.",
        },
      },
      {
        q: { es: "¿Ofrecen vuelos panorámicos?", en: "Do you offer scenic flights?" },
        a: {
          es: "Sí, a pedido. Visite nuestra página de Vuelos Panorámicos o consulte disponibilidad.",
          en: "Yes, on request. Visit our Scenic Flights page or ask about availability.",
        },
      },
      {
        q: { es: "¿Cuánto cuesta?", en: "How much does it cost?" },
        a: specialistConfirms,
      },
    ],
    card: "scenic-waterfall",
    hero: "bell412-golden-hour",
    quoteType: "vip",
  },
  {
    slug: "cine-y-fotografia",
    index: "06",
    title: { es: "Cine y Fotografía", en: "Film & Photography" },
    line: { es: "Plataformas aéreas para tomas imposibles.", en: "Aerial platforms for impossible shots." },
    h1: { es: "Tomas imposibles, vuelo preciso.", en: "Impossible shots, precise flying." },
    promise: {
      es: "Plataformas de cámara para televisión, cine y publicidad.",
      en: "Camera platforms for TV, film and advertising.",
    },
    challenge: {
      es: "Una gran toma aérea depende de un piloto que entienda el encuadre, la luz y el movimiento, y que repita la pasada con exactitud.",
      en: "A great aerial shot depends on a pilot who understands framing, light and movement — and can repeat the pass exactly.",
    },
    steps: [
      {
        icon: "camera",
        title: { es: "Revisamos el guion", en: "We review the brief" },
        body: {
          es: "Tomas, locaciones, horarios de luz y equipo de cámara.",
          en: "Shots, locations, light windows and camera equipment.",
        },
      },
      {
        icon: "route",
        title: { es: "Planificamos las pasadas", en: "We plan the passes" },
        body: {
          es: "Coordinamos permisos, rutas y comunicación con el director.",
          en: "We coordinate permits, routes and communication with the director.",
        },
      },
      {
        icon: "plane",
        title: { es: "Volamos la toma", en: "We fly the shot" },
        body: {
          es: "Vuelo estable y repetible para que el equipo consiga la imagen.",
          en: "Stable, repeatable flying so the crew gets the shot.",
        },
      },
    ],
    capabilities: {
      es: [
        "Plataformas de cámara aérea",
        "Televisión, cine y publicidad",
        "Vuelos de fotografía",
        "Locaciones remotas",
      ],
      en: ["Aerial camera platforms", "TV, film and advertising", "Photography flights", "Remote locations"],
    },
    aircraft: ["h125", "bell-412"],
    faqs: [
      {
        q: { es: "¿Pueden volar en locaciones remotas?", en: "Can you fly at remote locations?" },
        a: {
          es: "Sí. Operamos en selva, altiplano y montaña en toda Bolivia.",
          en: "Yes. We fly over jungle, altiplano and mountains across Bolivia.",
        },
      },
      {
        q: { es: "¿Cuánto cuesta?", en: "How much does it cost?" },
        a: specialistConfirms,
      },
    ],
    card: "h125-longline",
    hero: "hero-mountain-edge",
    quoteType: "film",
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
