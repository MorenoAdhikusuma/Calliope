"use client";

import { useEffect, useRef } from "react";
import { initMuseum } from "@/lib/museumRoom";

export default function MuseumPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    initMuseum(containerRef.current);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#111",
      }}
    >
      {/* ---------- HEADER ABOVE CANVAS ---------- */}
      <div
        style={{
          height: "72px",
          flexShrink: 0,
          position: "relative",
          display: "flex",
          alignItems: "center",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        {/* CENTERED TITLE */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "16px",
          }}
        >
          <strong>Museum</strong>
          <span style={{ opacity: 0.6 }}>Interactive Exhibition</span>
        </div>
      </div>

      {/* ---------- THREE.JS RENDER AREA ---------- */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
