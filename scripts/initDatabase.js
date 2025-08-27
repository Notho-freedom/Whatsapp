const databaseService = require('../src/utils/databaseService');
const authService = require('../src/utils/authDatabaseService');
const conversationService = require('../src/utils/conversationDatabaseService');
const messageService = require('../src/utils/messageDatabaseService');
const contactService = require('../src/utils/contactDatabaseService');

async function initializeDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...');
    
    // Attendre que la base de données soit initialisée
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Créer des utilisateurs de test
    const testUsers = [
      {
        username: 'demo',
        email: 'demo@example.com',
        password: 'password123',
        phone: '+33123456789',
        first_name: 'Utilisateur',
        last_name: 'Demo',
        profile_photo_url: '/api/avatar/1',
        status_message: 'Disponible'
      },
      {
        username: 'alice',
        email: 'alice@example.com',
        password: 'password123',
        phone: '+33123456790',
        first_name: 'Alice',
        last_name: 'Martin',
        profile_photo_url: '/api/avatar/2',
        status_message: 'Au travail'
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password: 'password123',
        phone: '+33123456791',
        first_name: 'Bob',
        last_name: 'Dupont',
        profile_photo_url: '/api/avatar/3',
        status_message: 'En réunion'
      },
      {
        username: 'charlie',
        email: 'charlie@example.com',
        password: 'password123',
        phone: '+33123456792',
        first_name: 'Charlie',
        last_name: 'Bernard',
        profile_photo_url: '/api/avatar/4',
        status_message: 'Ne pas déranger'
      }
    ];

    console.log('👥 Création des utilisateurs de test...');
    
    for (const userData of testUsers) {
      try {
        const user = await authService.createUser(userData);
        console.log(`✅ Utilisateur créé: ${user.username} (${user.email})`);
      } catch (error) {
        if (error.message.includes('existe déjà')) {
          console.log(`⚠️ Utilisateur existe déjà: ${userData.username}`);
        } else {
          console.error(`❌ Erreur lors de la création de ${userData.username}:`, error.message);
        }
      }
    }

    // Créer des contacts de test
    console.log('📞 Création des contacts de test...');
    
    const testContacts = [
      {
        user_id: 1,
        first_name: 'Alice',
        last_name: 'Martin',
        display_name: 'Alice Martin',
        phone: '+33123456790',
        email: 'alice@example.com',
        profile_photo_url: '/api/avatar/2',
        is_favorite: true,
        labels: JSON.stringify(['famille', 'travail']),
        notes: 'Collègue de travail',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: 1,
        first_name: 'Bob',
        last_name: 'Dupont',
        display_name: 'Bob Dupont',
        phone: '+33123456791',
        email: 'bob@example.com',
        profile_photo_url: '/api/avatar/3',
        is_favorite: false,
        labels: JSON.stringify(['ami']),
        notes: 'Ami d\'enfance',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: 1,
        first_name: 'Charlie',
        last_name: 'Bernard',
        display_name: 'Charlie Bernard',
        phone: '+33123456792',
        email: 'charlie@example.com',
        profile_photo_url: '/api/avatar/4',
        is_favorite: true,
        labels: JSON.stringify(['travail']),
        notes: 'Manager',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const contactData of testContacts) {
      try {
        databaseService.run(`
          INSERT INTO contacts (
            user_id, first_name, last_name, display_name, phone, email, profile_photo_url,
            is_favorite, labels, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          contactData.user_id, contactData.first_name, contactData.last_name, contactData.display_name,
          contactData.phone, contactData.email, contactData.profile_photo_url, contactData.is_favorite,
          contactData.labels, contactData.notes, contactData.created_at, contactData.updated_at
        ]);
        console.log(`✅ Contact créé: ${contactData.display_name}`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`⚠️ Contact existe déjà: ${contactData.display_name}`);
        } else {
          console.error(`❌ Erreur lors de la création du contact ${contactData.display_name}:`, error.message);
        }
      }
    }

    // 📁 Création des groupes de contacts
    console.log('📁 Création des groupes de contacts...');
    const testGroups = [
      {
        user_id: 1,
        name: 'Famille',
        description: 'Membres de la famille',
        color: '#FF6B6B',
        is_system: true
      },
      {
        user_id: 1,
        name: 'Travail',
        description: 'Collègues de travail',
        color: '#4ECDC4',
        is_system: true
      },
      {
        user_id: 1,
        name: 'Amis',
        description: 'Amis proches',
        color: '#45B7D1',
        is_system: true
      },
      {
        user_id: 1,
        name: 'Projet Alpha',
        description: 'Équipe du projet Alpha',
        color: '#96CEB4',
        is_system: false
      }
    ];

    const createdGroups = [];
    for (const groupData of testGroups) {
      try {
        const group = await contactService.createContactGroup(groupData);
        createdGroups.push(group);
        console.log(`✅ Groupe créé: ${group.name}`);
      } catch (error) {
        console.log(`❌ Erreur lors de la création du groupe ${groupData.name}: ${error.message}`);
      }
    }

    // 🔗 Ajout des contacts aux groupes
    console.log('🔗 Ajout des contacts aux groupes...');
    const groupAssignments = [
      { contactId: 1, groupName: 'Famille' }, // Alice - Famille
      { contactId: 1, groupName: 'Travail' }, // Alice - Travail
      { contactId: 2, groupName: 'Amis' }, // Bob - Amis
      { contactId: 2, groupName: 'Projet Alpha' }, // Bob - Projet Alpha
      { contactId: 3, groupName: 'Travail' }, // Charlie - Travail
      { contactId: 3, groupName: 'Projet Alpha' } // Charlie - Projet Alpha
    ];

    for (const assignment of groupAssignments) {
      try {
        const group = createdGroups.find(g => g.name === assignment.groupName);
        if (group) {
          await contactService.addContactToGroup(assignment.contactId, group.id);
          console.log(`✅ Contact ${assignment.contactId} ajouté au groupe ${assignment.groupName}`);
        }
      } catch (error) {
        console.log(`❌ Erreur lors de l'ajout du contact ${assignment.contactId} au groupe ${assignment.groupName}: ${error.message}`);
      }
    }

    // Créer des conversations de test
    console.log('💬 Création des conversations de test...');
    
    const testConversations = [
      {
        type: 'individual',
        name: null,
        description: 'Conversation avec Alice Martin',
        created_by: 1
      },
      {
        type: 'individual',
        name: null,
        description: 'Conversation avec Bob Dupont',
        created_by: 1
      },
      {
        type: 'group',
        name: 'Équipe Projet',
        description: 'Groupe de travail pour le projet',
        created_by: 1,
        avatar_url: '/api/avatar/group1',
        custom_settings: JSON.stringify({
          only_admins_can_send_messages: false,
          only_admins_can_edit_info: true,
          only_admins_can_pin_messages: true
        })
      }
    ];

    for (const convData of testConversations) {
      try {
        const conversation = await conversationService.createConversation(convData);
        console.log(`✅ Conversation créée: ${conversation.name || 'Individuelle'} (ID: ${conversation.id})`);
        
        // Ajouter des participants
        if (conversation.type === 'group') {
          await conversationService.addParticipant(conversation.id, 1, { role: 'admin' });
          await conversationService.addParticipant(conversation.id, 2, { role: 'member' });
          await conversationService.addParticipant(conversation.id, 3, { role: 'member' });
          await conversationService.addParticipant(conversation.id, 4, { role: 'member' });
          console.log(`✅ Participants ajoutés au groupe: ${conversation.name}`);
        } else {
          await conversationService.addParticipant(conversation.id, 1, { role: 'member' });
          
          // Ajouter l'autre participant selon la description
          let otherUserId = 2; // Alice par défaut
          if (convData.description.includes('Bob')) otherUserId = 3;
          if (convData.description.includes('Charlie')) otherUserId = 4;
          
          await conversationService.addParticipant(conversation.id, otherUserId, { role: 'member' });
          console.log(`✅ Participants ajoutés à la conversation individuelle`);
        }

        // Créer des messages de test pour cette conversation
        console.log(`📝 Création de messages de test pour la conversation ${conversation.id}...`);
        const testMessages = [
          {
            conversation_id: conversation.id,
            sender_id: conversation.type === 'group' ? 2 : (convData.description.includes('Bob') ? 3 : 2),
            message_type: 'text',
            content: 'Salut ! Comment ça va ?',
            created_at: new Date(Date.now() - 3600000).toISOString() // Il y a 1 heure
          },
          {
            conversation_id: conversation.id,
            sender_id: 1,
            message_type: 'text',
            content: 'Très bien, merci ! Et toi ?',
            created_at: new Date(Date.now() - 3500000).toISOString() // Il y a 58 minutes
          },
          {
            conversation_id: conversation.id,
            sender_id: conversation.is_group ? 3 : (convData.description.includes('Bob') ? 3 : 2),
            message_type: 'text',
            content: conversation.is_group ? 'Réunion demain à 10h' : 'On se voit demain ?',
            created_at: new Date(Date.now() - 3400000).toISOString() // Il y a 56 minutes
          },
          {
            conversation_id: conversation.id,
            sender_id: 1,
            message_type: 'text',
            content: conversation.is_group ? 'Parfait, je serai là !' : 'Oui, rendez-vous à 14h ! 👍',
            created_at: new Date(Date.now() - 3300000).toISOString() // Il y a 55 minutes
          }
        ];

        for (const msgData of testMessages) {
          try {
            const message = await messageService.createMessage(msgData);
            console.log(`✅ Message créé: "${message.content.substring(0, 30)}..." (ID: ${message.id})`);
            
            // Note: Les tables message_reactions et message_reads n'existent pas dans le schéma actuel
            // Les réactions et marquages comme lu ne sont pas créés pour l'instant
          } catch (error) {
            console.error(`❌ Erreur lors de la création du message:`, error.message);
          }
        }

                            // Note: Les colonnes last_message, last_message_sender_id, last_message_timestamp
                    // n'existent pas dans la table conversations, donc on ne les met pas à jour
                    console.log(`✅ Messages créés pour la conversation ${conversation.id}`);

      } catch (error) {
        console.error(`❌ Erreur lors de la création de la conversation:`, error.message);
      }
    }

    // Afficher les informations de la base de données
    const dbInfo = databaseService.getDatabaseInfo();
    console.log('\n📊 Informations de la base de données:');
    console.log(`📍 Chemin: ${dbInfo.path}`);
    console.log(`📈 Nombre de tables: ${dbInfo.tableCount}`);
    console.log(`💾 Taille: ${dbInfo.size}`);
    console.log(`📋 Tables: ${dbInfo.tables.join(', ')}`);

    console.log('\n✅ Initialisation de la base de données terminée avec succès !');
    console.log('\n🔑 Comptes de test disponibles:');
    console.log('   - demo@example.com / password123');
    console.log('   - alice@example.com / password123');
    console.log('   - bob@example.com / password123');
    console.log('   - charlie@example.com / password123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    // Fermer la connexion
    databaseService.close();
    process.exit(0);
  }
}

// Exécuter l'initialisation
initializeDatabase();
