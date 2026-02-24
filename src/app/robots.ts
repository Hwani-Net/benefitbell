import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/profile', '/premium', '/ai'],
      },
    ],
    sitemap: 'https://naedon-finder.vercel.app/sitemap.xml',
  }
}
