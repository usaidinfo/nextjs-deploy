// src/app/api/plants/get-plants/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();

    console.log('API Route received request with:', {
      locationId: body.location_id,
      token: token ? 'exists' : 'missing'
    });

    const response = await fetch('https://leafaiapi.projectsave.de/api/get_plants.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify({
        location_id: body.location_id
      })
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch Plant error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch plants' },
      { status: 500 }
    );
  }
}