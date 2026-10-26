import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCreative } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-creative";
import "./PhoneTour.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Slide = {
  src: string;
  label: string;
  title: string;
  body: string;
};

export function PhoneTour() {
  const { t } = useTranslation();
  const slides = t("tour.slides", { returnObjects: true }) as Slide[];
  const wrap = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const shell = wrap.current?.querySelector(".phone-shell");
      const copy = wrap.current?.querySelector(".tour-copy");
      if (!shell || !copy) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([shell, copy], { clearProps: "all", autoAlpha: 1, x: 0, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap.current,
            start: "top 85%",
            once: true,
          },
        });

        tl.fromTo(
          copy,
          { autoAlpha: 0, x: -20 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.65,
            ease: "power2.out",
            immediateRender: false,
          },
        ).fromTo(
          shell,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            immediateRender: false,
          },
          "-=0.4",
        );

        requestAnimationFrame(() => {
          const top = wrap.current?.getBoundingClientRect().top ?? 9999;
          if (top < window.innerHeight * 0.9) tl.play(0);
        });
      });

      return () => mm.revert();
    },
    { scope: wrap, dependencies: [slides.length] },
  );

  const goTo = (index: number) => {
    swiperRef.current?.slideToLoop(index);
  };

  const current = slides[active] ?? slides[0];

  return (
    <div className="phone-tour" ref={wrap}>
      <div className="tour-copy">
        <p className="section-kicker">{t("tour.kicker")}</p>
        <h2 className="section-title">{t("tour.title")}</h2>
        <p className="section-lede">{t("tour.lede")}</p>

        <ol className="tour-steps">
          {slides.map((slide, i) => (
            <li key={`${slide.src}-${i}`}>
              <button
                type="button"
                className={`tour-step${i === active ? " is-active" : ""}`}
                onClick={() => goTo(i)}
                aria-current={i === active ? "step" : undefined}
              >
                <span className="tour-step-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="tour-step-text">
                  <strong>{slide.title}</strong>
                  <small>{slide.body}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div
        className="phone-shell"
        aria-label={t("tour.caption", { label: current?.label ?? "" })}
      >
        <div className="phone-bezel">
          <div className="phone-notch" aria-hidden />
          <div className="phone-screen">
            <Swiper
              modules={[Autoplay, Pagination, EffectCreative]}
              effect="creative"
              creativeEffect={{
                prev: {
                  shadow: true,
                  translate: ["-18%", 0, -80],
                  opacity: 0.55,
                },
                next: { translate: ["110%", 0, 0] },
              }}
              loop
              speed={650}
              autoplay={{
                delay: 3200,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true }}
              onSwiper={(s) => {
                swiperRef.current = s;
              }}
              onSlideChange={(s) => setActive(s.realIndex)}
              className="phone-swiper"
            >
              {slides.map((slide, i) => (
                <SwiperSlide key={`${slide.src}-${i}`}>
                  <img src={slide.src} alt={slide.label} loading="lazy" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="phone-home" aria-hidden />
        </div>
        <p className="phone-caption">
          {t("tour.caption", { label: current?.label ?? "" })}
        </p>
      </div>
    </div>
  );
}
