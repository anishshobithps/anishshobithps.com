/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["src/{components,layouts,pages}/**/*.{astro,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter"],
      },
      animation: {
        leftslide: "leftslide ease 0.5s backwards",
        rightslide: "rightslide ease 0.5s backwards",
        lift: "lift ease 0.5s backwards",
        pop: "pop ease 0.5s backwards",
        drop: "drop ease 0.5s backwards",
      },
      keyframes: {
        menu: {
          from: {
            transform: "translateY(-100vh)",
          },
          to: {
            transform: "translateY(0)",
          },
        },
        avatarring: {
          from: {
            transform: "translateX(-50%) translateY(-50%) scale(1)",
            opacity: 1,
          },
          to: {
            transform: "translateX(-50%) translateY(-50%) scale(1.1)",
            opacity: 0,
          },
        },
        leftslide: {
          from: {
            transform: "translateX(-30px)",
            opacity: 0,
          },
          to: {
            transform: "translateX(0)",
            opacity: 1,
          },
        },
        rightslide: {
          from: {
            transform: "translateX(30px)",
            opacity: 0,
          },
          to: {
            transform: "translateX(0)",
            opacity: 1,
          },
        },
        lift: {
          from: {
            transform: "translateY(30px)",
            opacity: 0,
          },
          to: {
            transform: "translateY(0)",
            opacity: 1,
          },
        },
        drop: {
          from: {
            transform: "translateY(-30px)",
            opacity: 0,
          },
          to: {
            transform: "translateY(0)",
            opacity: 1,
          },
        },
        pop: {
          from: {
            transform: "scale(0.8)",
            opacity: 0,
          },
          to: {
            transform: "scale(1)",
            opacity: 1,
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
  ],
};
