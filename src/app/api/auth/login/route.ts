// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import type { LoginRequest } from 'lib/types/auth';

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();

    const response = await fetch('https://leafaiapi.projectsave.de/api/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}