import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Token');
    const body = await request.json();

    const response = await fetch('https://mygrow.leafai.io/api/change_email.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || '',
      },
      body: JSON.stringify({ new_mail: body.new_mail }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to change email' },
      { status: 500 }
    );
  }
}