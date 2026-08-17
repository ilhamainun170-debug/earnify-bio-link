import { NextResponse } from 'next/server'

// Clean and decode HTML entities
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim()
}

// Clean title from common Amazon prefixes/suffixes
function cleanProductTitle(rawTitle: string): string {
  let title = decodeHtmlEntities(rawTitle)

  title = title
    .replace(/^Amazon(\.[a-z.]+)?\s*:\s*/i, '')
    .replace(/^Amazon\s*\|\s*/i, '')
    .replace(/\s*:\s*Amazon\.[a-z.]+$/i, '')
    .replace(/\s*\|\s*Amazon\.[a-z.]+$/i, '')
    .replace(/\s*:\s*Amazon$/i, '')
    .replace(/\s*\|\s*Amazon$/i, '')
    .replace(/\s*:\s*Books$/i, '')
    .replace(/\s*:\s*Electronics$/i, '')
    .replace(/\s*:\s*Clothing, Shoes & Jewelry$/i, '')
    .replace(/\s*:\s*Home & Kitchen$/i, '')
    .replace(/\s*:\s*Beauty & Personal Care$/i, '')
    .replace(/\s*:\s*Sports & Outdoors$/i, '')
    .replace(/\s*:\s*Toys & Games$/i, '')
    .replace(/\s*:\s*Everything Else$/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  return title
}

// Extract 10-char Amazon ASIN from any URL
function extractAmazonAsin(urlStr: string): string | null {
  const asinMatch = urlStr.match(/(?:\/dp\/|\/gp\/product\/|\/d\/|\/asin\/)([A-Z0-9]{10})(?:[/?&#]|$)/i)
  if (asinMatch && asinMatch[1]) {
    return asinMatch[1].toUpperCase()
  }
  return null
}

// Extract human readable title from Amazon URL slug
function extractTitleFromSlug(urlStr: string): string | null {
  try {
    const parsed = new URL(urlStr)
    const segments = parsed.pathname.split('/').filter(Boolean)
    // Amazon URLs are usually /product-title-slug/dp/ASIN
    for (let i = 0; i < segments.length; i++) {
      if (segments[i] === 'dp' && i > 0) {
        const slug = segments[i - 1]
        if (slug && slug.length > 2 && !slug.startsWith('B0')) {
          const readable = decodeURIComponent(slug).replace(/[-_]+/g, ' ').trim()
          return readable.charAt(0).toUpperCase() + readable.slice(1)
        }
      }
    }
  } catch {
    // ignore
  }
  return null
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let targetUrl: URL
    try {
      targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    let asin = extractAmazonAsin(targetUrl.toString())
    let slugTitle = extractTitleFromSlug(targetUrl.toString())

    let extractedTitle = slugTitle || ''
    let extractedImage = asin ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg` : ''
    let finalResolvedUrl = targetUrl.toString()

    // Fetch HTML with a 4-second timeout to follow redirects and get fresh metadata
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const response = await fetch(targetUrl.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        },
        redirect: 'follow',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        finalResolvedUrl = response.url || targetUrl.toString()
        const redirectedAsin = extractAmazonAsin(finalResolvedUrl)
        if (redirectedAsin) {
          asin = redirectedAsin
          if (!extractedImage) {
            extractedImage = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg`
          }
        }

        const redirectedSlugTitle = extractTitleFromSlug(finalResolvedUrl)
        if (redirectedSlugTitle && !extractedTitle) {
          extractedTitle = redirectedSlugTitle
        }

        const html = await response.text()

        // 1. Try extracting Amazon specific Title: #productTitle or #title
        const productTitleMatch = html.match(/id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i)
        if (productTitleMatch && productTitleMatch[1]) {
          extractedTitle = cleanProductTitle(productTitleMatch[1])
        }

        if (!extractedTitle) {
          const ogTitleMatch =
            html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i) ||
            html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:title["']/i)
          if (ogTitleMatch && ogTitleMatch[1]) {
            extractedTitle = cleanProductTitle(ogTitleMatch[1])
          }
        }

        if (!extractedTitle) {
          const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
          if (titleTagMatch && titleTagMatch[1]) {
            extractedTitle = cleanProductTitle(titleTagMatch[1])
          }
        }

        // 2. Try High-Res Images from HTML
        const oldHiresMatch = html.match(/id=["']landingImage["'][^>]*data-old-hires=["'](https?:\/\/[^"']+)["']/i)
        if (oldHiresMatch && oldHiresMatch[1]) {
          extractedImage = oldHiresMatch[1]
        } else {
          const ogImageMatch =
            html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](https?:\/\/[^"']+)["']/i) ||
            html.match(/<meta[^>]*content=["'](https?:\/\/[^"']+)["'][^>]*property=["']og:image["']/i)
          if (ogImageMatch && ogImageMatch[1]) {
            extractedImage = ogImageMatch[1]
          }
        }
      }
    } catch {
      // If network fetch times out or gets blocked, fallback to ASIN image & slug title
    }

    // Final fallback for Amazon items with ASIN
    if (asin && !extractedImage) {
      extractedImage = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg`
    }

    return NextResponse.json({
      success: true,
      title: extractedTitle || '',
      imageUrl: extractedImage || '',
      finalUrl: finalResolvedUrl,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scraping failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
