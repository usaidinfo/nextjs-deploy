// src/app/api/plants/create-plant/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();

    if (!body.plant_name || !body.location_id || !body.soiltype) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await fetch('https://mygrow.leafai.io/api/create_plant.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify({
        plant_name: body.plant_name,
        location_id: body.location_id,
        soiltype: body.soiltype
      }),
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