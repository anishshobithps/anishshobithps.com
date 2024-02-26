/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              "text-decoration": "none",
              "background-repeat": "no-repeat",
              "background-size": "100% 1.5px",
              "background-position": "0 100%",
              "background-image":
                "linear-gradient(to right, rgb(var(--foreground)/1), rgb(var(--foreground)/1))",
              "&:hover": {
                color: "rgb(var(--color-text-link))",
              },
            },
            "h1, h2, h3, h4, h5": {
              color: "rgb(var(--foreground))",
            },
            iframe: {
              "border-radius": "0.5rem",
            },
            code: {
              "background-color": "rgb(var(--color-code-bg))",
              color: "rgb(var(--color-code-text))",
              padding: "0.25rem 0.5rem",
              "border-radius": "0.25rem",
              "font-size": "0.875rem",
              "line-height": "1.5",
            },
            "ol > li::before": {
              color: "rgb(var(--color-text-bold))",
            },
            li: {
              "margin-bottom": "0.5rem",
              color: "rgb(var(--color-code-text))",
              "font-size": "1rem",
              "line-height": "1.5",
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
            blockquote: {
              border: "none",
              position: "relative",
              width: "96%",
              margin: "0 auto",
              "font-size": "1.0625em",
              "padding-top": "1.5rem",
              "padding-bottom": "0.5rem",
              "padding-left": "1.5rem",
              "padding-right": "1.5rem",
            },
            "blockquote::before": {
              "font-family": "Arial",
              content: "'“'",
              "font-size": "4em",
              color: "rgb(var(--color-text-bold))",
              position: "absolute",
              left: "-10px",
              top: "-10px",
            },
            "blockquote::after": {
              content: "",
            },
            "blockquote p:first-of-type::before": {
              content: "",
            },
            "blockquote p:last-of-type::after": {
              content: "",
            },
          },
        },
      }),
      backgroundImage: {
        topo: "url(/topography.svg)",
        brush: "url('/brush.svg')",
      },
      cursor: {
        default: "url(/cursors/pointer.cur), default",
        pointer: "url(/cursors/link.cur), pointer",
      },
      dropShadow: {
        glow: [
          "0 0px 20px rgba(255,255, 255, 0.35)",
          "0 0px 65px rgba(255, 255,255, 0.2)",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/typography"),
  ],
};
