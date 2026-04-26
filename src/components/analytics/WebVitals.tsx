"use client";
import { useEffect } from "react";

export default function WebVitals() {
  useEffect(() => {
    import("web-vitals").then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      const report = (metric: { name: string; value: number; id: string }) => {
        const gtag = (
          window as Window & { gtag?: (...args: unknown[]) => void }
        ).gtag;
        if (gtag) {
          gtag("event", metric.name, {
            event_category: "Web Vitals",
            event_label: metric.id,
            value: Math.round(
              metric.name === "CLS" ? metric.value * 1000 : metric.value,
            ),
            non_interaction: true,
          });
        }
      };
      onCLS(report);
      onFCP(report);
      onLCP(report);
      onTTFB(report);
      onINP(report);
    });
  }, []);
  return null;
}
