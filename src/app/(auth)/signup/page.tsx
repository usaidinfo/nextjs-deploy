import SignUpForm from '@components/auth/SignUpForm'
import React from 'react'
import '../../globals.css';
import Image from 'next/image';



function SignUpPage() {
  return (
    <div className='grid md:grid-cols-2 grid-cols-1 min-h-screen overflow-hidden'>
      <div className="relative overflow-hidden hidden md:block">
        <img
          src="/login-image.png"
          alt="Plant"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-sm font-semibold tracking-[0.3em] mb-2 uppercase font-sans">
            INSPIRED BY THE FUTURE:
          </span>
          <h1 className="text-4xl font-semibold text-center tracking-[0.1em] uppercase font-sans">
            THE VISION UI DASHBOARD
          </h1>
        </div>
      </div>
      <div className="relative flex items-center justify-center bg-gradient"
      >
        <Image
          src="/leafai-logo.png"
          alt="Leaf AI Logo"
          width={96}
          height={96}
          className="absolute top-0 right-4 object-contain rounded-xl mt-4 opacity-50"
          priority
        />
        
        <div className="absolute bottom-8 left-8 text-white/50 text-xs">
          © 2024, Made with ❤️ by Team Leaf AI
        </div>

        <div className="flex flex-col items-center p-8">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}

export default SignUpPage