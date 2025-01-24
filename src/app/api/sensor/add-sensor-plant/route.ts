// src/app/api/sensor/add-sensor-plant/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();

    const response = await fetch('https://leafaiapi.projectsave.de/api/add_sensor_plant.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Add sensor to plant error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add sensor to plant' },
      { status: 500 }
    );
  }
}