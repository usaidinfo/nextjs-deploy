// src/app/api/plants/delete-plant/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();

    const response = await fetch('https://leafaiapi.projectsave.de/api/delete_plant.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify({ plant_id: body.plant_id }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Delete plant error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete plant' },
      { status: 500 }
    );
  }
}