// src/app/api/sensor/get-sensors
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');

    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const response = await fetch('https://mygrow.leafai.io/api/get_sensor.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token,
      }
    });

    const data = await response.json();
    
    if (data.error && data.error === 'Invalid token') {
      return NextResponse.json(data, { status: 401 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch Sensor error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensors' },
      { status: 500 }
    );
  }
}