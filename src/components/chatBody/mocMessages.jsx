const mocMessages = [
  // Message système de chiffrement
  {
    id: 'sys1',
    type: 'system',
    systemType: 'encryption',
    text: 'Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.',
    date: 'YESTERDAY',
  },

  // Texte simple
  {
    id: 'm1',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Hey! How are you doing? 😊',
    time: '2:02 PM',
    date: 'YESTERDAY',
  },
  {
    id: 'm2',
    sender: 'me',
    text: "I'm good, thanks! Just working on some React projects. How about you?",
    time: '2:03 PM',
    read: true,
    date: 'YESTERDAY',
  },

  // Message système d'appel manqué
  {
    id: 'sys2',
    type: 'system',
    systemType: 'call',
    text: 'Missed voice call at 2:15 PM',
    date: 'YESTERDAY',
  },

  // Reply texte
  {
    id: 'm3',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Nice! What kind of project are you building?',
    time: '2:04 PM',
    date: 'YESTERDAY',
  },
  {
    id: 'm4',
    sender: 'me',
    text: "It's a WhatsApp clone with React and Tailwind CSS! Pretty exciting stuff 🚀",
    time: '2:05 PM',
    read: true,
    replyTo: {
      sender: 'Alice',
      senderName: 'Alice',
      text: 'Nice! What kind of project are you building?',
    },
    date: 'YESTERDAY',
  },

  // Media unique (image)
  {
    id: 'm5',
    sender: 'Alice',
    senderName: 'Alice',
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/whatsapp1/400/300' }
    ],
    text: 'Check out this cool design I found!',
    time: '2:06 PM',
    date: 'YESTERDAY',
  },

  // Multiple messages from same sender
  {
    id: 'm6',
    sender: 'me',
    text: 'Wow, that looks amazing!',
    time: '2:07 PM',
    read: true,
    date: 'YESTERDAY',
  },
  {
    id: 'm7',
    sender: 'me',
    text: 'I might use something similar for my project',
    time: '2:07 PM',
    read: true,
    date: 'YESTERDAY',
  },

  // Date divider - TODAY
  {
    id: 'm8',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Good morning! How did the project go?',
    time: '9:30 AM',
    date: 'TODAY',
  },

  // Media groupé (multiple images)
  {
    id: 'm9',
    sender: 'me',
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/whatsapp2/300/200' },
      { type: 'image', url: 'https://picsum.photos/seed/whatsapp3/300/200' },
      { type: 'image', url: 'https://picsum.photos/seed/whatsapp4/300/200' },
    ],
    text: 'Here are some screenshots of the progress!',
    time: '9:35 AM',
    read: true,
    date: 'TODAY',
  },

  // Video message
  {
    id: 'm10',
    sender: 'Alice',
    senderName: 'Alice',
    media: [
      { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
    ],
    time: '9:40 AM',
    date: 'TODAY',
  },

  // Audio message
  {
    id: 'm11',
    sender: 'me',
    media: [
      { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: '0:15' }
    ],
    time: '9:42 AM',
    read: false,
    date: 'TODAY',
  },

  // Preview link
  {
    id: 'm12',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'You should check out this article about React best practices:',
    link: {
      url: 'https://react.dev/',
      title: 'React – The library for web and native user interfaces',
      description: 'React is the library for web and native user interfaces. Build user interfaces out of individual pieces called components written in JavaScript.',
      image: 'https://react.dev/images/og-home.png',
      domain: 'react.dev',
    },
    time: '10:15 AM',
    date: 'TODAY',
  },

  // Reply to media
  {
    id: 'm13',
    sender: 'me',
    text: 'Thanks for sharing! This is really helpful 🙏',
    time: '10:20 AM',
    read: false,
    replyTo: {
      sender: 'Alice',
      senderName: 'Alice',
      media: [
        { type: 'image', url: 'https://picsum.photos/seed/reply/150/150' }
      ]
    },
    date: 'TODAY',
  },

  // Reactions
  {
    id: 'm14',
    sender: 'Alice',
    senderName: 'Alice',
    text: "I'm glad you found it useful! Keep up the great work! 💪",
    time: '10:25 AM',
    reactions: ['👍', '❤️', '🔥'],
    date: 'TODAY',
  },

  // Forwarded message
  {
    id: 'm15',
    sender: 'me',
    text: 'BTW, I forwarded your design tips to my team',
    time: '10:30 AM',
    forwarded: true,
    read: false,
    date: 'TODAY',
  },

  // Starred / important
  {
    id: 'm16',
    sender: 'Alice',
    senderName: 'Alice',
    text: 'Remember: Meeting tomorrow at 3 PM! 📅',
    time: '10:35 AM',
    starred: true,
    date: 'TODAY',
  },

  // Long message to test wrapping
  {
    id: 'm17',
    sender: 'me',
    text: `Perfect! I'll be there. 

By the way, I've been thinking about implementing some new features like:
• Voice messages with waveform visualization
• Better image compression
• Improved message search
• Dark mode improvements

What do you think?`,
    time: '10:40 AM',
    read: false,
    date: 'TODAY',
  },
];

export default mocMessages;
