import { NextResponse } from 'next/server';

// Simulation d'une base de données de contacts
let mockContacts = [
  {
    id: 'contact_1',
    name: 'Jean Dupont',
    phone: '+33123456789',
    email: 'jean.dupont@email.com',
    profilePhoto: 'https://via.placeholder.com/150',
    status: 'En ligne',
    lastSeen: new Date().toISOString(),
    addedAt: '2024-01-01T00:00:00.000Z',
    isFavorite: true,
    isBlocked: false,
    notes: 'Ami de longue date',
    labels: ['famille', 'travail']
  },
  {
    id: 'contact_2',
    name: 'Marie Martin',
    phone: '+33987654321',
    email: 'marie.martin@email.com',
    profilePhoto: 'https://via.placeholder.com/150',
    status: 'Dernière connexion il y a 2h',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    addedAt: '2024-01-02T00:00:00.000Z',
    isFavorite: false,
    isBlocked: false,
    notes: 'Collègue de travail',
    labels: ['travail']
  },
  {
    id: 'contact_3',
    name: 'Pierre Durand',
    phone: '+33555666777',
    email: 'pierre.durand@email.com',
    profilePhoto: 'https://via.placeholder.com/150',
    status: 'Ne pas déranger',
    lastSeen: new Date().toISOString(),
    addedAt: '2024-01-03T00:00:00.000Z',
    isFavorite: true,
    isBlocked: false,
    notes: '',
    labels: ['famille']
  }
];

// GET - Récupérer tous les contacts
export async function GET(request) {
  try {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      contacts: mockContacts,
      total: mockContacts.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder les contacts
export async function POST(request) {
  try {
    const { contacts } = await request.json();

    // Validation des données
    if (!Array.isArray(contacts)) {
      return NextResponse.json(
        { error: 'Les contacts doivent être un tableau' },
        { status: 400 }
      );
    }

    // Mise à jour des contacts
    mockContacts = contacts;

    return NextResponse.json({
      message: 'Contacts sauvegardés avec succès',
      total: contacts.length
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des contacts:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
