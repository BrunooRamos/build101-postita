import {
  APPLY_DEADLINE_ISO,
  APPLY_OPEN,
  APPLY_URL,
  CANONICAL_URL,
  CONTACT_EMAIL,
  CONTENT_UPDATED_ISO,
  EVENT_DESCRIPTION,
  EVENT_END_ISO,
  EVENT_KICKOFF_ISO,
  LOGO_URL,
  OG_IMAGE_URL,
  SEO_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
  TEAM_SIZE,
  VENUE,
  VENUE_ADDRESS,
  VENUE_GEO,
  VENUE_POSTAL_CODE,
  VENUE_REGION,
} from "../event";
import { FAQS } from "../faqs";

// Oferta del evento. Con las inscripciones cerradas no publicamos el link de
// postulación ni la ventana de fechas: la entrada sigue siendo gratis, pero
// todavía no se puede reservar (PreOrder = solo disponible a futuro).
const offer = APPLY_OPEN
  ? {
      "@type": "Offer",
      url: APPLY_URL,
      price: "0",
      priceCurrency: "UYU",
      availability: "https://schema.org/LimitedAvailability",
      validThrough: APPLY_DEADLINE_ISO,
    }
  : {
      "@type": "Offer",
      url: CANONICAL_URL,
      price: "0",
      priceCurrency: "UYU",
      availability: "https://schema.org/PreOrder",
    };

const organizationId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;
const webpageId = `${SITE_URL}/#webpage`;
const eventId = `${SITE_URL}/#event`;
const faqId = `${SITE_URL}/#faq`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      url: SITE_URL,
      email: CONTACT_EMAIL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
        width: 512,
        height: 512,
      },
      ...(SOCIAL_PROFILES.length > 0 ? { sameAs: SOCIAL_PROFILES } : {}),
      areaServed: {
        "@type": "Country",
        name: "Uruguay",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: CONTACT_EMAIL,
        contactType: "customer support",
        availableLanguage: ["es"],
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: SITE_NAME,
      url: CANONICAL_URL,
      description: SEO_DESCRIPTION,
      inLanguage: "es-UY",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: CANONICAL_URL,
      name: "build 101: la hackathon de IA más grande de uruguay, en montevideo",
      isPartOf: { "@id": websiteId },
      about: { "@id": eventId },
      primaryImageOfPage: OG_IMAGE_URL,
      inLanguage: "es-UY",
      dateModified: CONTENT_UPDATED_ISO,
    },
    {
      "@type": "Event",
      "@id": eventId,
      name: "build 101",
      alternateName: SITE_NAME,
      description: EVENT_DESCRIPTION,
      url: CANONICAL_URL,
      image: [OG_IMAGE_URL, LOGO_URL],
      startDate: EVENT_KICKOFF_ISO,
      endDate: EVENT_END_ISO,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      inLanguage: "es-UY",
      keywords:
        "hackathon uruguay, hackathon montevideo, hackathon de ia, build 101, inteligencia artificial, builders uruguay",
      location: {
        "@type": "Place",
        name: VENUE,
        address: {
          "@type": "PostalAddress",
          streetAddress: VENUE_ADDRESS,
          addressLocality: "Montevideo",
          addressRegion: VENUE_REGION,
          postalCode: VENUE_POSTAL_CODE,
          addressCountry: "UY",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: VENUE_GEO.lat,
          longitude: VENUE_GEO.lng,
        },
      },
      organizer: [
        { "@id": organizationId },
        {
          "@type": "EducationalOrganization",
          name: "Universidad de Montevideo · Facultad de Ingeniería (FIUM)",
          url: "https://um.edu.uy",
        },
        {
          "@type": "Organization",
          name: "MÜTÜÖ",
          url: "https://canalmutuo.com",
        },
      ],
      offers: offer,
      audience: {
        "@type": "Audience",
        audienceType: `builders de uruguay en equipos de ${TEAM_SIZE} personas`,
      },
      isAccessibleForFree: true,
    },
    {
      "@type": "FAQPage",
      "@id": faqId,
      inLanguage: "es-UY",
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.aText,
        },
      })),
    },
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
