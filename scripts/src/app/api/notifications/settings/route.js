import { NextResponse } from 'next/server';

// Simulation des paramètres de notification
let mockSettings = {
  enabled: true,
  sound: true,
  vibration: true,
  showPreview: true,
  showSenderName: true,
  showMessageContent: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  desktopNotifications: true,
  mobileNotifications: true,
  emailNotifications: false,
  categories: {
    messages: true,
    calls: true,
    status: true,
    media: true,
    system: true
  }
};

// GET - Récupérer les paramètres de notification
export async function GET(request) {
  try {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      settings: mockSettings
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres de notification
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
    
    // Mettre à jour les paramètres
    mockSettings = {
      ...mockSettings,
      ...updates
    };
    
    return NextResponse.json({
      settings: mockSettings,
      message: 'Paramètres mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour partiellement les paramètres
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
    
    // Mise à jour partielle des paramètres
    mockSettings = {
      ...mockSettings,
      ...updates
    };
    
    return NextResponse.json({
      settings: mockSettings,
      message: 'Paramètres mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
