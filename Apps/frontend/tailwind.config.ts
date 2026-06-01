import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Karena kamu sudah mendefinisikan banyak warna di globals.css (:root),
      // konfigurasi extend ini bisa dibiarkan kosong untuk sekarang.
      // Tailwind akan tetap berjalan normal bersamaan dengan CSS Modules kamu.
    },
  },
  plugins: [],
};

export default config;