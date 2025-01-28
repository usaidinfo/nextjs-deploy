// src/app/api/change-username/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();

    const response = await fetch('https://leafaiapi.projectsave.de/api/change_username.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify({ new_username: body.new_username }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Change username error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to change username' },
      { status: 500 }
    );
  }
}