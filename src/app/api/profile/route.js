import { NextResponse } from 'next/server';

// Simulation d'un profil utilisateur
let mockProfile = {
  id: 'user_1',
  name: 'Utilisateur Demo',
  email: 'demo@example.com',
  phone: '+33123456789',
  profilePhoto: 'https://via.placeholder.com/150',
  status: 'Disponible',
  bio: 'Développeur passionné',
  lastSeen: new Date().toISOString(),
  preferences: {
    theme: 'light',
    language: 'fr',
    notifications: {
      enabled: true,
      sound: true,
      vibration: true,
      showPreview: true
    },
    privacy: {
      lastSeen: 'everyone',
      profilePhoto: 'everyone',
      status: 'everyone',
      readReceipts: true
    },
    chat: {
      enterToSend: true,
      mediaAutoDownload: true,
      fontSize: 'medium'
    }
  }
};

// GET - Récupérer le profil utilisateur
export async function GET(request) {
  try {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      profile: mockProfile
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le profil utilisateur
export async function PUT(request) {
  try {
    const updates = await request.json();

    // Validation des données
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Données de mise à jour invalides' },
        { status: 400 }
      );
    }

    // Mise à jour du profil
    mockProfile = {
      ...mockProfile,
      ...updates,
      lastSeen: new Date().toISOString()
    };

    return NextResponse.json({
      profile: mockProfile,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour partiellement le profil
export async function PATCH(request) {
  try {
    const updates = await request.json();

    // Validation des données
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Données de mise à jour invalides' },
        { status: 400 }
      );
    }

    // Mise à jour partielle du profil
    mockProfile = {
      ...mockProfile,
      ...updates,
      lastSeen: new Date().toISOString()
    };

    return NextResponse.json({
      profile: mockProfile,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
