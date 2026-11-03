import type { AircraftSlug } from "./fleet";
import type { Localized } from "./site";

/**
 * WhatsApp planner: the site's main call to action. Each topic maps to one of Helibol's
 * services and asks only the questions a specialist needs to answer that kind of request.
 * The answers become a pre-written WhatsApp message (see components/forms/WhatsAppPlanner).
 */
export type PlannerTopicKey = "energy" | "rescue" | "fire" | "cargo" | "vip" | "scenic" | "film" | "general";

export type PlannerChoice = {
  key: string;
  /** Question shown above the chips. */
  label: Localized;
  /** Short label used in the WhatsApp message ("*Tipo de trabajo:* Sísmica"). */
  short: Localized;
  options: Localized[];
};

export type PlannerTopic = {
  key: PlannerTopicKey;
  title: Localized;
  line: Localized;
  choices: PlannerChoice[];
  /** Label for the location field (zone, route, departure point…). */
  place: Localized;
  /** Label for the date field. */
  date: Localized;
  /** Show the passenger counter. */
  pax?: boolean;
  /** Aircraft offered as preferences (in order). Empty → no aircraft question. */
  aircraft: AircraftSlug[];
  /** Rescue / fire: show the 24/7 call-now banner. */
  urgent?: boolean;
};

const notSure: Localized = { es: "No estoy seguro", en: "Not sure" };
const other: Localized = { es: "Otro", en: "Other" };

export const plannerTopics: PlannerTopic[] = [
  {
    key: "energy",
    title: { es: "Energía y minería", en: "Energy & mining" },
    line: {
      es: "Sísmica, perforación, campamentos y cambios de turno",
      en: "Seismic, drilling, camp support and crew changes",
    },
    choices: [
      {
        key: "work",
        label: { es: "¿Qué tipo de trabajo?", en: "What kind of work?" },
        short: { es: "Tipo de trabajo", en: "Type of work" },
        options: [
          { es: "Sísmica", en: "Seismic" },
          { es: "Perforación / mover taladro", en: "Drilling / rig move" },
          { es: "Apoyo a campamento", en: "Camp support" },
          { es: "Cambio de turno", en: "Crew change" },
          other,
        ],
      },
      {
        key: "length",
        label: { es: "Duración estimada", en: "Estimated duration" },
        short: { es: "Duración", en: "Duration" },
        options: [
          { es: "Unos días", en: "A few days" },
          { es: "Semanas", en: "Weeks" },
          { es: "Campaña de meses", en: "Months-long campaign" },
          notSure,
        ],
      },
    ],
    place: { es: "Zona del proyecto (departamento, bloque…)", en: "Project area (region, block…)" },
    date: { es: "Fecha de inicio", en: "Start date" },
    aircraft: ["bell-212", "h125"],
  },
  {
    key: "rescue",
    title: { es: "Rescate y MEDEVAC", en: "Rescue & MEDEVAC" },
    line: {
      es: "Evacuación médica, búsqueda y cobertura para su operación",
      en: "Medical evacuation, search and standby cover for your operation",
    },
    choices: [
      {
        key: "need",
        label: { es: "¿Qué necesita?", en: "What do you need?" },
        short: { es: "Solicitud", en: "Request" },
        options: [
          { es: "Evacuación médica", en: "Medical evacuation" },
          { es: "Búsqueda y rescate", en: "Search & rescue" },
          { es: "Cobertura MEDEVAC para mi proyecto", en: "MEDEVAC cover for my project" },
          other,
        ],
      },
    ],
    place: { es: "Ubicación o zona", en: "Location or area" },
    date: { es: "Desde cuándo", en: "From when" },
    aircraft: ["bell-412", "bell-212"],
    urgent: true,
  },
  {
    key: "fire",
    title: { es: "Combate de incendios", en: "Firefighting" },
    line: {
      es: "Descarga de agua con helibalde y traslado de brigadas",
      en: "Bucket water drops and crew insertion",
    },
    choices: [
      {
        key: "need",
        label: { es: "¿Qué necesita?", en: "What do you need?" },
        short: { es: "Solicitud", en: "Request" },
        options: [
          { es: "Incendio activo", en: "Active fire" },
          { es: "Contrato de temporada", en: "Seasonal contract" },
          { es: "Traslado de brigadas", en: "Crew transport" },
          other,
        ],
      },
      {
        key: "area",
        label: { es: "Superficie aproximada", en: "Approximate area" },
        short: { es: "Superficie", en: "Area" },
        options: [
          { es: "Menos de 100 ha", en: "Under 100 ha" },
          { es: "100 – 1.000 ha", en: "100 – 1,000 ha" },
          { es: "Más de 1.000 ha", en: "Over 1,000 ha" },
          notSure,
        ],
      },
    ],
    place: { es: "Ubicación del fuego o zona", en: "Fire location or area" },
    date: { es: "Desde cuándo", en: "From when" },
    aircraft: ["bell-212"],
    urgent: true,
  },
  {
    key: "cargo",
    title: { es: "Carga y construcción", en: "Cargo & construction" },
    line: {
      es: "Carga externa, montaje de torres y materiales a zonas remotas",
      en: "External loads, tower erection and materials to remote sites",
    },
    choices: [
      {
        key: "job",
        label: { es: "¿Qué hay que mover?", en: "What needs moving?" },
        short: { es: "Trabajo", en: "Job" },
        options: [
          { es: "Carga externa (eslinga)", en: "External load (sling)" },
          { es: "Montaje de torres / estructuras", en: "Tower / structure erection" },
          { es: "Materiales a zona remota", en: "Materials to a remote site" },
          other,
        ],
      },
      {
        key: "weight",
        label: { es: "Peso por izaje", en: "Weight per lift" },
        short: { es: "Peso por izaje", en: "Weight per lift" },
        options: [
          { es: "Menos de 500 kg", en: "Under 500 kg" },
          { es: "500 – 1.000 kg", en: "500 – 1,000 kg" },
          { es: "Más de 1.000 kg", en: "Over 1,000 kg" },
          notSure,
        ],
      },
    ],
    place: { es: "Origen y destino de la carga", en: "Load origin and destination" },
    date: { es: "Fecha preferida", en: "Preferred date" },
    aircraft: ["bell-212", "h125"],
  },
  {
    key: "vip",
    title: { es: "Traslado VIP o corporativo", en: "VIP or corporate transfer" },
    line: {
      es: "Ejecutivos, estancias y eventos, puerta a puerta",
      en: "Executives, ranches and events, door to door",
    },
    choices: [
      {
        key: "trip",
        label: { es: "¿Qué tipo de viaje?", en: "What kind of trip?" },
        short: { es: "Viaje", en: "Trip" },
        options: [
          { es: "Ejecutivo", en: "Executive" },
          { es: "A estancia / hacienda", en: "To a ranch / estate" },
          { es: "Evento", en: "Event" },
          { es: "Ida y vuelta el mismo día", en: "Same-day return" },
          other,
        ],
      },
    ],
    place: { es: "Ruta (desde → hasta)", en: "Route (from → to)" },
    date: { es: "Fecha del vuelo", en: "Flight date" },
    pax: true,
    aircraft: ["bell-412", "h125"],
  },
  {
    key: "scenic",
    title: { es: "Vuelo panorámico", en: "Scenic flight" },
    line: {
      es: "Cumpleaños, propuestas o simplemente Santa Cruz desde el aire",
      en: "Birthdays, proposals or just Santa Cruz from the air",
    },
    choices: [
      {
        key: "occasion",
        label: { es: "¿Cuál es la ocasión?", en: "What's the occasion?" },
        short: { es: "Ocasión", en: "Occasion" },
        options: [
          { es: "Cumpleaños", en: "Birthday" },
          { es: "Aniversario", en: "Anniversary" },
          { es: "Propuesta", en: "Proposal" },
          { es: "Regalo", en: "Gift" },
          { es: "Paseo / turismo", en: "Sightseeing" },
        ],
      },
    ],
    place: { es: "¿Qué le gustaría sobrevolar?", en: "What would you like to fly over?" },
    date: { es: "Fecha preferida", en: "Preferred date" },
    pax: true,
    aircraft: ["h125", "bell-412"],
  },
  {
    key: "film",
    title: { es: "Filmación y fotografía", en: "Film & photography" },
    line: {
      es: "Publicidad, cine, inspección y topografía aérea",
      en: "Commercials, film, inspection and aerial survey",
    },
    choices: [
      {
        key: "shoot",
        label: { es: "¿Qué va a grabar?", en: "What are you shooting?" },
        short: { es: "Producción", en: "Production" },
        options: [
          { es: "Publicidad", en: "Commercial" },
          { es: "Cine / documental", en: "Film / documentary" },
          { es: "Inspección o topografía", en: "Inspection or survey" },
          { es: "Evento", en: "Event" },
          other,
        ],
      },
      {
        key: "crew",
        label: { es: "Equipo de cámara", en: "Camera crew" },
        short: { es: "Cámara", en: "Camera" },
        options: [
          { es: "Llevamos nuestro equipo", en: "We bring our own" },
          { es: "Necesitamos operador", en: "We need an operator" },
          notSure,
        ],
      },
    ],
    place: { es: "Locación", en: "Location" },
    date: { es: "Fecha de rodaje", en: "Shoot date" },
    aircraft: ["h125", "bell-412"],
  },
  {
    key: "general",
    title: { es: "Tengo una consulta", en: "I have a question" },
    line: {
      es: "Flota, certificaciones, alianzas o lo que necesite",
      en: "Fleet, certifications, partnerships or anything else",
    },
    choices: [
      {
        key: "topic",
        label: { es: "¿Sobre qué?", en: "About what?" },
        short: { es: "Tema", en: "Topic" },
        options: [
          { es: "Flota y capacidades", en: "Fleet & capabilities" },
          { es: "Certificaciones y seguridad", en: "Certifications & safety" },
          { es: "Alianzas / proveedores", en: "Partnerships / suppliers" },
          { es: "Trabajar en Helibol", en: "Working at Helibol" },
          other,
        ],
      },
    ],
    place: { es: "Ciudad o zona (opcional)", en: "City or area (optional)" },
    date: { es: "Fecha (opcional)", en: "Date (optional)" },
    aircraft: [],
  },
];

export const getPlannerTopic = (key?: string) => plannerTopics.find((t) => t.key === key);
