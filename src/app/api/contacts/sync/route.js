import { NextResponse } from 'next/server';

// Simulation d'une synchronisation avec un service externe
const syncContactsWithExternalService = async () => {
  // Simulation d'un délai de synchronisation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Retourner des contacts synchronisés
  return [
    {
      id: 'contact_sync_1',
      name: 'Alice Bernard',
      phone: '+33111222333',
      email: 'alice.bernard@email.com',
      profilePhoto: 'https://via.placeholder.com/150',
      status: 'En ligne',
      lastSeen: new Date().toISOString(),
      addedAt: new Date().toISOString(),
      isFavorite: false,
      isBlocked: false,
      notes: 'Contact synchronisé',
      labels: ['nouveau']
    },
    {
      id: 'contact_sync_2',
      name: 'Thomas Moreau',
      phone: '+33444555666',
      email: 'thomas.moreau@email.com',
      profilePhoto: 'https://via.placeholder.com/150',
      status: 'Dernière connexion il y a 1h',
      lastSeen: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      addedAt: new Date().toISOString(),
      isFavorite: false,
      isBlocked: false,
      notes: 'Contact synchronisé',
      labels: ['nouveau']
    }
  ];
};

export async function GET(request) {
  try {
    // Simulation de la synchronisation
    const syncedContacts = await syncContactsWithExternalService();
    
    return NextResponse.json({
      contacts: syncedContacts,
      total: syncedContacts.length,
      syncedAt: new Date().toISOString(),
      message: 'Synchronisation terminée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation des contacts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}
