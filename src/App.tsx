import { useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { PhoneTour } from "./components/PhoneTour";
import { Seo, SeoJsonLd } from "./components/Seo";
import { legalPath } from "./components/LegalPage";
import { WaitlistForm } from "./components/WaitlistForm";
import { ConnectionDiagram } from "./components/ConnectionDiagram";
import {
  localeFromPath,
  pathForLocale,
  type AppLocale,
} from "./i18n";
import "./App.css";

gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  SplitText,
  ScrollToPlugin,
  DrawSVGPlugin,
  ScrambleTextPlugin,
);

type NicheKey = "beauty" | "health" | "fitness" | "services";

export default function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const locale = localeFromPath(location.pathname);
  const root = useRef<HTMLDivElement>(null);
  const nichePanel = useRef<HTMLDivElement>(null);
  const [niche, setNiche] = useState<NicheKey>("beauty");
  const [menuOpen, setMenuOpen] = useState(false);

  useLayoutEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale;
  }, [locale, i18n]);

  useLayoutEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const nicheKeys: NicheKey[] = ["beauty", "health", "fitness", "services"];
  const features = t("features.items", {
    returnObjects: true,
  }) as Array<{ title: string; body: string }>;
  const faqItems = t("faq.items", {
    returnObjects: true,
  }) as Array<{ q: string; a: string }>;
  const hookPhotos = t("hooks.items", {
    returnObjects: true,
  }) as Array<{ src: string; alt: string; caption: string }>;
  const hookSell = t("hooks.sell", {
    returnObjects: true,
  }) as Array<{ title: string; body: string }>;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 900px)",
          canHover: "(hover: hover) and (pointer: fine)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduceMotion, canHover } = ctx.conditions as {
            reduceMotion: boolean;
            canHover: boolean;
          };
          const d = reduceMotion ? 0 : 1;
          const cleanups: Array<() => void> = [];

          gsap.to(".scroll-progress", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.3,
            },
          });

          if (canHover && !reduceMotion) {
            const glow = document.querySelector(".cursor-glow") as HTMLElement;
            if (glow) {
              gsap.set(glow, { opacity: 1 });
              const xTo = gsap.quickTo(glow, "x", {
                duration: 0.55,
                ease: "power3",
              });
              const yTo = gsap.quickTo(glow, "y", {
                duration: 0.55,
                ease: "power3",
              });
              const onMove = (e: MouseEvent) => {
                xTo(e.clientX);
                yTo(e.clientY);
              };
              window.addEventListener("mousemove", onMove);
              cleanups.push(() =>
                window.removeEventListener("mousemove", onMove),
              );
            }
          }

          if (!reduceMotion) {
            gsap.to(".orb-a", {
              x: 40,
              y: 30,
              duration: 7,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
            gsap.to(".orb-b", {
              x: -50,
              y: -25,
              duration: 9,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
            gsap.to(".orb-c", {
              x: 30,
              y: -40,
              duration: 8,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
            gsap.to(".phone-ring", {
              rotation: 360,
              duration: 18,
              ease: "none",
              repeat: -1,
            });
          }

          const title = document.querySelector(".hero-title");
          let split: SplitText | undefined;

          const heroTl = gsap.timeline({
            defaults: { ease: "power3.out" },
          });

          if (!reduceMotion) {
            gsap.set(".smile-path", { drawSVG: "0%" });
            heroTl.to(".smile-path", {
              drawSVG: "100%",
              duration: 1.05,
              ease: "power2.inOut",
            });
          } else {
            gsap.set(".smile-path", { drawSVG: "100%" });
          }

          heroTl.from(
            ".brand-word",
            {
              autoAlpha: 0,
              y: 24 * d,
              duration: 0.7 * d || 0.01,
            },
            reduceMotion ? 0 : "-=0.35",
          );

          if (title && !reduceMotion) {
            split = SplitText.create(title, {
              type: "words,lines",
              linesClass: "line",
              aria: "auto",
              autoSplit: true,
              onSplit(self) {
                return gsap.from(self.words, {
                  yPercent: 110,
                  autoAlpha: 0,
                  stagger: 0.05,
                  duration: 0.8,
                  ease: "power3.out",
                });
              },
            });
            heroTl.add(() => {}, "+=0.05");
          } else {
            heroTl.from(".hero-title", { autoAlpha: 0, duration: 0.01 }, "+=0.1");
          }

          const ledeText = t("hero.lede");

          heroTl
            .from(
              ".hero-lede",
              { autoAlpha: 0, y: 18 * d, duration: 0.55 * d || 0.01 },
              "-=0.2",
            )
            .from(
              ".hero-actions .btn",
              {
                autoAlpha: 0,
                y: 16 * d,
                stagger: 0.1,
                duration: 0.5 * d || 0.01,
              },
              "-=0.25",
            )
            .from(
              ".trust-row span",
              {
                autoAlpha: 0,
                y: 10 * d,
                stagger: 0.08,
                duration: 0.4 * d || 0.01,
              },
              "-=0.2",
            )
            .from(
              ".phone",
              {
                autoAlpha: 0,
                y: 90 * d,
                rotationY: reduceMotion ? 0 : -14,
                rotationX: reduceMotion ? 0 : 10,
                scale: reduceMotion ? 1 : 0.9,
                duration: 1.15 * d || 0.01,
                ease: "power4.out",
              },
              0.35,
            )
            .from(
              ".phone-ring",
              { autoAlpha: 0, scale: 0.7, duration: 0.8 * d || 0.01 },
              0.5,
            );

          if (!reduceMotion) {
            gsap.to(".phone", {
              y: -16,
              duration: 3.4,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });

            ScrollTrigger.create({
              trigger: ".hero-lede",
              start: "top 80%",
              once: true,
              onEnter: () => {
                gsap.to(".hero-lede", {
                  duration: 1.2,
                  scrambleText: {
                    text: ledeText,
                    chars: "upperCase",
                    revealDelay: 0.25,
                    speed: 0.4,
                  },
                });
              },
            });
          }

          ScrollTrigger.create({
            start: "top -48",
            onUpdate: (self) => {
              document
                .querySelector(".nav")
                ?.classList.toggle("is-solid", self.scroll() > 48);
            },
          });

          if (!reduceMotion) {
            gsap.to(".orb-a", {
              yPercent: 35,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });
            gsap.to(".orb-b", {
              yPercent: -25,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });
          }

          gsap.from(".hooks-shot", {
            autoAlpha: 0,
            y: 36 * d,
            stagger: 0.08,
            duration: 0.7 * d || 0.01,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".hooks-gallery",
              start: "top 85%",
            },
          });

          gsap.from(".hooks-sell-item", {
            autoAlpha: 0,
            y: 28 * d,
            stagger: 0.1,
            duration: 0.65 * d || 0.01,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".hooks-sell",
              start: "top 88%",
            },
          });

          gsap.from(".feature-item", {
            autoAlpha: 0,
            y: 50 * d,
            rotateX: reduceMotion ? 0 : 8,
            stagger: 0.12,
            duration: 0.75 * d || 0.01,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".feature-rail",
              start: "top 82%",
            },
          });

          gsap.utils.toArray<HTMLElement>(".reveal-head").forEach((el) => {
            gsap.from(el.children, {
              autoAlpha: 0,
              y: 32 * d,
              stagger: 0.09,
              duration: 0.7 * d || 0.01,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
              },
            });
          });

          if (!reduceMotion) {
            gsap.to(".cta-glow", {
              scale: 1.15,
              opacity: 0.85,
              duration: 2.8,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
          }

          if (canHover && !reduceMotion) {
            gsap.utils.toArray<HTMLElement>(".btn-primary").forEach((btn) => {
              const xTo = gsap.quickTo(btn, "x", {
                duration: 0.35,
                ease: "power3",
              });
              const yTo = gsap.quickTo(btn, "y", {
                duration: 0.35,
                ease: "power3",
              });
              const enter = (e: MouseEvent) => {
                const r = btn.getBoundingClientRect();
                xTo((e.clientX - r.left - r.width / 2) * 0.25);
                yTo((e.clientY - r.top - r.height / 2) * 0.25);
              };
              const leave = () => {
                xTo(0);
                yTo(0);
              };
              btn.addEventListener("mousemove", enter);
              btn.addEventListener("mouseleave", leave);
              cleanups.push(() => {
                btn.removeEventListener("mousemove", enter);
                btn.removeEventListener("mouseleave", leave);
              });
            });
          }

          return () => {
            cleanups.forEach((fn) => fn());
            split?.revert();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root, dependencies: [locale] },
  );

  const selectNiche = (key: NicheKey) => {
    if (key === niche) return;

    const panel = nichePanel.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!panel || reduce) {
      setNiche(key);
      return;
    }

    // Crossfade in place — avoid Flip absolute (it flashes the image to the left).
    const targets = panel.querySelectorAll(".niche-body, .niche-swatch");
    gsap.to(targets, {
      autoAlpha: 0,
      duration: 0.18,
      ease: "power1.in",
      onComplete: () => {
        setNiche(key);
        requestAnimationFrame(() => {
          gsap.fromTo(
            panel.querySelectorAll(".niche-body, .niche-swatch"),
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.28, ease: "power2.out" },
          );
        });
      },
    });
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    gsap.to(window, {
      duration: 0.95,
      scrollTo: { y: id, offsetY: 16 },
      ease: "power3.inOut",
    });
  };

  const switchLocale = (next: AppLocale) => {
    const hash = window.location.hash.replace("#", "");
    return pathForLocale(next, hash);
  };

  const active = {
    label: t(`niches.items.${niche}.label`),
    headline: t(`niches.items.${niche}.headline`),
    body: t(`niches.items.${niche}.body`),
    mood: t(`niches.items.${niche}.mood`),
    image: t(`niches.items.${niche}.image`),
  };

  return (
    <div className="page" ref={root}>
      <Seo locale={locale} />
      <SeoJsonLd locale={locale} />

      <div className="scroll-progress" aria-hidden />
      <div className="cursor-glow" aria-hidden />

      <header className={`nav${menuOpen ? " is-open" : ""}`}>
        <a
          className="nav-brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("#top");
          }}
        >
          <img src="/logo-swibook.png" alt="" width={36} height={36} />
          Swibook
        </a>

        <nav
          className={`nav-links${menuOpen ? " is-open" : ""}`}
          aria-label={t("nav.aria")}
          id="primary-nav"
        >
          <a
            href="#flujo"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#flujo");
            }}
          >
            {t("nav.how")}
          </a>
          <a
            href="#conexion"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#conexion");
            }}
          >
            {t("nav.connect")}
          </a>
          <a
            href="#nichos"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#nichos");
            }}
          >
            {t("nav.niches")}
          </a>
          <a
            href="#producto"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#producto");
            }}
          >
            {t("nav.product")}
          </a>
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#faq");
            }}
          >
            {t("nav.faq")}
          </a>

          <div className="lang-switch" role="group" aria-label={t("nav.lang")}>
            <Link
              to={switchLocale("es")}
              className={locale === "es" ? "is-active" : undefined}
              hrefLang="es"
            >
              ES
            </Link>
            <Link
              to={switchLocale("en")}
              className={locale === "en" ? "is-active" : undefined}
              hrefLang="en"
            >
              EN
            </Link>
          </div>
        </nav>

        <div className="nav-actions">
          <a
            className="nav-cta"
            href="#cta"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#cta");
            }}
          >
            {t("nav.start")}
          </a>
          <button
            type="button"
            className="nav-burger"
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            aria-label={menuOpen ? t("nav.close") : t("nav.menu")}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-orbs" aria-hidden>
            <div className="orb orb-a" />
            <div className="orb orb-b" />
            <div className="orb orb-c" />
          </div>
          <div className="hero-mesh" aria-hidden />

          <div className="hero-grid">
            <div className="hero-copy">
              <div className="brand-mark" aria-label="Swibook">
                <svg
                  className="smile-svg"
                  viewBox="0 0 100 18"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <linearGradient
                      id="smileGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#00c8ff" />
                      <stop offset="55%" stopColor="#7b2fff" />
                      <stop offset="100%" stopColor="#e000ff" />
                    </linearGradient>
                  </defs>
                  <path
                    className="smile-path"
                    d="M0.8 15.2 C 26 0.8, 74 0.8, 99.2 14.6 L 93.2 9.6 M99.2 14.6 L 93.8 18"
                  />
                </svg>
                <span className="brand-word">Swibook</span>
              </div>

              <h1 className="hero-title">{t("hero.title")}</h1>
              <p className="hero-lede">{t("hero.lede")}</p>

              <div className="hero-actions">
                <a
                  className="btn btn-primary"
                  href="#cta"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("#cta");
                  }}
                >
                  {t("hero.ctaPrimary")}
                </a>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => scrollTo("#flujo")}
                >
                  {t("hero.ctaSecondary")}
                </button>
              </div>

              <div className="trust-row">
                <span>
                  <i className="trust-dot" aria-hidden />
                  {t("hero.trust1")}
                </span>
                <span>
                  <i className="trust-dot" aria-hidden />
                  {t("hero.trust2")}
                </span>
                <span>
                  <i className="trust-dot" aria-hidden />
                  {t("hero.trust3")}
                </span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="phone-ring" aria-hidden />
              <div className="phone">
                <img src="/app-shots/01-hoy.png" alt={t("hero.phoneAlt")} />
              </div>
            </div>
          </div>
        </section>

        <section className="section connect-section" id="conexion">
          <div className="section-inner">
            <ConnectionDiagram />
          </div>
        </section>

        <section className="section flow" id="flujo">
          <div className="section-inner">
            <PhoneTour />
            <p className="tour-live-link">
              {t("tour.demoPrefix")}{" "}
              <a
                href="https://swibook.sibylab.com/v/barberia-vip-studio"
                target="_blank"
                rel="noreferrer"
              >
                /v/barberia-vip-studio
              </a>
            </p>
          </div>
        </section>

        <section className="section hooks" id="enganche">
          <div className="section-inner">
            <div className="reveal-head">
              <p className="section-kicker">{t("hooks.kicker")}</p>
              <h2 className="section-title">{t("hooks.title")}</h2>
              <p className="section-lede">{t("hooks.lede")}</p>
            </div>

            <div className="hooks-gallery">
              {hookPhotos.map((photo) => (
                <figure className="hooks-shot" key={photo.src}>
                  <img src={photo.src} alt={photo.alt} loading="lazy" />
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              ))}
            </div>

            <div className="hooks-sell">
              {hookSell.map((item) => (
                <article className="hooks-sell-item" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section niches" id="nichos">
          <div className="section-inner">
            <div className="reveal-head">
              <p className="section-kicker">{t("niches.kicker")}</p>
              <h2 className="section-title">{t("niches.title")}</h2>
              <p className="section-lede">{t("niches.lede")}</p>
            </div>

            <div
              className="niche-tabs"
              role="tablist"
              aria-label={t("niches.aria")}
            >
              {nicheKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={niche === key}
                  className={`niche-tab${niche === key ? " is-active" : ""}`}
                  onClick={() => selectNiche(key)}
                >
                  {t(`niches.items.${key}.label`)}
                </button>
              ))}
            </div>

            <div className="niche-panel" ref={nichePanel}>
              <div className="niche-body">
                <h3>{active.headline}</h3>
                <p>{active.body}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => scrollTo("#cta")}
                >
                  {t("niches.cta")}
                </button>
              </div>
              <div
                className="niche-swatch"
                data-niche={niche}
                style={{ backgroundImage: `url(${active.image})` }}
              >
                <span>{active.mood}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section features" id="producto">
          <div className="section-inner">
            <div className="reveal-head">
              <p className="section-kicker">{t("features.kicker")}</p>
              <h2 className="section-title">{t("features.title")}</h2>
              <p className="section-lede">{t("features.lede")}</p>
            </div>

            <div className="feature-rail">
              {features.map((f, i) => (
                <article className="feature-item" key={f.title}>
                  <span className="feature-num">0{i + 1}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section faq" id="faq">
          <div className="section-inner">
            <div className="reveal-head">
              <p className="section-kicker">{t("faq.kicker")}</p>
              <h2 className="section-title">{t("faq.title")}</h2>
              <p className="section-lede">{t("faq.lede")}</p>
            </div>

            <div className="faq-list">
              {faqItems.map((item) => (
                <details className="faq-item" key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section cta" id="cta">
          <div className="cta-glow" aria-hidden />
          <div className="section-inner">
            <p className="section-kicker">{t("cta.kicker")}</p>
            <h2 className="section-title">{t("cta.title")}</h2>
            <p className="section-lede">{t("cta.lede")}</p>
            <WaitlistForm />
            <div className="cta-actions cta-actions-secondary">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => scrollTo("#flujo")}
              >
                {t("cta.secondary")}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <strong>Swibook</strong>
            <span>{t("footer.tagline")}</span>
            <span className="footer-copy">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </span>
          </div>
          <nav className="footer-links" aria-label="Legal">
            <Link to={legalPath(locale, "terms")}>{t("footer.terms")}</Link>
            <Link to={legalPath(locale, "privacy")}>{t("footer.privacy")}</Link>
            <a href={`mailto:${t("legal.contactEmail")}`}>{t("footer.contact")}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
