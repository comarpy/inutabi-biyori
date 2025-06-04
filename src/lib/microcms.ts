import { createClient } from 'microcms-js-sdk';

// 宿泊施設の型定義
export interface Lodging {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  rating: number;
  petFriendlyFeatures: string[];
  createdAt: string;
  updatedAt: string;
}

// イベントの型定義
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  eventType: string;
  image: string;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
}

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

// 宿泊施設を取得する関数
export const getLodgings = async () => {
  const data = await client.get({ 
    endpoint: 'lodgings', 
    queries: { limit: 100 } 
  });
  return data.contents as Lodging[];
};

// イベントを取得する関数
export const getEvents = async () => {
  const data = await client.get({ 
    endpoint: 'events', 
    queries: { limit: 100 } 
  });
  return data.contents as Event[];
};

// 宿泊施設を検索する関数
export const searchLodgings = async (location?: string, startDate?: string, endDate?: string) => {
  const queries: any = { limit: 100 };
  
  if (location) {
    queries.filters = `location[contains]${location}`;
  }
  
  const data = await client.get({ 
    endpoint: 'lodgings', 
    queries 
  });
  return data.contents as Lodging[];
};

// イベントを検索する関数
export const searchEvents = async (location?: string, eventType?: string, startDate?: string) => {
  const queries: any = { limit: 100 };
  
  const filters = [];
  if (location) {
    filters.push(`location[contains]${location}`);
  }
  if (eventType) {
    filters.push(`eventType[equals]${eventType}`);
  }
  if (startDate) {
    filters.push(`startDate[greater_than]${startDate}`);
  }
  
  if (filters.length > 0) {
    queries.filters = filters.join('[and]');
  }
  
  const data = await client.get({ 
    endpoint: 'events', 
    queries 
  });
  return data.contents as Event[];
};
