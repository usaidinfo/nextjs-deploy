import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundColor: {
        'input-bg': 'rgba(24, 24, 27, 0.5)',
        'form-bg': 'rgba(24, 24, 27, 0.3)', 
      },
    },
  },
  plugins: [],
} satisfies Config;