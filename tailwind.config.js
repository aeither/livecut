/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          ...require('daisyui/src/colors/themes')['[data-theme=dark]'],
          primary: '#00D998',
          secondary: '#D926A9',
          accent: '#22d3ee',
          neutral: '#1D1E23',
          'base-100': '#0E0E0E',
          'base-200': '#151619',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBD23',
          error: '#F87272',
        },
      },
    ],
  },
  plugins: [require('daisyui')],
}
