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

  // Remove Amazon prefix/suffixes
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

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Ensure valid URL
    let targetUrl: URL
    try {
      targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Fetch the URL with standard browser headers to handle redirects and avoid automated blocks
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    }

    const response = await fetch(targetUrl.toString(), {
      headers,
      redirect: 'follow',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch webpage (${response.status})` },
        { status: 422 }
      )
    }

    const html = await response.text()

    let extractedTitle = ''
    let extractedImage = ''

    // 1. Try extracting Amazon specific Title: #productTitle or #title
    const productTitleMatch = html.match(/id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i)
    if (productTitleMatch && productTitleMatch[1]) {
      extractedTitle = productTitleMatch[1].trim()
    }

    if (!extractedTitle) {
      const titleSpanMatch = html.match(/id=["']title["'][^>]*>([\s\S]*?)<\/span>/i)
      if (titleSpanMatch && titleSpanMatch[1]) {
        extractedTitle = titleSpanMatch[1].trim()
      }
    }

    // 2. Try OpenGraph Title
    if (!extractedTitle) {
      const ogTitleMatch =
        html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i) ||
        html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:title["']/i)
      if (ogTitleMatch && ogTitleMatch[1]) {
        extractedTitle = ogTitleMatch[1]
      }
    }

    // 3. Try standard <title> tag
    if (!extractedTitle) {
      const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      if (titleTagMatch && titleTagMatch[1]) {
        extractedTitle = titleTagMatch[1]
      }
    }

    // Clean up title
    if (extractedTitle) {
      extractedTitle = cleanProductTitle(extractedTitle)
    }

    // 1. Try extracting Amazon specific High-Res Image: #landingImage or #imgBlkFront
    // Check data-old-hires
    const oldHiresMatch = html.match(/id=["']landingImage["'][^>]*data-old-hires=["'](https?:\/\/[^"']+)["']/i)
    if (oldHiresMatch && oldHiresMatch[1]) {
      extractedImage = oldHiresMatch[1]
    }

    // Check data-a-dynamic-image
    if (!extractedImage) {
      const dynamicImageMatch = html.match(/data-a-dynamic-image=["'](\{[\s\S]*?\})["']/i)
      if (dynamicImageMatch && dynamicImageMatch[1]) {
        try {
          const parsedDynamic = JSON.parse(decodeHtmlEntities(dynamicImageMatch[1]))
          const keys = Object.keys(parsedDynamic)
          if (keys.length > 0) {
            // Usually the highest resolution or first key
            extractedImage = keys[0]
          }
        } catch {
          // ignore parse error
        }
      }
    }

    // Check landingImage src
    if (!extractedImage) {
      const landingSrcMatch = html.match(/id=["']landingImage["'][^>]*src=["'](https?:\/\/[^"']+)["']/i)
      if (landingSrcMatch && landingSrcMatch[1]) {
        extractedImage = landingSrcMatch[1]
      }
    }

    // Check imgBlkFront src (Books/media)
    if (!extractedImage) {
      const imgBlkMatch = html.match(/id=["']imgBlkFront["'][^>]*src=["'](https?:\/\/[^"']+)["']/i)
      if (imgBlkMatch && imgBlkMatch[1]) {
        extractedImage = imgBlkMatch[1]
      }
    }

    // 2. Try OpenGraph Image
    if (!extractedImage) {
      const ogImageMatch =
        html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](https?:\/\/[^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["'](https?:\/\/[^"']+)["'][^>]*property=["']og:image["']/i)
      if (ogImageMatch && ogImageMatch[1]) {
        extractedImage = ogImageMatch[1]
      }
    }

    // 3. Try twitter:image
    if (!extractedImage) {
      const twitterImageMatch =
        html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["'](https?:\/\/[^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["'](https?:\/\/[^"']+)["'][^>]*name=["']twitter:image["']/i)
      if (twitterImageMatch && twitterImageMatch[1]) {
        extractedImage = twitterImageMatch[1]
      }
    }

    return NextResponse.json({
      success: true,
      title: extractedTitle || '',
      imageUrl: extractedImage || '',
      finalUrl: response.url || targetUrl.toString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scraping failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
