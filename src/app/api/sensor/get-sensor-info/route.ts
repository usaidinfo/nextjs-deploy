// api/sensor/get-sensor-info/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const { sn } = await request.json();

    const response = await fetch('https://mygrow.leafai.io/api/get_sn_info.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify({ sn }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch Sensor Info Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sensor info' },
      { status: 500 }
    );
  }
}