import { NextResponse } from 'next/server';
import { db } from '@/utils/firebaseConfig';
import { getAuth } from 'firebase-admin/auth';
import { collection, getDocs, query, where, limit as fsLimit, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// GET /api/contacts - Récupérer tous les contacts de l'utilisateur
export async function GET(request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    // In Next.js API routes on server, verify token via Firebase Admin (if configured)
    let user = null;
    try {
      const decoded = await getAuth().verifyIdToken(token);
      user = { userId: decoded.uid };
    } catch {
      user = null;
    }
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const search = searchParams.get('search') || '';
    const isFavorite = searchParams.get('isFavorite');
    const label = searchParams.get('label');
    const groupId = searchParams.get('groupId');

    // Construire les filtres
    const filters = {};
    if (search) filters.search = search;
    if (isFavorite !== null) filters.isFavorite = isFavorite === 'true';
    if (label) filters.label = label;
    if (groupId) filters.groupId = parseInt(groupId);

    // Récupérer les contacts
    const col = collection(db, 'contacts');
    let q = query(col, where('user_id', '==', user.userId));
    const snap = await getDocs(q);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const filtered = all.filter(c => !c.deleted)
      .filter(c => !filters.search || `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().includes(filters.search.toLowerCase()))
      .filter(c => filters.isFavorite === undefined || c.isFavorite === filters.isFavorite)
      .filter(c => !filters.groupId || c.groupId === Number(filters.groupId));
    const contacts = filtered.slice(offset, offset + limit);
    const stats = { total_contacts: filtered.length };

    return NextResponse.json({
      success: true,
      data: {
        contacts,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.total_contacts
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des contacts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Créer un nouveau contact
export async function POST(request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await authService.verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les données du contact
    const contactData = await request.json();
    
    // Validation des données requises
    if (!contactData.first_name || !contactData.last_name) {
      return NextResponse.json(
        { error: 'Le prénom et le nom sont requis' },
        { status: 400 }
      );
    }

    // Ajouter l'ID de l'utilisateur
    contactData.user_id = user.userId;

    // Créer le contact
    const newRef = doc(collection(db, 'contacts'));
    const data = { ...contactData, created_at: serverTimestamp(), updated_at: serverTimestamp() };
    await setDoc(newRef, data);
    const newContact = { id: newRef.id, ...contactData };

    return NextResponse.json({
      success: true,
      data: newContact,
      message: 'Contact créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur lors de la création du contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du contact' },
      { status: 500 }
    );
  }
}
