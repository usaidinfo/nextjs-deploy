'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import 'app/globals.css'

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl mx-auto text-center"> 
        <div className="absolute top-[-120px] left-[-80px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-60px] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative bg-[rgba(24,24,27,0.7)] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <img 
            src="/leafai-logo.png" 
            alt="Leaf AI" 
            className="w-24 mx-auto mb-6"
          />
          
          <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
            404
          </h1>
          
          <h2 className="mt-4 text-2xl font-semibold text-white">
            Page Not Found
          </h2>
          
          <p className="mt-4 text-zinc-400 max-w-md mx-auto">
            The page you&apos;re looking for seems to have vanished into thin air. 
            Maybe it&apos;s growing somewhere else?
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 
                     rounded-xl text-white flex items-center gap-2 mx-auto transition-all
                     hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <HomeRoundedIcon />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}