import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { localeFromPath } from "../i18n";
import "./ConnectionDiagram.css";

gsap.registerPlugin(useGSAP, ScrollTrigger, MotionPathPlugin);

type Pt = { x: number; y: number };

function centerOf(el: HTMLElement, origin: DOMRect): Pt {
  const r = el.getBoundingClientRect();
  return {
    x: r.left - origin.left + r.width / 2,
    y: r.top - origin.top + r.height / 2,
  };
}

function edgePoint(from: Pt, to: Pt, radius: number): Pt {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: from.x + (dx / len) * radius,
    y: from.y + (dy / len) * radius,
  };
}

export function ConnectionDiagram() {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = localeFromPath(location.pathname);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const clientRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const bizRef = useRef<HTMLDivElement>(null);
  const pathOut = useRef<SVGPathElement>(null);
  const pathIn = useRef<SVGPathElement>(null);
  const pathBack = useRef<SVGPathElement>(null);
  const packetOut = useRef<SVGCircleElement>(null);
  const packetIn = useRef<SVGCircleElement>(null);
  const packetBack = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const steps = t("connect.steps", { returnObjects: true }) as Array<{
    title: string;
    body: string;
  }>;

  const layoutLines = () => {
    const stageEl = stage.current;
    const svg = svgRef.current;
    const a = clientRef.current;
    const b = hubRef.current;
    const c = bizRef.current;
    if (!stageEl || !svg || !a || !b || !c) return;

    const origin = stageEl.getBoundingClientRect();
    const w = origin.width;
    const h = origin.height;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const ca = centerOf(a, origin);
    const cb = centerOf(b, origin);
    const cc = centerOf(c, origin);
    const rClient = Math.min(a.offsetWidth, a.offsetHeight) * 0.52;
    const rHub = Math.min(b.offsetWidth, b.offsetHeight) * 0.42;
    const rBiz = Math.min(c.offsetWidth, c.offsetHeight) * 0.52;

    const wide = w >= 820;

    if (wide) {
      const a2bStart = edgePoint(ca, cb, rClient);
      const a2bEnd = edgePoint(cb, ca, rHub);
      const b2cStart = edgePoint(cb, cc, rHub);
      const b2cEnd = edgePoint(cc, cb, rBiz);

      const mid1x = (a2bStart.x + a2bEnd.x) / 2;
      const mid2x = (b2cStart.x + b2cEnd.x) / 2;
      const arch = Math.min(36, Math.abs(a2bEnd.x - a2bStart.x) * 0.18);

      if (pathOut.current) {
        pathOut.current.setAttribute(
          "d",
          `M ${a2bStart.x} ${a2bStart.y} Q ${mid1x} ${a2bStart.y - arch} ${a2bEnd.x} ${a2bEnd.y}`,
        );
      }
      if (pathIn.current) {
        pathIn.current.setAttribute(
          "d",
          `M ${b2cStart.x} ${b2cStart.y} Q ${mid2x} ${b2cStart.y - arch} ${b2cEnd.x} ${b2cEnd.y}`,
        );
      }

      const backStart = { x: cc.x, y: cc.y + rBiz };
      const backEnd = { x: ca.x, y: ca.y + rClient };
      const backMidY = Math.max(backStart.y, backEnd.y) + 42;
      if (pathBack.current) {
        pathBack.current.setAttribute(
          "d",
          `M ${backStart.x} ${backStart.y} Q ${(backStart.x + backEnd.x) / 2} ${backMidY} ${backEnd.x} ${backEnd.y}`,
        );
      }
    } else {
      // Vertical stack: client → hub → biz
      const a2bStart = edgePoint(ca, cb, rClient);
      const a2bEnd = edgePoint(cb, ca, rHub);
      const b2cStart = edgePoint(cb, cc, rHub);
      const b2cEnd = edgePoint(cc, cb, rBiz);

      if (pathOut.current) {
        pathOut.current.setAttribute(
          "d",
          `M ${a2bStart.x} ${a2bStart.y} L ${a2bEnd.x} ${a2bEnd.y}`,
        );
      }
      if (pathIn.current) {
        pathIn.current.setAttribute(
          "d",
          `M ${b2cStart.x} ${b2cStart.y} L ${b2cEnd.x} ${b2cEnd.y}`,
        );
      }
      if (pathBack.current) {
        pathBack.current.setAttribute(
          "d",
          `M ${cc.x + rBiz} ${cc.y} C ${cc.x + 48} ${cc.y}, ${ca.x + 48} ${ca.y}, ${ca.x + rClient} ${ca.y}`,
        );
      }
    }
  };

  useLayoutEffect(() => {
    layoutLines();
    const onResize = () => layoutLines();
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    if (stage.current) ro.observe(stage.current);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [locale]);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      layoutLines();

      const nodes = gsap.utils.toArray<HTMLElement>(".connect-node");
      const paths = [pathOut.current, pathIn.current, pathBack.current].filter(
        Boolean,
      ) as SVGPathElement[];
      const packets = [
        packetOut.current,
        packetIn.current,
        packetBack.current,
      ].filter(Boolean) as SVGCircleElement[];
      const labels = gsap.utils.toArray<HTMLElement>(".connect-flow-label");

      gsap.set(nodes, { autoAlpha: reduce ? 1 : 0, y: reduce ? 0 : 14 });
      gsap.set(labels, { autoAlpha: reduce ? 1 : 0 });
      gsap.set(packets, { autoAlpha: 0 });

      paths.forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: len,
          strokeDashoffset: reduce ? 0 : len,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 75%",
          once: true,
        },
        defaults: { ease: "power2.out" },
      });

      tl.to(nodes, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.1,
        duration: reduce ? 0.01 : 0.45,
      });

      tl.add(() => layoutLines());

      tl.to(
        paths,
        {
          strokeDashoffset: 0,
          duration: reduce ? 0.01 : 0.75,
          stagger: 0.14,
          ease: "power2.inOut",
          onUpdate: () => {
            /* keep markers attached */
          },
        },
        "-=0.1",
      );

      tl.to(
        labels,
        { autoAlpha: 1, duration: reduce ? 0.01 : 0.35, stagger: 0.08 },
        "-=0.35",
      );

      if (reduce) return;

      packets.forEach((packet, i) => {
        const path = paths[i];
        if (!path) return;
        tl.set(packet, { autoAlpha: 1 }, i === 0 ? "-=0.2" : "-=0.55");
        tl.to(
          packet,
          {
            motionPath: {
              path,
              align: path,
              alignOrigin: [0.5, 0.5],
            },
            duration: 1.1 + i * 0.08,
            ease: "none",
            repeat: -1,
            repeatDelay: 0.4,
          },
          "<",
        );
      });

    },
    { scope: root, dependencies: [locale] },
  );

  return (
    <div className="connect" ref={root}>
      <div className="reveal-head connect-head">
        <p className="section-kicker">{t("connect.kicker")}</p>
        <h2 className="section-title">{t("connect.title")}</h2>
        <p className="section-lede">{t("connect.lede")}</p>
      </div>

      <div className="connect-stage" ref={stage}>
        <svg
          ref={svgRef}
          className="connect-lines"
          aria-hidden
          fill="none"
        >
          <defs>
            <linearGradient id="cGradFwd" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00c8ff" />
              <stop offset="55%" stopColor="#7b2fff" />
              <stop offset="100%" stopColor="#e000ff" />
            </linearGradient>
            <linearGradient id="cGradBack" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#e000ff" />
              <stop offset="100%" stopColor="#00c8ff" />
            </linearGradient>
            <marker
              id="cHeadFwd"
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="4.5"
              orient="auto"
            >
              <path d="M0 0 L8 4.5 L0 9 Z" fill="#e000ff" />
            </marker>
            <marker
              id="cHeadBack"
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="4.5"
              orient="auto"
            >
              <path d="M0 0 L8 4.5 L0 9 Z" fill="#00c8ff" />
            </marker>
          </defs>

          <path
            ref={pathOut}
            className="connect-line"
            stroke="url(#cGradFwd)"
            strokeWidth="2.75"
            strokeLinecap="round"
            markerEnd="url(#cHeadFwd)"
          />
          <path
            ref={pathIn}
            className="connect-line"
            stroke="url(#cGradFwd)"
            strokeWidth="2.75"
            strokeLinecap="round"
            markerEnd="url(#cHeadFwd)"
          />
          <path
            ref={pathBack}
            className="connect-line connect-line-back"
            stroke="url(#cGradBack)"
            strokeWidth="2.4"
            strokeLinecap="round"
            markerEnd="url(#cHeadBack)"
          />

          <circle ref={packetOut} r="4.5" fill="#00c8ff" />
          <circle ref={packetIn} r="4.5" fill="#e000ff" />
          <circle ref={packetBack} r="4" fill="#b8f0ff" />
        </svg>

        <div className="connect-row">
          <article className="connect-node">
            <div className="connect-avatar" data-tone="client" ref={clientRef}>
              <img src="/icons/client.png" alt="" width={56} height={56} />
            </div>
            <h3>{t("connect.client.title")}</h3>
            <p>{t("connect.client.body")}</p>
            <span className="connect-flow-label connect-flow-label-a">
              {t("connect.flowOut")}
            </span>
          </article>

          <article className="connect-node connect-node-hub">
            <div className="connect-avatar" data-tone="hub" ref={hubRef}>
              <img src="/logo-swibook.png" alt="Swibook" width={64} height={64} />
            </div>
            <p>{t("connect.hub.body")}</p>
            <span className="connect-flow-label connect-flow-label-b">
              {t("connect.flowIn")}
            </span>
          </article>

          <article className="connect-node">
            <div className="connect-avatar" data-tone="biz" ref={bizRef}>
              <img src="/icons/business.png" alt="" width={56} height={56} />
            </div>
            <h3>{t("connect.biz.title")}</h3>
            <p>{t("connect.biz.body")}</p>
            <span className="connect-flow-label connect-flow-label-c">
              {t("connect.flowBack")}
            </span>
          </article>
        </div>
      </div>

      <ol className="connect-steps">
        {steps.map((step, i) => (
          <li key={step.title}>
            <span className="connect-step-num">0{i + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
