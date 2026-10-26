import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { SITE_URL, type AppLocale } from "../i18n";

type Props = {
  locale: AppLocale;
};

export function Seo({ locale }: Props) {
  const { t } = useTranslation();
  const canonical = locale === "en" ? `${SITE_URL}/en` : `${SITE_URL}/`;
  const ogImage = `${SITE_URL}/logo-swibook.png`;

  return (
    <Helmet htmlAttributes={{ lang: locale }}>
      <title>{t("seo.title")}</title>
      <meta name="description" content={t("seo.description")} />
      <meta name="keywords" content={t("seo.keywords")} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Swibook" />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="es" href={`${SITE_URL}/`} />
      <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en`} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/`} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Swibook" />
      <meta property="og:locale" content={locale === "en" ? "en_US" : "es_LA"} />
      <meta property="og:locale:alternate" content={locale === "en" ? "es_LA" : "en_US"} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={t("seo.title")} />
      <meta property="og:description" content={t("seo.description")} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={t("seo.ogImageAlt")} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t("seo.title")} />
      <meta name="twitter:description" content={t("seo.description")} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

export function SeoJsonLd({ locale }: Props) {
  const { t } = useTranslation();
  const inLanguage = locale === "en" ? "en" : "es";

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Swibook",
        url: SITE_URL,
        logo: `${SITE_URL}/logo-swibook.png`,
        description: t("seo.description"),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Swibook",
        inLanguage,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        name: "Swibook",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: t("seo.description"),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description:
            locale === "en"
              ? "No marketplace commission on your own clients"
              : "Sin comisión marketplace por tus propios clientes",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: (
          t("faq.items", { returnObjects: true }) as Array<{ q: string; a: string }>
        ).map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
