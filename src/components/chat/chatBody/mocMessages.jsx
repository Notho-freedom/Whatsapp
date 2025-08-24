const mocMessages = [
  // Date divider
  {
    id: 'date1',
    type: 'system',
    systemType: 'date',
    text: '8/11/2025',
    date: '8/11/2025',
  },

  // Messages du premier jour
  {
    id: 'm1',
    sender: 'other',
    senderName: 'Contact',
    text: 'Merci bb Bonne nuit',
    time: '12:42 AM',
    date: '8/11/2025',
  },
  {
    id: 'm2',
    sender: 'other',
    senderName: 'Contact',
    text: 'Bisous 😘',
    time: '12:42 AM',
    date: '8/11/2025',
  },
  {
    id: 'm3',
    sender: 'me',
    text: "Je t'aime fort.",
    time: '12:41 AM',
    read: true,
    date: '8/11/2025',
  },
  {
    id: 'm4',
    sender: 'me',
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/heart/400/400' }
    ],
    time: '12:42 AM',
    read: true,
    date: '8/11/2025',
  },

  // Appel manqué
  {
    id: 'call1',
    type: 'system',
    systemType: 'call',
    callStatus: 'missed',
    text: 'Missed voice call',
    subtitle: 'Click to call back',
    time: '11:04 AM',
    date: '8/11/2025',
  },

  // Appel accepté
  {
    id: 'call2',
    type: 'system',
    systemType: 'call',
    callStatus: 'incoming',
    text: 'Voice call',
    subtitle: 'Accepted on another device',
    time: '11:05 AM',
    date: '8/11/2025',
  },

  // Messages avec réactions
  {
    id: 'm5',
    sender: 'other',
    senderName: 'Contact',
    text: 'Comment vas-tu ?',
    time: '10:32 AM',
    reactions: ['👍', '❤️', '😊', '😮', '😢', '🙏'],
    date: '8/11/2025',
  },

  // Réponse
  {
    id: 'm6',
    sender: 'me',
    text: 'Je suis à la maison',
    time: '7:09 PM',
    read: true,
    date: '8/11/2025',
  },
  {
    id: 'm7',
    sender: 'other',
    senderName: 'Contact',
    text: 'Bonsoir bb',
    time: '1:26 PM',
    date: '8/11/2025',
  },

  // Nouveau jour
  {
    id: 'date2',
    type: 'system',
    systemType: 'date',
    text: '7/30/2025',
    date: '7/30/2025',
  },

  // Message audio avec réponse
  {
    id: 'm8',
    sender: 'other',
    senderName: 'Wilfrid',
    media: [
      { 
        type: 'audio', 
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
        duration: '0:56',
        timestamp: '9:19 PM',
        waveform: Array.from({ length: 35 }, () => Math.random() * 0.7 + 0.3),
        size: '245 KB',
        quality: '128 kbps'
      }
    ],
    time: '9:19 PM',
    date: '7/30/2025',
  },
  {
    id: 'm9',
    sender: 'other',
    senderName: 'Wilfrid',
    text: 'Yo',
    time: '9:19 PM',
    date: '7/30/2025',
  },
  {
    id: 'm10',
    sender: 'other',
    senderName: 'Wilfrid',
    text: 'Je suis entrain de back ,',
    time: '9:19 PM',
    date: '7/30/2025',
  },
  {
    id: 'm11',
    sender: 'other',
    senderName: 'Wilfrid',
    text: 'Je te fais signe au piol',
    time: '9:19 PM',
    date: '7/30/2025',
  },

  // Réponse avec reply
  {
    id: 'm12',
    sender: 'me',
    text: "D'accord",
    time: '9:20 PM',
    read: true,
    replyTo: {
      sender: 'Wilfrid',
      senderName: 'Wilfrid',
      text: 'Je te fais signe au piol'
    },
    date: '7/30/2025',
  },

  // Messages avec images multiples
  {
    id: 'm13',
    sender: 'other',
    senderName: 'Wilfrid',
    text: 'salut les gars',
    time: '10:12 AM',
    date: '7/30/2025',
  },
  {
    id: 'm14',
    sender: 'other',
    senderName: 'Wilfrid',
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/screen1/300/200' },
      { type: 'image', url: 'https://picsum.photos/seed/screen2/300/200' },
      { type: 'image', url: 'https://picsum.photos/seed/screen3/300/200' },
      { type: 'image', url: 'https://picsum.photos/seed/screen4/300/200' },
      { type: 'image', url: 'https://picsum.photos/seed/screen5/300/200' },
      { type: 'image', url: 'https://picsum.photos/seed/screen6/300/200' },
    ],
    time: '10:15 AM',
    date: '7/30/2025',
  },
  {
    id: 'm15',
    sender: 'other',
    senderName: 'Wilfrid',
    text: "hier quand je suis back j'ai seulement dormi, j'etais fatiguer",
    time: '10:15 AM',
    date: '7/30/2025',
  },

  // Messages récents
  {
    id: 'm16',
    sender: 'me',
    text: "Yo",
    time: '9:17 PM',
    read: false,
    date: 'TODAY',
  },
  {
    id: 'm17',
    sender: 'me',
    text: "Quelqu'un est disponible ?",
    time: '9:17 PM',
    read: false,
    date: 'TODAY',
  },
  {
    id: 'm18',
    sender: 'other',
    senderName: 'Wilfrid',
    media: [
      { 
        type: 'audio', 
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 
        duration: '1:23',
        timestamp: '9:18 PM',
        waveform: Array.from({ length: 35 }, () => Math.random() * 0.7 + 0.3),
        size: '312 KB',
        quality: '128 kbps'
      }
    ],
    time: '9:18 PM',
    date: 'TODAY',
  },
  {
    id: 'm19',
    sender: 'me',
    media: [
      { 
        type: 'audio', 
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 
        duration: '0:45',
        timestamp: '9:19 PM',
        waveform: Array.from({ length: 35 }, () => Math.random() * 0.7 + 0.3),
        size: '198 KB',
        quality: '128 kbps'
      }
    ],
    time: '9:19 PM',
    read: true,
    date: 'TODAY',
  },
];

export default mocMessages;
