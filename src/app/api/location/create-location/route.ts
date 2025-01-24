// src/app/api/location/create-location/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();

    const response = await fetch('https://leafaiapi.projectsave.de/api/create_location.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Create location error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create location' },
      { status: 500 }
    );
  }
}