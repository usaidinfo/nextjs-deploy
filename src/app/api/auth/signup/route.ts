import { NextResponse } from 'next/server';
import type { SignUpRequest } from 'lib/types/auth';

export async function POST(request: Request) {
  try {
    const body: SignUpRequest = await request.json();

    const response = await fetch('https://mygrow.leafai.io/api/register.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Signup failed' },
      { status: 500 }
    );
  }
}