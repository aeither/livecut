'use client'

import React, { useState, useEffect } from 'react'

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  // State / Props
  const [hasMounted, setHasMounted] = useState(false)

  // Hooks
  useEffect(() => {
    setHasMounted(true)
    getProvider()
  }, [])

  const getProvider = () => {
    if ('martian' in window) {
      return window.martian
    }
    ;(window as any).open('https://www.martianwallet.xyz/', '_blank')
  }

  // Render
  if (!hasMounted) return null

  return <div>{children}</div>
}
