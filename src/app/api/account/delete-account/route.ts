// src/app/api/account/delete-account/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');

    const response = await fetch('https://leafaiapi.projectsave.de/api/delete_account.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify({ remove: true }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete account' },
      { status: 500 }
    );
  }
}