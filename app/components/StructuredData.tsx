import {
  APPLY_DEADLINE_ISO,
  APPLY_OPEN_ISO,
  CANONICAL_URL,
  CONTACT_EMAIL,
  CONTENT_UPDATED_ISO,
  DURATION_HOURS,
  EVENT_DESCRIPTION,
  EVENT_END_ISO,
  EVENT_KICKOFF_ISO,
  LOGO_URL,
  LUMA_URL,
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
      sameAs: SOCIAL_PROFILES,
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
      name: "build 101 — la hackathon de ia más grande de uruguay, 36 horas en montevideo",
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
      duration: `PT${DURATION_HOURS}H`,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      inLanguage: "es-UY",
      keywords:
        "hackathon uruguay, hackathon montevideo, build 101, 36 horas, builders uruguay, programación, diseño, producto",
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
          name: "Universidad de Montevideo",
          url: "https://um.edu.uy",
        },
      ],
      offers: {
        "@type": "Offer",
        url: LUMA_URL,
        price: "0",
        priceCurrency: "UYU",
        availability: "https://schema.org/LimitedAvailability",
        validFrom: APPLY_OPEN_ISO,
        validThrough: APPLY_DEADLINE_ISO,
      },
      audience: {
        "@type": "Audience",
        audienceType: `jóvenes builders de uruguay en equipos de ${TEAM_SIZE} personas`,
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
