import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token d\'accès manquant' },
      { status: 400 }
    );
  }

  try {
    // Appeler l'API Google People côté serveur (pas de CORS)
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos,organizations&pageSize=1000',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur API Google People:', data);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération des contacts',
          details: data.error || data.message || `Status: ${response.status}`,
          status: response.status
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur serveur lors de la récupération des contacts:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors de la récupération des contacts',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
