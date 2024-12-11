// src/app/api/plants/create-plant/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();

    const response = await fetch('https://mygrow.leafai.io/api/create_plant.php', {
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
    console.error('Create Plant error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create plant' },
      { status: 500 }
    );
  }
}