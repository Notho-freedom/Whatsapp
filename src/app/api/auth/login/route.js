import { NextResponse } from 'next/server';

// Simulation d'une base de données d'utilisateurs
const mockUsers = [
  {
    id: 1,
    email: 'demo@example.com',
    password: 'password123',
    name: 'Utilisateur Demo',
    avatar: '/api/avatar/1',
    phone: '+33123456789'
  }
];

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Génération des tokens (simulation)
    const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 heure

    // Retourner les données d'authentification
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone
      },
      accessToken,
      refreshToken,
      expiresAt
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
