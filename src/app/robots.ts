export const runtime = 'edge'

export default async function GET() {
  return new Response(
    `User-agent: *
Allow: /

Sitemap: https://lunar-shift.vercel.app/sitemap.xml
`,
    {
      headers: { 'Content-Type': 'text/plain' },
    }
  )
}
