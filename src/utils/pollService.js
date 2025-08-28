import { db } from '@/config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

class PollService {
  constructor() {
    this.pollsCollection = 'polls';
    this.votesCollection = 'poll_votes';
  }

  // Créer un nouveau sondage
  async createPoll(pollData) {
    try {
      const poll = {
        ...pollData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        total_votes: 0,
        is_active: true
      };

      const docRef = await addDoc(collection(db, this.pollsCollection), poll);
      
      return {
        id: docRef.id,
        ...poll
      };
    } catch (error) {
      console.error('Erreur lors de la création du sondage:', error);
      throw new Error('Impossible de créer le sondage');
    }
  }

  // Récupérer un sondage par ID
  async getPollById(pollId) {
    try {
      const pollDoc = await getDoc(doc(db, this.pollsCollection, pollId));
      
      if (!pollDoc.exists()) {
        throw new Error('Sondage non trouvé');
      }

      return {
        id: pollDoc.id,
        ...pollDoc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du sondage:', error);
      throw error;
    }
  }

  // Récupérer les sondages d'une conversation
  async getPollsByConversation(conversationId, limit = 50) {
    try {
      const pollsQuery = query(
        collection(db, this.pollsCollection),
        where('conversation_id', '==', conversationId),
        where('is_active', '==', true),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(pollsQuery);
      const polls = [];

      querySnapshot.forEach((doc) => {
        polls.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return polls.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des sondages:', error);
      throw new Error('Impossible de récupérer les sondages');
    }
  }

  // Voter pour une option
  async voteForOption(pollId, optionId, userId) {
    try {
      // Vérifier si l'utilisateur a déjà voté
      const existingVote = await this.getUserVote(pollId, userId);
      
      if (existingVote) {
        // Mettre à jour le vote existant
        await updateDoc(doc(db, this.votesCollection, existingVote.id), {
          option_id: optionId,
          updated_at: serverTimestamp()
        });
      } else {
        // Créer un nouveau vote
        await addDoc(collection(db, this.votesCollection), {
          poll_id: pollId,
          user_id: userId,
          option_id: optionId,
          created_at: serverTimestamp()
        });
      }

      // Mettre à jour les statistiques du sondage
      await this.updatePollStats(pollId);
      
      return true;
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      throw new Error('Impossible de voter');
    }
  }

  // Récupérer le vote d'un utilisateur pour un sondage
  async getUserVote(pollId, userId) {
    try {
      const votesQuery = query(
        collection(db, this.votesCollection),
        where('poll_id', '==', pollId),
        where('user_id', '==', userId)
      );

      const querySnapshot = await getDocs(votesQuery);
      
      if (querySnapshot.empty) {
        return null;
      }

      const voteDoc = querySnapshot.docs[0];
      return {
        id: voteDoc.id,
        ...voteDoc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du vote:', error);
      return null;
    }
  }

  // Mettre à jour les statistiques d'un sondage
  async updatePollStats(pollId) {
    try {
      const votesQuery = query(
        collection(db, this.votesCollection),
        where('poll_id', '==', pollId)
      );

      const querySnapshot = await getDocs(votesQuery);
      const voteCounts = {};
      let totalVotes = 0;

      querySnapshot.forEach((doc) => {
        const vote = doc.data();
        voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
        totalVotes++;
      });

      // Mettre à jour le sondage avec les nouvelles statistiques
      await updateDoc(doc(db, this.pollsCollection, pollId), {
        total_votes: totalVotes,
        option_votes: voteCounts,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
    }
  }

  // Fermer un sondage
  async closePoll(pollId, userId) {
    try {
      const poll = await this.getPollById(pollId);
      
      if (poll.created_by !== userId) {
        throw new Error('Seul le créateur peut fermer le sondage');
      }

      await updateDoc(doc(db, this.pollsCollection, pollId), {
        is_active: false,
        closed_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la fermeture du sondage:', error);
      throw error;
    }
  }

  // Supprimer un sondage
  async deletePoll(pollId, userId) {
    try {
      const poll = await this.getPollById(pollId);
      
      if (poll.created_by !== userId) {
        throw new Error('Seul le créateur peut supprimer le sondage');
      }

      // Supprimer tous les votes associés
      const votesQuery = query(
        collection(db, this.votesCollection),
        where('poll_id', '==', pollId)
      );

      const votesSnapshot = await getDocs(votesQuery);
      const deletePromises = votesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Supprimer le sondage
      await deleteDoc(doc(db, this.pollsCollection, pollId));

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du sondage:', error);
      throw error;
    }
  }

  // Récupérer les sondages créés par un utilisateur
  async getPollsByUser(userId, limit = 20) {
    try {
      const pollsQuery = query(
        collection(db, this.pollsCollection),
        where('created_by', '==', userId),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(pollsQuery);
      const polls = [];

      querySnapshot.forEach((doc) => {
        polls.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return polls.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des sondages utilisateur:', error);
      throw new Error('Impossible de récupérer les sondages');
    }
  }
}

export default new PollService();
