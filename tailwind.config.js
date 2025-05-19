/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Stilyaカラーテーマ
        primary: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        secondary: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        // 男性向けモード系UI
        mode: {
          DEFAULT: '#333333',
          light: '#666666',
          dark: '#111111',
        },
        // 女性向けナチュラル系UI
        natural: {
          DEFAULT: '#E7E5DE',
          light: '#F5F5F0',
          dark: '#C8C6BE',
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans', 'SF Pro', 'sans-serif'],
      }
    },
  },
  plugins: [],
}