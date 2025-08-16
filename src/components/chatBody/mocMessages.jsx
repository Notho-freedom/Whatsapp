const mocMessages = [
  // Texte simple
  {
    id: 'm1',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Salut, comment ça va ?',
    time: '14:02',
  },
  {
    id: 'm2',
    sender: 'me',
    text: 'Ça va bien, merci ! Et toi ?',
    time: '14:03',
    read: true,
  },

  // Reply texte
  {
    id: 'm3',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Super ! Tu fais quoi en ce moment ?',
    time: '14:04',
  },
  {
    id: 'm4',
    sender: 'me',
    text: 'Je bosse sur un projet React 😏',
    time: '14:05',
    read: true,
    replyTo: {
      sender: 'Alice',
      senderName: 'Alice',
      text: 'Super ! Tu fais quoi en ce moment ?',
    },
  },

  // Media unique (image)
  {
    id: 'm5',
    sender: 'Alice',
    senderName: 'Alice',
    media: [
      { type: 'image', url: 'https://picsum.photos/200/300' }
    ],
    time: '14:06',
  },

  // Media groupé (image + vidéo + audio)
  {
    id: 'm6',
    sender: 'me',
    media: [
      { type: 'image', url: 'https://picsum.photos/300/200' },
      { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    ],
    time: '14:07',
    read: true,
  },

  // Preview link
  {
    id: 'm7',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Regarde ce lien !',
    link: {
      url: 'https://www.wikipedia.org/',
      title: 'Wikipedia',
      description: 'The Free Encyclopedia',
      image: 'https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png',
      domain: 'wikipedia.org',
    },
    time: '14:08',
  },

  // Reply media
  {
    id: 'm8',
    sender: 'me',
    text: 'Haha super 😎',
    time: '14:09',
    read: true,
    replyTo: {
      sender: 'Alice',
      senderName: 'Alice',
      media: [
        { type: 'image', url: 'https://picsum.photos/150/150' }
      ]
    }
  },

  // Réactions
  {
    id: 'm9',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'J’adore ce projet !',
    time: '14:10',
    reactions: ['👍', '❤️', '😂'],
  },

  // Forwarded
  {
    id: 'm10',
    sender: 'me',
    text: 'Message transféré',
    time: '14:11',
    forwarded: true,
    read: true,
  },

  // Starred / important
  {
    id: 'm11',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'À ne pas oublier 🔥',
    time: '14:12',
    starred: true,
  },
];

export default mocMessages;
