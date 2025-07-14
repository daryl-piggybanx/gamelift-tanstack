"use client"

import type React from "react"
import { SignIn, AuthenticateWithRedirectCallback, Waitlist } from '@clerk/tanstack-react-start'

import logo from '~/assets/Logo-Bolt-White.png'
import background from '~/assets/background-tape.jpg'

export default function WaitlistForm() {
  return (
    <div className="flex flex-col items-center text-center">
      <a href="https://www.piggybanx.com/" className="flex items-center justify-center">
        <img src={logo} alt="PiggyBanx Logo" width={48} height={48} className="mb-4" />
      </a>
      {/* <h1 className="text-2xl font-bold tracking-tight">Into the PiggyVerse</h1> */}
      
      <div className="w-full mt-6  bg-cover bg-center bg-no-repeat">
        <Waitlist
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              header: "hidden",
            },
          }}
        />
      </div>
    </div>
  )
}