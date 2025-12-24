import {
  DataStyleConfig,
  DisplayConfig,
  EffectsConfig,
  FontsConfig,
  ProtectedRoutesConfig,
  RoutesConfig,
  SchemaConfig,
  SocialSharingConfig,
  StyleConfig,
} from "@/types";
import { home } from "./index";

/* ======================================
   BASE URL
====================================== */

const baseURL: string = "https://demo.magic-portfolio.com";

/* ======================================
   ROUTES (CRITICAL FIX FOR SANITY)
====================================== */

const routes: RoutesConfig = {
  "/": true,
  "/about": true,
  "/work": true,
  "/blog": true,
  "/gallery": true,
  "/museum": true,

  // 🔐 Sanity Studio (EXPLICIT — NO WILDCARDS)
  "/studio": true,
  "/studio*": true,
};

/* ======================================
   DISPLAY
====================================== */

const display: DisplayConfig = {
  location: true,
  time: true,
  themeSwitcher: true,
};
/* ======================================
   FONTS
====================================== */

import { Geist, Geist_Mono } from "next/font/google";

const heading = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const label = Geist({
  variable: "--font-label",
  subsets: ["latin"],
  display: "swap",
});

const code = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

const fonts: FontsConfig = {
  heading,
  body,
  label,
  code,
};

/* ======================================
   STYLE
====================================== */

const style: StyleConfig = {
  theme: "system",
  neutral: "gray",
  brand: "pink",
  accent: "yellow",
  solid: "contrast",
  solidStyle: "flat",
  border: "playful",
  surface: "filled",
  transition: "all",
  scaling: "100",
};

/* ======================================
   DATA STYLE
====================================== */

const dataStyle: DataStyleConfig = {
  variant: "gradient",
  mode: "categorical",
  height: 24,
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

/* ======================================
   EFFECTS
====================================== */

const effects: EffectsConfig = {
  mask: {
    cursor: false,
    x: 50,
    y: 0,
    radius: 100,
  },
  gradient: {
    display: false,
    opacity: 100,
    x: 50,
    y: 60,
    width: 100,
    height: 50,
    tilt: 0,
    colorStart: "accent-background-strong",
    colorEnd: "page-background",
  },
  dots: {
    display: true,
    opacity: 40,
    size: "2",
    color: "brand-background-strong",
  },
  grid: {
    display: false,
    opacity: 100,
    color: "neutral-alpha-medium",
    width: "0.25rem",
    height: "0.25rem",
  },
  lines: {
    display: false,
    opacity: 100,
    color: "neutral-alpha-weak",
    size: "16",
    thickness: 1,
    angle: 45,
  },
};

/* ======================================
   SCHEMA
====================================== */

const schema: SchemaConfig = {
  logo: "",
  type: "Organization",
  name: "Once UI",
  description: home.description,
  email: "lorant@once-ui.com",
};

/* ======================================
   SOCIAL SHARING
====================================== */

const socialSharing: SocialSharingConfig = {
  display: true,
  platforms: {
    x: true,
    linkedin: true,
    facebook: false,
    pinterest: false,
    whatsapp: false,
    reddit: false,
    telegram: false,
    email: true,
    copyLink: true,
  },
};

/* ======================================
   EXPORTS
====================================== */

export {
  display,
  routes,
  baseURL,
  fonts,
  style,
  schema,
  socialSharing,
  effects,
  dataStyle,
};
