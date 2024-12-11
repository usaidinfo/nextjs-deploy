import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');

    const response = await fetch('https://mygrow.leafai.io/api/get_sensor.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch Sensor error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sensors' },
      { status: 500 }
    );
  }
}