'use client'

import { useEffect, useState } from 'react'

interface AdsBannerProps {
  adSlot: string // Google AdSense slot ID
  adClient?: string // Google AdSense client ID
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle?: any
  }
}

export function AdsBanner({ adSlot, adClient = 'ca-pub-xxxxxxxxxxxxxxxx', style }: AdsBannerProps) {
  const [showAds, setShowAds] = useState(true)

  useEffect(() => {
    // Push ad if available
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch (error) {
      console.error('[v0] Ad error:', error)
    }
  }, [])

  if (!showAds) return null

  return (
    <div style={style} className="w-full">
      {/* Google AdSense Ad Unit */}
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          ...style
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
