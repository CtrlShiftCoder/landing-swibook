import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { localeFromPath, SITE_URL, type AppLocale } from "../i18n";
import { useLocation } from "react-router-dom";
import "./LegalPage.css";

export type LegalDoc = "terms" | "privacy";

type Props = {
  doc: LegalDoc;
};

export function LegalPage({ doc }: Props) {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = localeFromPath(location.pathname);
  const home = locale === "en" ? "/en" : "/";
  const otherDoc: LegalDoc = doc === "terms" ? "privacy" : "terms";
  const otherPath = legalPath(locale, otherDoc);
  const canonical = `${SITE_URL}${legalPath(locale, doc)}`;

  const sections = t(`legal.${doc}.sections`, {
    returnObjects: true,
  }) as Array<{ title: string; body: string }>;

  return (
    <div className="legal-page">
      <Helmet>
        <html lang={locale} />
        <title>{t(`legal.${doc}.metaTitle`)}</title>
        <meta name="description" content={t(`legal.${doc}.metaDescription`)} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <header className="legal-top">
        <Link to={home} className="legal-brand">
          <img src="/logo-swibook.png" alt="" width={32} height={32} />
          Swibook
        </Link>
        <Link to={home} className="legal-back">
          {t("legal.back")}
        </Link>
      </header>

      <main className="legal-main">
        <p className="legal-kicker">{t("legal.kicker")}</p>
        <h1>{t(`legal.${doc}.title`)}</h1>
        <p className="legal-updated">{t(`legal.${doc}.updated`)}</p>

        <div className="legal-body">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        <p className="legal-contact">
          {t("legal.contactLabel")}{" "}
          <a href={`mailto:${t("legal.contactEmail")}`}>
            {t("legal.contactEmail")}
          </a>
        </p>

        <p className="legal-also">
          <Link to={otherPath}>{t(`legal.${otherDoc}.title`)}</Link>
        </p>
      </main>
    </div>
  );
}

export function legalPath(locale: AppLocale, doc: LegalDoc): string {
  if (locale === "en") {
    return doc === "terms" ? "/en/terms" : "/en/privacy";
  }
  return doc === "terms" ? "/terminos" : "/privacidad";
}
