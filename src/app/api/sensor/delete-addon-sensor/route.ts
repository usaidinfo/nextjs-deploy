// src/app/api/sensor/delete-addon-sensor/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();

    const response = await fetch('https://leafaiapi.projectsave.de/api/delete_addonsensor.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify({
        sn: body.sn,
        addonsensorsn: body.addonsensorsn
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Delete addon sensor error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete addon sensor' },
      { status: 500 }
    );
  }
}