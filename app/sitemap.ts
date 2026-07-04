import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://flolabs.international'

  // عدّل الروابط دي حسب صفحاتك الحالية
  const routes = [
    '',
    '/about',
    '/projects',
    '/internships',
    '/blogs',
    '/contact',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
