export type ItemStatus = 'Active' | 'Match Found' | 'Claimed' | 'Resolved';
export type ItemType = 'Lost' | 'Found';
export type ItemCategory = 'Electronics' | 'Bags' | 'Keys' | 'ID Cards' | 'Clothing' | 'Books' | 'Others';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: ItemCategory;
  description: string;
  location: string;
  date: string;
  status: ItemStatus;
  reporterName: string;
  reporterEmail: string;
  currentLocation?: string; // For found items
  imageUrl?: string;
}

export type ActivityType = 'lost' | 'found' | 'match' | 'recovery' | 'new_report';

export interface Activity {
  id: string;
  text: string;
  timestamp: string;
  type: ActivityType;
}

export const mockItems: Item[] = [
  {
    id: '1',
    type: 'Lost',
    title: 'MacBook Pro 14"',
    category: 'Electronics',
    description: 'Silver MacBook Pro with a black protective case. Has a few stickers on the back.',
    location: 'Library 2nd Floor',
    date: '2023-10-24T10:00:00Z',
    status: 'Active',
    reporterName: 'Rahul Sharma',
    reporterEmail: 'rahul@example.com',
    imageUrl: 'https://picsum.photos/seed/macbook/400/300'
  },
  {
    id: '2',
    type: 'Found',
    title: 'Blue Nike Backpack',
    category: 'Bags',
    description: 'Found a blue Nike backpack near the cafeteria. Contains some notebooks and a water bottle.',
    location: 'Cafeteria',
    date: '2023-10-25T14:30:00Z',
    status: 'Match Found',
    reporterName: 'Priya Patel',
    reporterEmail: 'priya@example.com',
    currentLocation: 'Student Union Desk',
    imageUrl: 'https://picsum.photos/seed/backpack/400/300'
  },
  {
    id: '3',
    type: 'Lost',
    title: 'Student ID Card',
    category: 'ID Cards',
    description: 'Lost my student ID card. Name on card is John Doe.',
    location: 'Science Building',
    date: '2023-10-26T09:15:00Z',
    status: 'Resolved',
    reporterName: 'John Doe',
    reporterEmail: 'john@example.com',
    imageUrl: 'https://picsum.photos/seed/idcard/400/300'
  },
  {
    id: '4',
    type: 'Found',
    title: 'Car Keys (Honda)',
    category: 'Keys',
    description: 'Found a set of Honda car keys with a red keychain.',
    location: 'Parking Lot B',
    date: '2023-10-26T16:45:00Z',
    status: 'Active',
    reporterName: 'Amit Kumar',
    reporterEmail: 'amit@example.com',
    currentLocation: 'Campus Security Office',
    imageUrl: 'https://picsum.photos/seed/keys/400/300'
  },
  {
    id: '5',
    type: 'Lost',
    title: 'Calculus Textbook',
    category: 'Books',
    description: 'Lost my Calculus Early Transcendentals 8th Edition textbook.',
    location: 'Math Department',
    date: '2023-10-27T11:20:00Z',
    status: 'Active',
    reporterName: 'Sarah Smith',
    reporterEmail: 'sarah@example.com',
    imageUrl: 'https://picsum.photos/seed/book/400/300'
  },
  {
    id: '6',
    type: 'Found',
    title: 'Black Winter Jacket',
    category: 'Clothing',
    description: 'Found a black North Face winter jacket left on a chair.',
    location: 'Lecture Hall 101',
    date: '2023-10-27T18:00:00Z',
    status: 'Claimed',
    reporterName: 'David Lee',
    reporterEmail: 'david@example.com',
    currentLocation: 'Lost and Found Office',
    imageUrl: 'https://picsum.photos/seed/jacket/400/300'
  }
];

export const mockActivities: Activity[] = [
  { id: '1', text: 'Rahul reported a lost MacBook Pro', timestamp: '2 mins ago', type: 'lost' },
  { id: '2', text: 'Match found for Blue Nike Backpack', timestamp: '15 mins ago', type: 'match' },
  { id: '3', text: 'Item recovered: Student ID Card', timestamp: '1 hour ago', type: 'recovery' },
  { id: '4', text: 'Amit found Car Keys in Parking Lot B', timestamp: '3 hours ago', type: 'found' },
  { id: '5', text: 'Sarah reported a lost Calculus Textbook', timestamp: '5 hours ago', type: 'lost' },
];
