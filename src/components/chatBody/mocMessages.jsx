const mocMessages = [
  // Message texte simple
  {
    id: 'm1',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Salut ! Comment ça va ? 😊',
    time: '14:02',
  },

  // Message envoyé par l'utilisateur
  {
    id: 'm2',
    sender: 'me',
    text: 'Ça va très bien, merci ! Et toi ?',
    time: '14:03',
    read: true,
    readCount: 2,
  },

  // Message avec emojis
  {
    id: 'm3',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Super ! 🎉 Tu fais quoi en ce moment ?',
    time: '14:04',
  },

  // Reply à un message texte
  {
    id: 'm4',
    sender: 'me',
    text: 'Je bosse sur un projet React super cool ! 🚀',
    time: '14:05',
    read: true,
    readCount: 3,
    replyTo: {
      sender: 'Alice',
      senderName: 'Alice',
      text: 'Super ! 🎉 Tu fais quoi en ce moment ?',
    },
  },

  // Image unique
  {
    id: 'm5',
    sender: 'Alice',
    senderName: 'Alice',
    media: [
      { 
        type: 'image', 
        url: 'https://picsum.photos/400/300',
        caption: 'Regarde cette belle image ! 📸'
      }
    ],
    time: '14:06',
  },

  // Groupe de 2 images
  {
    id: 'm6',
    sender: 'me',
    media: [
      { type: 'image', url: 'https://picsum.photos/300/200' },
      { type: 'image', url: 'https://picsum.photos/300/200' },
    ],
    time: '14:07',
    read: true,
    readCount: 4,
  },

  // Groupe de 3 médias (image + vidéo + audio)
  {
    id: 'm7',
    sender: 'Alice',
    senderName: 'Alice',
    media: [
      { 
        type: 'image', 
        url: 'https://picsum.photos/400/300',
        caption: 'Photo principale'
      },
      { 
        type: 'video', 
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        caption: 'Vidéo courte'
      },
      { 
        type: 'audio', 
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Audio message',
        duration: 180,
        size: '2.5 MB'
      },
    ],
    time: '14:08',
  },

  // Groupe de 4 images
  {
    id: 'm8',
    sender: 'me',
    media: [
      { type: 'image', url: 'https://picsum.photos/300/300' },
      { type: 'image', url: 'https://picsum.photos/300/300' },
      { type: 'image', url: 'https://picsum.photos/300/300' },
      { type: 'image', url: 'https://picsum.photos/300/300' },
    ],
    time: '14:09',
    read: true,
    readCount: 2,
  },

  // Groupe de 5 images
  {
    id: 'm9',
    sender: 'Alice',
    senderName: 'Alice',
    media: [
      { type: 'image', url: 'https://picsum.photos/400/400' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
    ],
    time: '14:10',
  },

  // Groupe de 6 images
  {
    id: 'm10',
    sender: 'me',
    media: [
      { type: 'image', url: 'https://picsum.photos/400/400' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
    ],
    time: '14:11',
    read: true,
    readCount: 3,
  },

  // Groupe de 8 images (comme dans l'image)
  {
    id: 'm10b',
    sender: 'Wilfrid',
    senderName: 'Wilfrid',
    media: [
      { type: 'image', url: 'https://picsum.photos/400/400' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
      { type: 'image', url: 'https://picsum.photos/200/200' },
    ],
    time: '10:15 AM',
  },

  // Message avec caption après les médias
  {
    id: 'm10c',
    sender: 'Wilfrid',
    senderName: 'Wilfrid',
    text: 'hier quand je suis back j\'ai seulement dormi, j\'etais fatiguer',
    time: '10:15 AM',
  },

  // Preview link simple
  {
    id: 'm11',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Regarde ce lien intéressant !',
    link: {
      url: 'https://www.wikipedia.org/',
      title: 'Wikipedia - The Free Encyclopedia',
      description: 'Wikipedia is a free online encyclopedia, created and edited by volunteers around the world and hosted by the Wikimedia Foundation.',
      image: 'https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png',
      domain: 'wikipedia.org',
    },
    time: '14:12',
  },

  // Preview link YouTube
  {
    id: 'm12',
    sender: 'me',
    text: 'Cette vidéo est géniale ! 🎥',
    link: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      description: 'The official music video for "Never Gonna Give You Up" by Rick Astley',
      image: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      domain: 'youtube.com',
    },
    time: '14:13',
    read: true,
    readCount: 4,
  },

  // Preview link Instagram
  {
    id: 'm13',
    sender: 'Alice',
    senderName: 'Alice',
    link: {
      url: 'https://www.instagram.com/p/example/',
      title: 'Instagram Post',
      description: 'Check out this amazing post on Instagram!',
      image: 'https://picsum.photos/400/400',
      domain: 'instagram.com',
    },
    time: '14:14',
  },

  // Reply à un média
  {
    id: 'm14',
    sender: 'me',
    text: 'Haha c\'est trop cool ! 😎',
    time: '14:15',
    read: true,
    readCount: 2,
    replyTo: {
      sender: 'Alice',
      senderName: 'Alice',
      media: [
        { type: 'image', url: 'https://picsum.photos/150/150' }
      ]
    }
  },

  // Reply à un lien
  {
    id: 'm15',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Oui c\'est vraiment intéressant !',
    time: '14:16',
    replyTo: {
      sender: 'me',
      media: [
        { type: 'image', url: 'https://picsum.photos/150/150' }
      ],
      link: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up',
        domain: 'youtube.com',
      }
    }
  },

  // Message avec réactions
  {
    id: 'm16',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'J\'adore ce projet ! Il est vraiment bien fait ! 🚀',
    time: '14:17',
    reactions: ['👍', '❤️', '😂', '🎉', '🔥'],
  },

  // Message avec réactions (format objet)
  {
    id: 'm17',
    sender: 'me',
    text: 'Merci beaucoup ! Ça fait plaisir ! 😊',
    time: '14:18',
    read: true,
    readCount: 3,
    reactions: [
      { emoji: '❤️', count: 2 },
      { emoji: '👍', count: 1 },
      { emoji: '🎯', count: 1 },
    ],
  },

  // Message transféré
  {
    id: 'm18',
    sender: 'me',
    text: 'Message transféré depuis un autre chat',
    time: '14:19',
    forwarded: true,
    read: true,
    readCount: 2,
  },

  // Message important/starred
  {
    id: 'm19',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'À ne pas oublier : réunion demain à 10h ! 📅',
    time: '14:20',
    starred: true,
  },

  // Message avec document
  {
    id: 'm20',
    sender: 'me',
    text: 'Voici le document que tu as demandé',
    media: [
      {
        type: 'document',
        name: 'rapport_2024.pdf',
        size: '2.8 MB',
        url: '#'
      }
    ],
    time: '14:21',
    read: true,
    readCount: 4,
  },

  // Message avec audio uniquement
  {
    id: 'm21',
    sender: 'Alice',
    senderName: 'Alice',
    media: [
      {
        type: 'audio',
        title: 'Message vocal',
        duration: 45,
        size: '1.2 MB',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      }
    ],
    time: '14:22',
  },

  // Message avec vidéo et caption
  {
    id: 'm22',
    sender: 'me',
    media: [
      {
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        caption: 'Regarde cette vidéo ! 🎬'
      }
    ],
    time: '14:23',
    read: true,
    readCount: 2,
  },

  // Message long avec beaucoup de texte
  {
    id: 'm23',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    time: '14:24',
  },

  // Message avec emojis et texte long
  {
    id: 'm24',
    sender: 'me',
    text: '🎉🎊🎈 Félicitations ! 🎈🎊🎉\n\nTu as vraiment fait du bon travail sur ce projet. Je suis impressionné par la qualité et l\'attention aux détails. Continue comme ça ! 🚀✨',
    time: '14:25',
    read: true,
    readCount: 3,
  },

  // Message de statut (typiquement pour les groupes)
  {
    id: 'm25',
    sender: 'system',
    text: '7/30/2025',
    time: '14:26',
    isSystemMessage: true,
  },
];

export default mocMessages;
