export default async function sitemap() {
  return [
    {
      url: 'https://lunar-shift.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
  ]
}
