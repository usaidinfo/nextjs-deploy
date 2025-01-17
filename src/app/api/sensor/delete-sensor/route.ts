// src/app/api/sensor/delete-sensor/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();

    const response = await fetch('https://mygrow.leafai.io/api/delete_sensor.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify({ sn: body.sn }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Delete sensor error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete sensor' },
      { status: 500 }
    );
  }
}