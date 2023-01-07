'use client'

import React from 'react'

export default function DesktopOnly({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col justify-center h-screen container text-center lg:hidden">
        <p>
          We apologize for the inconvenience, but it looks like the website is currently functioning
          better on desktop. Could you please try accessing it from a desktop device? Thank you for
          your understanding
        </p>
      </div>
      <div className="hidden lg:block">{children}</div>
    </>
  )
}
