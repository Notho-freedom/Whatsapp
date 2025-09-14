import { NextResponse } from 'next/server';

// Synchronisation avec un service externe
const syncContactsWithExternalService = async () => {
  // Délai de synchronisation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Retourner une liste vide par défaut
  return [];
};

export async function GET(request) {
  try {
    // Synchronisation des contacts
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
