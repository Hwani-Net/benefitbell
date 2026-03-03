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
    sitemap: 'https://zippy-lolly-1f23de.netlify.app/sitemap.xml',
  }
}
