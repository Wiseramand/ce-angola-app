import { PartnershipBranch, StreamEvent } from './types';

export const MOCK_STREAMS: StreamEvent[] = [
  {
    id: '1',
    title: 'Sunday Service Live',
    description: 'Join us for a time of worship and the word with Pastor Chris.',
    date: 'Live Now',
    thumbnailUrl: 'assets/pastor-chris.jpg',
    isLive: true,
    viewers: 0,
    type: 'public',
    streamSource: 'custom',
    streamUrl: ''
  }
];

// Altere os valores de 'imageUrl' abaixo para os nomes dos arquivos 
// que você colocou dentro da pasta public/assets/
export const PARTNERSHIP_BRANCHES: PartnershipBranch[] = [
  {
    id: 'rhapsody',
    name: 'Rhapsody of Realities',
    description: 'O livro mais traduzido do mundo, alcançando bilhões em mais de 7.000 idiomas.',
    impact: 'Alcançando cada nação e cidade com o evangelho através do anjo mensageiro.',
    imageUrl: 'assets/rhapsody.png' // <-- Altere este nome se o arquivo for diferente
  },
  {
    id: 'hschool',
    name: 'Healing School',
    description: 'Levando o poder de cura de Deus às nações através de cruzadas de cura.',
    impact: 'Milhões curados de diversas doenças e enfermidades em todo o mundo.',
    imageUrl: 'assets/healing-school.png' // <-- Altere este nome se o arquivo for diferente
  },
  {
    id: 'loveworld-tv',
    name: 'LoveWorld TV',
    description: 'Transmitindo a mensagem de esperança e vida para lares em todo o mundo 24 horas por dia.',
    impact: 'Alcance global via satélite e digital, impactando vidas em todos os continentes.',
    imageUrl: 'assets/loveworld-tv.png' // <-- Altere este nome se o arquivo for diferente
  },
  {
    id: 'innercity',
    name: 'InnerCity Mission',
    description: 'Comprometidos em quebrar o ciclo da pobreza e alcançar crianças carentes.',
    impact: 'Programas de alimentação, educação e abrigo para crianças vulneráveis.',
    imageUrl: 'assets/inner-city.png' // <-- Altere este nome se o arquivo for diferente
  }
];

export const PAYMENT_METHODS = {
  angolan: [
    { id: 'paypay', name: 'PayPay Africa', icon: '📱' },
    { id: 'express', name: 'Express', icon: '🚀' },
    { id: 'unitel', name: 'Unitel Money', icon: '📶' },
    { id: 'afrimoney', name: 'Afrimoney', icon: '💰' },
    { id: 'bank', name: 'Transferência Bancária', icon: '🏦' }
  ],
  international: [
    { id: 'visa', name: 'Visa', icon: '💳' },
    { id: 'mastercard', name: 'MasterCard', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' }
  ]
};
