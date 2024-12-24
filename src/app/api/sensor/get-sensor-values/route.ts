import { format } from 'date-fns';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();
    const response = await fetch('https://mygrow.leafai.io/api/get_sensor_value.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify({ 
        sn: body.sn,
        start: body.startDate ? format(new Date(body.startDate), 'yyyy-MM-dd') : undefined,
        end: body.endDate ? format(new Date(body.endDate), 'yyyy-MM-dd') : undefined,
        location_id: body.locationId
      })
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sensor value API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sensor values' },
      { status: 500 }
    );
  }
}