export default function manifest() {
  return {
    name: 'Lunar Shift — Discover Your Hijri Birthday',
    short_name: 'Lunar Shift',
    description: 'Find your exact Hijri Date of Birth and forecast future birthdays.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e0e12',
    theme_color: '#0e0e12',
    icons: [
      {
        src: '/favicon.png',
        sizes: '277x277',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
