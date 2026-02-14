import { StreamEvent, PartnershipArm } from './types';

export const APP_NAME = "Christ Embassy Angola";
export const PRIMARY_COLOR = "blue-900"; // Deep Royal Blue
export const LOGO_URL = "https://loveworldsat.org/wp-content/uploads/2022/05/LoveWorldSAT-Logo-2022.png"; 

export const MOCK_STREAMS: StreamEvent[] = [
  {
    id: '1',
    title: 'Sunday Service Live',
    description: 'Join us for a time of worship and the word with Pastor Chris.',
    date: 'Live Now',
    thumbnailUrl: 'https://picsum.photos/800/450?grayscale',
    isLive: true,
    viewers: 0,
    type: 'public',
    streamSource: 'custom', 
    streamUrl: '' 
  },
  {
    id: '2',
    title: 'Mid-Week Bible Study',
    description: 'Deep dive into the scriptures.',
    date: 'Wednesday, 6:00 PM',
    thumbnailUrl: 'https://picsum.photos/800/450?blur=2',
    isLive: false,
    viewers: 0,
    type: 'public',
    streamSource: 'youtube',
    streamUrl: ''
  },
  {
    id: '3',
    title: 'Leaders Conference (Private)',
    description: 'Exclusive session for church leaders and pastors.',
    date: 'Saturday, 2:00 PM',
    thumbnailUrl: 'https://picsum.photos/800/450',
    isLive: false,
    viewers: 0,
    type: 'private',
    streamSource: 'custom',
    streamUrl: ''
  }
];

export const PARTNERSHIP_ARMS: PartnershipArm[] = [
  {
    id: 'rhapsody',
    name: 'Rhapsody of Realities',
    description: 'Join us in distributing the Messenger Angel to every nook and cranny of the world in every known language.',
    imageUrl: 'https://picsum.photos/id/20/600/400'
  },
  {
    id: 'healing',
    name: 'The Healing School',
    description: 'Taking divine healing to the nations. Partner with us to sponsor healing sessions and broadcasts.',
    imageUrl: 'https://picsum.photos/id/60/600/400'
  },
  {
    id: 'innercity',
    name: 'InnerCity Mission',
    description: 'Taking action to end child poverty. Every child is your child.',
    imageUrl: 'https://picsum.photos/id/90/600/400'
  },
  {
    id: 'lwsat',
    name: 'LoveWorld SAT',
    description: 'Broadcasting the gospel of our Lord Jesus Christ to the world via satellite television.',
    imageUrl: 'https://picsum.photos/id/180/600/400'
  }
];