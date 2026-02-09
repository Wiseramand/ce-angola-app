
import { PartnershipBranch } from './types';

export const PARTNERSHIP_BRANCHES: PartnershipBranch[] = [
  {
    id: 'rhapsody',
    name: 'Rhapsody of Realities',
    description: 'The world\'s most translated book, reaching billions in over 7,000 languages.',
    impact: 'Reaching every nation and city with the gospel through messenger angel.',
    imageUrl: 'https://picsum.photos/seed/rhapsody/800/600'
  },
  {
    id: 'hschool',
    name: 'Healing School',
    description: 'Bringing the healing power of God to the nations through healing crusades.',
    impact: 'Millions healed from diverse ailments and sicknesses across the globe.',
    imageUrl: 'https://picsum.photos/seed/healing/800/600'
  },
  {
    id: 'loveworld-tv',
    name: 'LoveWorld TV',
    description: 'Broadcasting the message of hope and life to homes worldwide 24/7.',
    impact: 'Global satellite and digital reach, impacting lives across all continents.',
    imageUrl: 'https://picsum.photos/seed/tv/800/600'
  },
  {
    id: 'innercity',
    name: 'InnerCity Mission',
    description: 'Committed to breaking the cycle of poverty and reaching indigent children.',
    impact: 'Feeding programs, education, and shelter for vulnerable children everywhere.',
    imageUrl: 'https://picsum.photos/seed/children/800/600'
  }
];

export const PAYMENT_METHODS = {
  angolan: [
    { id: 'paypay', name: 'PayPay Africa', icon: '📱' },
    { id: 'express', name: 'Express', icon: '🚀' },
    { id: 'unitel', name: 'Unitel Money', icon: '📶' },
    { id: 'afrimoney', name: 'Afrimoney', icon: '💰' },
    { id: 'bank', name: 'Bank Transfer (BFA, BAI, BIC)', icon: '🏦' }
  ],
  international: [
    { id: 'visa', name: 'Visa', icon: '💳' },
    { id: 'mastercard', name: 'MasterCard', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' }
  ]
};
