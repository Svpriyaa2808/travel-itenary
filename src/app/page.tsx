'use client';

import { useState } from 'react';

interface TravelDetails {
  from: string;
  destination: string;
  days: number;
  budget: number;
  currency: string;
}

interface Itinerary {
  flight: {
    from: string;
    to: string;
    estimatedCost: number;
    departure: string;
    arrival: string;
  };
  hotel: {
    name: string;
    checkIn: string;
    checkOut: string;
    nightlyRate: number;
    totalCost: number;
    rating: number;
  };
  places: {
    day: number;
    activities: {
      time: string;
      place: string;
      description: string;
      estimatedCost: number;
      location: string; // For Google Maps
    }[];
  }[];
  summary: {
    totalCost: number;
    remainingBudget: number;
  };
}

// Currency exchange rates (base: USD)
const currencyRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
  SEK: 10.33,
  JPY: 149.50,
  AUD: 1.52,
  CAD: 1.36,
};

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  SEK: 'kr',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

// Popular cities for autocomplete - only cities with complete data
const availableCities = [
  'New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco',
  'London', 'Paris', 'Rome', 'Barcelona', 'Amsterdam',
  'Tokyo', 'Dubai', 'Istanbul', 'Bangkok', 'Singapore',
  'Sydney', 'Mumbai', 'Delhi', 'Berlin', 'Madrid',
  'Prague', 'Vienna', 'Stockholm',
];

// Real hotels for each destination
const destinationHotels: Record<string, Array<{name: string, rating: number}>> = {
  'Paris': [
    { name: 'Hôtel Plaza Athénée', rating: 5 },
    { name: 'Le Meurice', rating: 5 },
    { name: 'Shangri-La Hotel Paris', rating: 5 },
    { name: 'Hotel Lutetia', rating: 5 },
  ],
  'London': [
    { name: 'The Savoy', rating: 5 },
    { name: 'Claridge\'s', rating: 5 },
    { name: 'The Ritz London', rating: 5 },
    { name: 'Rosewood London', rating: 5 },
  ],
  'Tokyo': [
    { name: 'The Peninsula Tokyo', rating: 5 },
    { name: 'Aman Tokyo', rating: 5 },
    { name: 'The Ritz-Carlton Tokyo', rating: 5 },
    { name: 'Park Hyatt Tokyo', rating: 5 },
  ],
  'New York': [
    { name: 'The Plaza Hotel', rating: 5 },
    { name: 'The St. Regis New York', rating: 5 },
    { name: 'The Pierre', rating: 5 },
    { name: 'Mandarin Oriental New York', rating: 5 },
  ],
  'Rome': [
    { name: 'Hotel Hassler Roma', rating: 5 },
    { name: 'Hotel de Russie', rating: 5 },
    { name: 'The St. Regis Rome', rating: 5 },
    { name: 'Palazzo Manfredi', rating: 5 },
  ],
  'Dubai': [
    { name: 'Burj Al Arab Jumeirah', rating: 5 },
    { name: 'Atlantis The Palm', rating: 5 },
    { name: 'Armani Hotel Dubai', rating: 5 },
    { name: 'Jumeirah Al Qasr', rating: 5 },
  ],
  'Barcelona': [
    { name: 'Hotel Arts Barcelona', rating: 5 },
    { name: 'Mandarin Oriental Barcelona', rating: 5 },
    { name: 'W Barcelona', rating: 5 },
    { name: 'Cotton House Hotel', rating: 5 },
  ],
  'Amsterdam': [
    { name: 'Waldorf Astoria Amsterdam', rating: 5 },
    { name: 'The Hoxton Amsterdam', rating: 4 },
    { name: 'Pulitzer Amsterdam', rating: 5 },
    { name: 'Hotel de l\'Europe', rating: 5 },
  ],
  'Singapore': [
    { name: 'Marina Bay Sands', rating: 5 },
    { name: 'Raffles Hotel Singapore', rating: 5 },
    { name: 'The Fullerton Hotel', rating: 5 },
    { name: 'Capella Singapore', rating: 5 },
  ],
  'Bangkok': [
    { name: 'Mandarin Oriental Bangkok', rating: 5 },
    { name: 'The Peninsula Bangkok', rating: 5 },
    { name: 'Anantara Siam Bangkok', rating: 5 },
    { name: 'Shangri-La Bangkok', rating: 5 },
  ],
  'Sydney': [
    { name: 'Park Hyatt Sydney', rating: 5 },
    { name: 'Four Seasons Hotel Sydney', rating: 5 },
    { name: 'Shangri-La Hotel Sydney', rating: 5 },
    { name: 'The Langham Sydney', rating: 5 },
  ],
  'Istanbul': [
    { name: 'Çırağan Palace Kempinski', rating: 5 },
    { name: 'Four Seasons Sultanahmet', rating: 5 },
    { name: 'The Ritz-Carlton Istanbul', rating: 5 },
    { name: 'Swissotel The Bosphorus', rating: 5 },
  ],
  'Mumbai': [
    { name: 'The Taj Mahal Palace', rating: 5 },
    { name: 'The Oberoi Mumbai', rating: 5 },
    { name: 'Four Seasons Mumbai', rating: 5 },
    { name: 'Trident Nariman Point', rating: 5 },
  ],
  'Delhi': [
    { name: 'The Oberoi New Delhi', rating: 5 },
    { name: 'The Leela Palace New Delhi', rating: 5 },
    { name: 'Taj Palace New Delhi', rating: 5 },
    { name: 'ITC Maurya', rating: 5 },
  ],
  'Los Angeles': [
    { name: 'The Beverly Hills Hotel', rating: 5 },
    { name: 'Hotel Bel-Air', rating: 5 },
    { name: 'Four Seasons Los Angeles', rating: 5 },
    { name: 'Waldorf Astoria Beverly Hills', rating: 5 },
  ],
  'Chicago': [
    { name: 'The Peninsula Chicago', rating: 5 },
    { name: 'Four Seasons Chicago', rating: 5 },
    { name: 'The Langham Chicago', rating: 5 },
    { name: 'Trump International Hotel', rating: 5 },
  ],
  'San Francisco': [
    { name: 'The Ritz-Carlton San Francisco', rating: 5 },
    { name: 'Fairmont San Francisco', rating: 5 },
    { name: 'Four Seasons San Francisco', rating: 5 },
    { name: 'St. Regis San Francisco', rating: 5 },
  ],
  'Miami': [
    { name: 'Faena Hotel Miami Beach', rating: 5 },
    { name: 'The Setai Miami Beach', rating: 5 },
    { name: 'Four Seasons Hotel Miami', rating: 5 },
    { name: 'Mandarin Oriental Miami', rating: 5 },
  ],
  'Berlin': [
    { name: 'Hotel Adlon Kempinski', rating: 5 },
    { name: 'The Ritz-Carlton Berlin', rating: 5 },
    { name: 'Hotel de Rome', rating: 5 },
    { name: 'Waldorf Astoria Berlin', rating: 5 },
  ],
  'Madrid': [
    { name: 'Hotel Ritz Madrid', rating: 5 },
    { name: 'Four Seasons Hotel Madrid', rating: 5 },
    { name: 'Villa Magna Madrid', rating: 5 },
    { name: 'The Westin Palace Madrid', rating: 5 },
  ],
  'Prague': [
    { name: 'Four Seasons Hotel Prague', rating: 5 },
    { name: 'Mandarin Oriental Prague', rating: 5 },
    { name: 'Augustine Hotel', rating: 5 },
    { name: 'Aria Hotel Prague', rating: 5 },
  ],
  'Vienna': [
    { name: 'Hotel Sacher Wien', rating: 5 },
    { name: 'Park Hyatt Vienna', rating: 5 },
    { name: 'Hotel Imperial Vienna', rating: 5 },
    { name: 'The Ritz-Carlton Vienna', rating: 5 },
  ],
  'Stockholm': [
    { name: 'Grand Hôtel Stockholm', rating: 5 },
    { name: 'Nobis Hotel Stockholm', rating: 5 },
    { name: 'Hotel Diplomat Stockholm', rating: 5 },
    { name: 'Bank Hotel Stockholm', rating: 5 },
  ],
};

// Flight duration data (in hours)
const flightDurations: Record<string, Record<string, number>> = {
  'New York': { 'Paris': 7.5, 'London': 7, 'Rome': 8.5, 'Dubai': 12.5, 'Tokyo': 14, 'Singapore': 18, 'Sydney': 22, 'Mumbai': 15, 'Delhi': 15, 'Los Angeles': 6, 'Chicago': 2, 'San Francisco': 6, 'Miami': 3, 'Barcelona': 8, 'Amsterdam': 7.5, 'Bangkok': 17, 'Istanbul': 10, 'Berlin': 8, 'Madrid': 8, 'Prague': 8.5, 'Vienna': 9, 'Stockholm': 8.5 },
  'Los Angeles': { 'Paris': 11, 'London': 10.5, 'Rome': 12, 'Dubai': 16, 'Tokyo': 11.5, 'Singapore': 17, 'Sydney': 15, 'Mumbai': 17, 'Delhi': 16, 'New York': 5.5, 'Chicago': 4, 'San Francisco': 1.5, 'Miami': 5, 'Barcelona': 11.5, 'Amsterdam': 10.5, 'Bangkok': 17, 'Istanbul': 13, 'Berlin': 11, 'Madrid': 11.5, 'Prague': 11.5, 'Vienna': 12, 'Stockholm': 11 },
  'Chicago': { 'Paris': 8.5, 'London': 7.5, 'Rome': 9.5, 'Dubai': 13, 'Tokyo': 13, 'Singapore': 19, 'Sydney': 19, 'Mumbai': 16, 'Delhi': 16, 'New York': 2.5, 'Los Angeles': 4.5, 'San Francisco': 4.5, 'Miami': 3, 'Barcelona': 9, 'Amsterdam': 8, 'Bangkok': 18, 'Istanbul': 11, 'Berlin': 9, 'Madrid': 9, 'Prague': 9, 'Vienna': 9.5, 'Stockholm': 9 },
  'Miami': { 'Paris': 9, 'London': 8.5, 'Rome': 9.5, 'Dubai': 13.5, 'Tokyo': 17, 'Singapore': 20, 'Sydney': 22, 'Mumbai': 16, 'Delhi': 16, 'New York': 3, 'Los Angeles': 5.5, 'Chicago': 3, 'San Francisco': 6, 'Barcelona': 9, 'Amsterdam': 9, 'Bangkok': 19, 'Istanbul': 11, 'Berlin': 9.5, 'Madrid': 9, 'Prague': 10, 'Vienna': 10, 'Stockholm': 10 },
  'San Francisco': { 'Paris': 11, 'London': 10.5, 'Rome': 12, 'Dubai': 16, 'Tokyo': 10.5, 'Singapore': 16.5, 'Sydney': 14.5, 'Mumbai': 16.5, 'Delhi': 15.5, 'New York': 5.5, 'Los Angeles': 1.5, 'Chicago': 4.5, 'Miami': 6, 'Barcelona': 11.5, 'Amsterdam': 10.5, 'Bangkok': 16, 'Istanbul': 13, 'Berlin': 11, 'Madrid': 11.5, 'Prague': 11.5, 'Vienna': 12, 'Stockholm': 10.5 },
  'London': { 'Paris': 1.5, 'Rome': 2.5, 'Dubai': 7, 'Tokyo': 12, 'Singapore': 13, 'Sydney': 22, 'Mumbai': 9, 'Delhi': 8.5, 'New York': 7.5, 'Los Angeles': 11, 'Chicago': 8, 'San Francisco': 11, 'Miami': 9, 'Barcelona': 2, 'Amsterdam': 1.5, 'Bangkok': 11.5, 'Istanbul': 4, 'Berlin': 2, 'Madrid': 2.5, 'Prague': 2, 'Vienna': 2.5, 'Stockholm': 2.5 },
  'Paris': { 'London': 1.5, 'Rome': 2, 'Dubai': 7, 'Tokyo': 12.5, 'Singapore': 13, 'Sydney': 22, 'Mumbai': 9, 'Delhi': 8.5, 'New York': 8, 'Los Angeles': 11.5, 'Chicago': 9, 'San Francisco': 11, 'Miami': 9.5, 'Barcelona': 2, 'Amsterdam': 1.5, 'Bangkok': 11.5, 'Istanbul': 3.5, 'Berlin': 1.5, 'Madrid': 2, 'Prague': 2, 'Vienna': 2, 'Stockholm': 2.5 },
  'Rome': { 'Paris': 2, 'London': 2.5, 'Dubai': 6, 'Tokyo': 12, 'Singapore': 12, 'Sydney': 21, 'Mumbai': 8, 'Delhi': 7.5, 'New York': 9, 'Los Angeles': 12.5, 'Chicago': 10, 'San Francisco': 12, 'Miami': 10, 'Barcelona': 1.5, 'Amsterdam': 2, 'Bangkok': 11, 'Istanbul': 2.5, 'Berlin': 2, 'Madrid': 2.5, 'Prague': 1.5, 'Vienna': 1.5, 'Stockholm': 3 },
  'Barcelona': { 'Paris': 2, 'London': 2, 'Rome': 1.5, 'Dubai': 7, 'Tokyo': 13, 'Singapore': 13, 'Sydney': 22, 'Mumbai': 9, 'Delhi': 9, 'New York': 8.5, 'Los Angeles': 12, 'Chicago': 9.5, 'San Francisco': 12, 'Miami': 9.5, 'Amsterdam': 2, 'Bangkok': 12, 'Istanbul': 3.5, 'Berlin': 2.5, 'Madrid': 1.5, 'Prague': 2.5, 'Vienna': 2.5, 'Stockholm': 3 },
  'Amsterdam': { 'Paris': 1.5, 'London': 1.5, 'Rome': 2, 'Dubai': 7, 'Tokyo': 11.5, 'Singapore': 12.5, 'Sydney': 22, 'Mumbai': 9, 'Delhi': 8, 'New York': 8, 'Los Angeles': 11, 'Chicago': 8.5, 'San Francisco': 11, 'Miami': 9.5, 'Barcelona': 2, 'Bangkok': 11.5, 'Istanbul': 3.5, 'Berlin': 1.5, 'Madrid': 2.5, 'Prague': 1.5, 'Vienna': 2, 'Stockholm': 2 },
  'Tokyo': { 'Paris': 12.5, 'London': 12, 'Rome': 12, 'Dubai': 10, 'Singapore': 7, 'Sydney': 10, 'Mumbai': 8.5, 'Delhi': 8, 'New York': 14, 'Los Angeles': 11, 'Chicago': 13, 'San Francisco': 10.5, 'Miami': 17, 'Barcelona': 13.5, 'Amsterdam': 11.5, 'Bangkok': 6, 'Istanbul': 11, 'Berlin': 11, 'Madrid': 14, 'Prague': 11.5, 'Vienna': 11.5, 'Stockholm': 10.5 },
  'Dubai': { 'Paris': 7, 'London': 7, 'Rome': 6, 'Tokyo': 10, 'Singapore': 7, 'Sydney': 14, 'Mumbai': 3, 'Delhi': 3.5, 'New York': 14, 'Los Angeles': 16, 'Chicago': 14, 'San Francisco': 16, 'Miami': 15, 'Barcelona': 7, 'Amsterdam': 7, 'Bangkok': 6, 'Istanbul': 4.5, 'Berlin': 6, 'Madrid': 7, 'Prague': 6, 'Vienna': 5.5, 'Stockholm': 6.5 },
  'Singapore': { 'Paris': 13, 'London': 13, 'Rome': 12, 'Dubai': 7, 'Tokyo': 7, 'Sydney': 8, 'Mumbai': 6, 'Delhi': 6, 'New York': 19, 'Los Angeles': 17.5, 'Chicago': 20, 'San Francisco': 17, 'Miami': 21, 'Barcelona': 13.5, 'Amsterdam': 12.5, 'Bangkok': 2.5, 'Istanbul': 10, 'Berlin': 12, 'Madrid': 14, 'Prague': 12, 'Vienna': 11.5, 'Stockholm': 11.5 },
  'Bangkok': { 'Paris': 11.5, 'London': 11.5, 'Rome': 11, 'Dubai': 6, 'Tokyo': 6, 'Singapore': 2.5, 'Sydney': 9, 'Mumbai': 4.5, 'Delhi': 4, 'New York': 18, 'Los Angeles': 17, 'Chicago': 19, 'San Francisco': 16, 'Miami': 20, 'Barcelona': 12, 'Amsterdam': 11.5, 'Istanbul': 9, 'Berlin': 10.5, 'Madrid': 12.5, 'Prague': 10, 'Vienna': 10, 'Stockholm': 10 },
  'Sydney': { 'Paris': 22, 'London': 22, 'Rome': 21, 'Dubai': 14, 'Tokyo': 10, 'Singapore': 8, 'Mumbai': 12, 'Delhi': 12.5, 'New York': 22, 'Los Angeles': 15, 'Chicago': 19, 'San Francisco': 14.5, 'Miami': 22, 'Barcelona': 22, 'Amsterdam': 22, 'Bangkok': 9, 'Istanbul': 18, 'Berlin': 21, 'Madrid': 22, 'Prague': 21, 'Vienna': 21, 'Stockholm': 20 },
  'Istanbul': { 'Paris': 3.5, 'London': 4, 'Rome': 2.5, 'Dubai': 4.5, 'Tokyo': 11, 'Singapore': 10, 'Sydney': 18, 'Mumbai': 6, 'Delhi': 5.5, 'New York': 11, 'Los Angeles': 13.5, 'Chicago': 11.5, 'San Francisco': 13, 'Miami': 12, 'Barcelona': 3.5, 'Amsterdam': 3.5, 'Bangkok': 9, 'Berlin': 3, 'Madrid': 4, 'Prague': 2.5, 'Vienna': 2, 'Stockholm': 3 },
  'Mumbai': { 'Paris': 9, 'London': 9, 'Rome': 8, 'Dubai': 3, 'Tokyo': 8.5, 'Singapore': 6, 'Sydney': 12, 'Delhi': 2, 'New York': 16, 'Los Angeles': 17.5, 'Chicago': 16.5, 'San Francisco': 17, 'Miami': 17, 'Barcelona': 9.5, 'Amsterdam': 9, 'Bangkok': 4.5, 'Istanbul': 6, 'Berlin': 8.5, 'Madrid': 9.5, 'Prague': 8, 'Vienna': 7.5, 'Stockholm': 8 },
  'Delhi': { 'Paris': 8.5, 'London': 8.5, 'Rome': 7.5, 'Dubai': 3.5, 'Tokyo': 8, 'Singapore': 6, 'Sydney': 12.5, 'Mumbai': 2, 'New York': 15.5, 'Los Angeles': 16.5, 'Chicago': 16, 'San Francisco': 16, 'Miami': 17, 'Barcelona': 9, 'Amsterdam': 8, 'Bangkok': 4, 'Istanbul': 5.5, 'Berlin': 7.5, 'Madrid': 9, 'Prague': 7.5, 'Vienna': 7, 'Stockholm': 7.5 },
  'Berlin': { 'Paris': 1.5, 'London': 2, 'Rome': 2, 'Dubai': 6, 'Tokyo': 11, 'Singapore': 12, 'Sydney': 21, 'Mumbai': 8.5, 'Delhi': 7.5, 'New York': 9, 'Los Angeles': 11.5, 'Chicago': 9.5, 'San Francisco': 11, 'Miami': 10, 'Barcelona': 2.5, 'Amsterdam': 1.5, 'Bangkok': 10.5, 'Istanbul': 3, 'Madrid': 2.5, 'Prague': 1, 'Vienna': 1, 'Stockholm': 1.5 },
  'Madrid': { 'Paris': 2, 'London': 2.5, 'Rome': 2.5, 'Dubai': 7, 'Tokyo': 14, 'Singapore': 14, 'Sydney': 22, 'Mumbai': 9.5, 'Delhi': 9, 'New York': 8.5, 'Los Angeles': 12, 'Chicago': 9.5, 'San Francisco': 12, 'Miami': 9.5, 'Barcelona': 1.5, 'Amsterdam': 2.5, 'Bangkok': 12.5, 'Istanbul': 4, 'Berlin': 2.5, 'Prague': 2.5, 'Vienna': 2.5, 'Stockholm': 3.5 },
  'Prague': { 'Paris': 2, 'London': 2, 'Rome': 1.5, 'Dubai': 6, 'Tokyo': 11.5, 'Singapore': 12, 'Sydney': 21, 'Mumbai': 8, 'Delhi': 7.5, 'New York': 9, 'Los Angeles': 12, 'Chicago': 9.5, 'San Francisco': 12, 'Miami': 10.5, 'Barcelona': 2.5, 'Amsterdam': 1.5, 'Bangkok': 10, 'Istanbul': 2.5, 'Berlin': 1, 'Madrid': 2.5, 'Vienna': 1, 'Stockholm': 2 },
  'Vienna': { 'Paris': 2, 'London': 2.5, 'Rome': 1.5, 'Dubai': 5.5, 'Tokyo': 11.5, 'Singapore': 11.5, 'Sydney': 21, 'Mumbai': 7.5, 'Delhi': 7, 'New York': 9.5, 'Los Angeles': 12.5, 'Chicago': 10, 'San Francisco': 12, 'Miami': 10.5, 'Barcelona': 2.5, 'Amsterdam': 2, 'Bangkok': 10, 'Istanbul': 2, 'Berlin': 1, 'Madrid': 2.5, 'Prague': 1, 'Stockholm': 2 },
  'Stockholm': { 'Paris': 2.5, 'London': 2.5, 'Rome': 3, 'Dubai': 6.5, 'Tokyo': 10.5, 'Singapore': 11.5, 'Sydney': 20, 'Mumbai': 8, 'Delhi': 7.5, 'New York': 9, 'Los Angeles': 11.5, 'Chicago': 9.5, 'San Francisco': 11, 'Miami': 10.5, 'Barcelona': 3, 'Amsterdam': 2, 'Bangkok': 10, 'Istanbul': 3, 'Berlin': 1.5, 'Madrid': 3.5, 'Prague': 2, 'Vienna': 2, },
};

// Destination-specific places with real landmarks
const destinationPlaces: Record<string, Array<{name: string, desc: string, cost: number, location: string}>> = {
  'Paris': [
    { name: 'Eiffel Tower', desc: 'Visit the iconic iron tower with stunning city views', cost: 30, location: 'Eiffel Tower, Paris, France' },
    { name: 'Louvre Museum', desc: 'Explore the world\'s largest art museum and see the Mona Lisa', cost: 20, location: 'Louvre Museum, Paris, France' },
    { name: 'Notre-Dame Cathedral', desc: 'Marvel at the Gothic architecture of this historic cathedral', cost: 0, location: 'Notre-Dame de Paris, France' },
    { name: 'Arc de Triomphe', desc: 'Visit the famous monument honoring French military victories', cost: 15, location: 'Arc de Triomphe, Paris, France' },
    { name: 'Champs-Élysées Shopping', desc: 'Browse luxury shops and cafés on the famous avenue', cost: 50, location: 'Champs-Élysées, Paris, France' },
    { name: 'Montmartre & Sacré-Cœur', desc: 'Explore the artistic hilltop neighborhood and basilica', cost: 10, location: 'Montmartre, Paris, France' },
    { name: 'Seine River Cruise', desc: 'Enjoy a romantic boat cruise along the Seine', cost: 25, location: 'Seine River, Paris, France' },
    { name: 'French Restaurant Dinner', desc: 'Savor authentic French cuisine at a local bistro', cost: 60, location: 'Le Marais, Paris, France' },
  ],
  'London': [
    { name: 'Tower of London', desc: 'Discover the historic castle and Crown Jewels', cost: 35, location: 'Tower of London, UK' },
    { name: 'British Museum', desc: 'Explore world history and culture (free entry)', cost: 0, location: 'British Museum, London, UK' },
    { name: 'Buckingham Palace', desc: 'Watch the Changing of the Guard ceremony', cost: 0, location: 'Buckingham Palace, London, UK' },
    { name: 'London Eye', desc: 'Enjoy panoramic views from the iconic Ferris wheel', cost: 40, location: 'London Eye, UK' },
    { name: 'Westminster Abbey', desc: 'Visit the Gothic church and royal coronation site', cost: 30, location: 'Westminster Abbey, London, UK' },
    { name: 'Covent Garden', desc: 'Shop, dine, and enjoy street performances', cost: 50, location: 'Covent Garden, London, UK' },
    { name: 'Thames River Cruise', desc: 'See London\'s landmarks from the water', cost: 25, location: 'Thames River, London, UK' },
    { name: 'Traditional Pub Dinner', desc: 'Experience British pub culture and cuisine', cost: 45, location: 'Camden Town, London, UK' },
  ],
  'Tokyo': [
    { name: 'Senso-ji Temple', desc: 'Visit Tokyo\'s oldest and most famous Buddhist temple', cost: 0, location: 'Senso-ji Temple, Tokyo, Japan' },
    { name: 'Tokyo Skytree', desc: 'See the city from Japan\'s tallest structure', cost: 35, location: 'Tokyo Skytree, Japan' },
    { name: 'Shibuya Crossing', desc: 'Experience the world\'s busiest pedestrian crossing', cost: 0, location: 'Shibuya Crossing, Tokyo, Japan' },
    { name: 'Meiji Shrine', desc: 'Explore the serene Shinto shrine in a forest setting', cost: 0, location: 'Meiji Shrine, Tokyo, Japan' },
    { name: 'Tsukiji Outer Market', desc: 'Sample fresh sushi and Japanese street food', cost: 40, location: 'Tsukiji Market, Tokyo, Japan' },
    { name: 'Akihabara District', desc: 'Discover anime, manga, and electronics culture', cost: 50, location: 'Akihabara, Tokyo, Japan' },
    { name: 'Imperial Palace Gardens', desc: 'Stroll through beautiful traditional gardens', cost: 0, location: 'Imperial Palace, Tokyo, Japan' },
    { name: 'Traditional Izakaya Dinner', desc: 'Enjoy Japanese tapas and sake at a local pub', cost: 55, location: 'Shinjuku, Tokyo, Japan' },
  ],
  'New York': [
    { name: 'Statue of Liberty', desc: 'Visit America\'s iconic symbol of freedom', cost: 25, location: 'Statue of Liberty, New York, USA' },
    { name: 'Central Park', desc: 'Relax in Manhattan\'s famous urban park', cost: 0, location: 'Central Park, New York, USA' },
    { name: 'Empire State Building', desc: 'See NYC from the observation deck', cost: 45, location: 'Empire State Building, New York, USA' },
    { name: 'Times Square', desc: 'Experience the bright lights and energy of NYC', cost: 0, location: 'Times Square, New York, USA' },
    { name: 'Metropolitan Museum of Art', desc: 'Explore one of the world\'s greatest art museums', cost: 30, location: 'The Met, New York, USA' },
    { name: 'Brooklyn Bridge Walk', desc: 'Walk across the historic suspension bridge', cost: 0, location: 'Brooklyn Bridge, New York, USA' },
    { name: '5th Avenue Shopping', desc: 'Shop at luxury stores and department stores', cost: 100, location: '5th Avenue, New York, USA' },
    { name: 'NYC Restaurant Dinner', desc: 'Dine at a world-class New York restaurant', cost: 70, location: 'Manhattan, New York, USA' },
  ],
  'Rome': [
    { name: 'Colosseum', desc: 'Explore the ancient Roman amphitheater', cost: 25, location: 'Colosseum, Rome, Italy' },
    { name: 'Vatican Museums & Sistine Chapel', desc: 'See Michelangelo\'s masterpieces and religious art', cost: 30, location: 'Vatican Museums, Vatican City' },
    { name: 'Trevi Fountain', desc: 'Toss a coin in Rome\'s most famous fountain', cost: 0, location: 'Trevi Fountain, Rome, Italy' },
    { name: 'Roman Forum', desc: 'Walk through ancient Roman government ruins', cost: 20, location: 'Roman Forum, Rome, Italy' },
    { name: 'Pantheon', desc: 'Marvel at the best-preserved Roman building', cost: 5, location: 'Pantheon, Rome, Italy' },
    { name: 'Spanish Steps', desc: 'Climb the famous stairway and enjoy the view', cost: 0, location: 'Spanish Steps, Rome, Italy' },
    { name: 'Trastevere District', desc: 'Explore charming cobblestone streets and shops', cost: 40, location: 'Trastevere, Rome, Italy' },
    { name: 'Italian Trattoria Dinner', desc: 'Savor authentic pasta and wine', cost: 50, location: 'Trastevere, Rome, Italy' },
  ],
  'Dubai': [
    { name: 'Burj Khalifa', desc: 'Visit the world\'s tallest building', cost: 50, location: 'Burj Khalifa, Dubai, UAE' },
    { name: 'Dubai Mall', desc: 'Shop at one of the world\'s largest malls', cost: 100, location: 'Dubai Mall, UAE' },
    { name: 'Dubai Marina', desc: 'Stroll along the beautiful waterfront promenade', cost: 0, location: 'Dubai Marina, UAE' },
    { name: 'Palm Jumeirah', desc: 'Visit the iconic man-made island', cost: 15, location: 'Palm Jumeirah, Dubai, UAE' },
    { name: 'Gold Souk', desc: 'Browse traditional gold and jewelry markets', cost: 50, location: 'Gold Souk, Dubai, UAE' },
    { name: 'Desert Safari', desc: 'Experience dune bashing and Bedouin culture', cost: 80, location: 'Dubai Desert, UAE' },
    { name: 'Dubai Fountain Show', desc: 'Watch the spectacular water and light show', cost: 0, location: 'Dubai Fountain, UAE' },
    { name: 'Luxury Restaurant Dinner', desc: 'Dine with views of the Burj Khalifa', cost: 90, location: 'Downtown Dubai, UAE' },
  ],
  'Barcelona': [
    { name: 'Sagrada Família', desc: 'See Gaudí\'s iconic unfinished basilica', cost: 35, location: 'Sagrada Família, Barcelona, Spain' },
    { name: 'Park Güell', desc: 'Explore the colorful mosaic-covered park', cost: 15, location: 'Park Güell, Barcelona, Spain' },
    { name: 'La Rambla', desc: 'Walk the famous tree-lined pedestrian street', cost: 0, location: 'La Rambla, Barcelona, Spain' },
    { name: 'Gothic Quarter', desc: 'Wander through medieval streets and squares', cost: 0, location: 'Gothic Quarter, Barcelona, Spain' },
    { name: 'Casa Batlló', desc: 'Tour Gaudí\'s fantastical modernist building', cost: 30, location: 'Casa Batlló, Barcelona, Spain' },
    { name: 'Barceloneta Beach', desc: 'Relax on the Mediterranean beach', cost: 0, location: 'Barceloneta Beach, Barcelona, Spain' },
    { name: 'La Boqueria Market', desc: 'Sample fresh produce and local delicacies', cost: 25, location: 'La Boqueria, Barcelona, Spain' },
    { name: 'Tapas Restaurant Dinner', desc: 'Enjoy Spanish tapas and sangria', cost: 45, location: 'El Born, Barcelona, Spain' },
  ],
  'Amsterdam': [
    { name: 'Anne Frank House', desc: 'Visit the historic hiding place and museum', cost: 15, location: 'Anne Frank House, Amsterdam, Netherlands' },
    { name: 'Van Gogh Museum', desc: 'See the world\'s largest Van Gogh collection', cost: 20, location: 'Van Gogh Museum, Amsterdam, Netherlands' },
    { name: 'Canal Cruise', desc: 'Explore Amsterdam\'s famous waterways by boat', cost: 20, location: 'Amsterdam Canals, Netherlands' },
    { name: 'Rijksmuseum', desc: 'Discover Dutch masters and art history', cost: 25, location: 'Rijksmuseum, Amsterdam, Netherlands' },
    { name: 'Dam Square', desc: 'Visit the historic city center and Royal Palace', cost: 0, location: 'Dam Square, Amsterdam, Netherlands' },
    { name: 'Vondelpark', desc: 'Relax in Amsterdam\'s largest city park', cost: 0, location: 'Vondelpark, Amsterdam, Netherlands' },
    { name: 'Albert Cuyp Market', desc: 'Browse the famous outdoor market', cost: 30, location: 'Albert Cuyp Market, Amsterdam, Netherlands' },
    { name: 'Dutch Cuisine Dinner', desc: 'Try traditional Dutch food and local beers', cost: 50, location: 'Jordaan, Amsterdam, Netherlands' },
  ],
  'Singapore': [
    { name: 'Marina Bay Sands', desc: 'Visit the iconic hotel and observation deck', cost: 30, location: 'Marina Bay Sands, Singapore' },
    { name: 'Gardens by the Bay', desc: 'Explore futuristic gardens and Supertree Grove', cost: 15, location: 'Gardens by the Bay, Singapore' },
    { name: 'Sentosa Island', desc: 'Enjoy beaches, attractions, and entertainment', cost: 40, location: 'Sentosa Island, Singapore' },
    { name: 'Chinatown & Buddha Tooth Relic Temple', desc: 'Explore historic Chinatown and temple', cost: 0, location: 'Chinatown, Singapore' },
    { name: 'Little India', desc: 'Experience vibrant Indian culture and cuisine', cost: 25, location: 'Little India, Singapore' },
    { name: 'Merlion Park', desc: 'See Singapore\'s iconic Merlion statue', cost: 0, location: 'Merlion Park, Singapore' },
    { name: 'Orchard Road Shopping', desc: 'Shop at Singapore\'s premier shopping street', cost: 60, location: 'Orchard Road, Singapore' },
    { name: 'Hawker Center Dinner', desc: 'Sample diverse Asian street food', cost: 20, location: 'Maxwell Food Centre, Singapore' },
  ],
  'Bangkok': [
    { name: 'Grand Palace', desc: 'Visit Thailand\'s most sacred temple complex', cost: 15, location: 'Grand Palace, Bangkok, Thailand' },
    { name: 'Wat Pho (Reclining Buddha)', desc: 'See the massive golden reclining Buddha', cost: 5, location: 'Wat Pho, Bangkok, Thailand' },
    { name: 'Wat Arun', desc: 'Climb the Temple of Dawn along the river', cost: 3, location: 'Wat Arun, Bangkok, Thailand' },
    { name: 'Chatuchak Weekend Market', desc: 'Browse one of the world\'s largest markets', cost: 30, location: 'Chatuchak Market, Bangkok, Thailand' },
    { name: 'Chao Phraya River Cruise', desc: 'Enjoy a scenic boat ride through Bangkok', cost: 25, location: 'Chao Phraya River, Bangkok, Thailand' },
    { name: 'Khao San Road', desc: 'Experience the famous backpacker street', cost: 0, location: 'Khao San Road, Bangkok, Thailand' },
    { name: 'Jim Thompson House', desc: 'Tour the Thai silk merchant\'s traditional home', cost: 7, location: 'Jim Thompson House, Bangkok, Thailand' },
    { name: 'Thai Street Food Dinner', desc: 'Savor authentic Pad Thai and local dishes', cost: 15, location: 'Yaowarat Chinatown, Bangkok, Thailand' },
  ],
  'Sydney': [
    { name: 'Sydney Opera House', desc: 'Tour the iconic architectural masterpiece', cost: 25, location: 'Sydney Opera House, Australia' },
    { name: 'Sydney Harbour Bridge', desc: 'Walk or climb the famous bridge', cost: 20, location: 'Sydney Harbour Bridge, Australia' },
    { name: 'Bondi Beach', desc: 'Relax on Australia\'s most famous beach', cost: 0, location: 'Bondi Beach, Sydney, Australia' },
    { name: 'Taronga Zoo', desc: 'See native Australian wildlife with harbor views', cost: 50, location: 'Taronga Zoo, Sydney, Australia' },
    { name: 'The Rocks Historic Area', desc: 'Explore Sydney\'s oldest neighborhood', cost: 0, location: 'The Rocks, Sydney, Australia' },
    { name: 'Royal Botanic Garden', desc: 'Stroll through beautiful harbourside gardens', cost: 0, location: 'Royal Botanic Garden Sydney, Australia' },
    { name: 'Darling Harbour', desc: 'Shop, dine, and enjoy waterfront attractions', cost: 40, location: 'Darling Harbour, Sydney, Australia' },
    { name: 'Harbour Dinner Cruise', desc: 'Dine with stunning Sydney Harbour views', cost: 80, location: 'Sydney Harbour, Australia' },
  ],
  'Istanbul': [
    { name: 'Hagia Sophia', desc: 'Marvel at the Byzantine architectural wonder', cost: 0, location: 'Hagia Sophia, Istanbul, Turkey' },
    { name: 'Blue Mosque', desc: 'Visit the stunning Sultan Ahmed Mosque', cost: 0, location: 'Blue Mosque, Istanbul, Turkey' },
    { name: 'Topkapi Palace', desc: 'Explore the Ottoman sultans\' opulent palace', cost: 20, location: 'Topkapi Palace, Istanbul, Turkey' },
    { name: 'Grand Bazaar', desc: 'Shop in one of the world\'s oldest markets', cost: 50, location: 'Grand Bazaar, Istanbul, Turkey' },
    { name: 'Bosphorus Cruise', desc: 'Sail between Europe and Asia', cost: 25, location: 'Bosphorus Strait, Istanbul, Turkey' },
    { name: 'Basilica Cistern', desc: 'Descend into the ancient underground cistern', cost: 10, location: 'Basilica Cistern, Istanbul, Turkey' },
    { name: 'Spice Bazaar', desc: 'Experience aromatic spices and Turkish delights', cost: 30, location: 'Spice Bazaar, Istanbul, Turkey' },
    { name: 'Turkish Dinner & Show', desc: 'Enjoy traditional cuisine and entertainment', cost: 45, location: 'Sultanahmet, Istanbul, Turkey' },
  ],
  'Mumbai': [
    { name: 'Gateway of India', desc: 'Visit Mumbai\'s iconic waterfront monument', cost: 0, location: 'Gateway of India, Mumbai, India' },
    { name: 'Elephanta Caves', desc: 'Explore ancient rock-cut temples (ferry + entry)', cost: 15, location: 'Elephanta Caves, Mumbai, India' },
    { name: 'Chhatrapati Shivaji Terminus', desc: 'See the UNESCO World Heritage railway station', cost: 0, location: 'CST Mumbai, India' },
    { name: 'Marine Drive', desc: 'Stroll along the Queen\'s Necklace promenade', cost: 0, location: 'Marine Drive, Mumbai, India' },
    { name: 'Haji Ali Dargah', desc: 'Visit the mosque on an island in the Arabian Sea', cost: 0, location: 'Haji Ali Dargah, Mumbai, India' },
    { name: 'Colaba Causeway Market', desc: 'Shop for handicrafts and street fashion', cost: 25, location: 'Colaba Causeway, Mumbai, India' },
    { name: 'Dharavi Tour', desc: 'Take a guided tour of Asia\'s largest slum community', cost: 20, location: 'Dharavi, Mumbai, India' },
    { name: 'Indian Cuisine Dinner', desc: 'Savor authentic Mumbai street food and curry', cost: 15, location: 'Mohammed Ali Road, Mumbai, India' },
  ],
  'Delhi': [
    { name: 'Red Fort', desc: 'Explore the massive Mughal fortress', cost: 5, location: 'Red Fort, Delhi, India' },
    { name: 'Qutub Minar', desc: 'Visit the UNESCO World Heritage tower', cost: 5, location: 'Qutub Minar, Delhi, India' },
    { name: 'India Gate', desc: 'See the war memorial and iconic landmark', cost: 0, location: 'India Gate, New Delhi, India' },
    { name: 'Lotus Temple', desc: 'Marvel at the Bahá\'í House of Worship', cost: 0, location: 'Lotus Temple, Delhi, India' },
    { name: 'Humayun\'s Tomb', desc: 'Explore the Mughal emperor\'s grand tomb', cost: 5, location: 'Humayun\'s Tomb, Delhi, India' },
    { name: 'Chandni Chowk Market', desc: 'Navigate Old Delhi\'s bustling bazaar', cost: 20, location: 'Chandni Chowk, Delhi, India' },
    { name: 'Akshardham Temple', desc: 'Visit the stunning modern Hindu temple', cost: 0, location: 'Akshardham Temple, Delhi, India' },
    { name: 'North Indian Dinner', desc: 'Enjoy butter chicken and naan at a dhaba', cost: 12, location: 'Connaught Place, Delhi, India' },
  ],
  'Los Angeles': [
    { name: 'Hollywood Sign Hike', desc: 'Hike to the iconic Hollywood sign viewpoint', cost: 0, location: 'Hollywood Sign, Los Angeles, USA' },
    { name: 'Universal Studios Hollywood', desc: 'Experience movie magic and theme park rides', cost: 120, location: 'Universal Studios Hollywood, USA' },
    { name: 'Santa Monica Pier', desc: 'Enjoy the beach, pier, and Pacific Park', cost: 0, location: 'Santa Monica Pier, California, USA' },
    { name: 'Getty Center', desc: 'Explore art, architecture, and gardens (free entry)', cost: 0, location: 'Getty Center, Los Angeles, USA' },
    { name: 'Griffith Observatory', desc: 'See city views and explore space exhibits', cost: 0, location: 'Griffith Observatory, Los Angeles, USA' },
    { name: 'Venice Beach Boardwalk', desc: 'Walk the eclectic beachfront promenade', cost: 0, location: 'Venice Beach, Los Angeles, USA' },
    { name: 'Rodeo Drive Shopping', desc: 'Browse luxury boutiques in Beverly Hills', cost: 80, location: 'Rodeo Drive, Beverly Hills, USA' },
    { name: 'California Cuisine Dinner', desc: 'Dine at a trendy LA restaurant', cost: 65, location: 'West Hollywood, USA' },
  ],
  'Chicago': [
    { name: 'Cloud Gate (The Bean)', desc: 'Visit Millennium Park\'s iconic sculpture', cost: 0, location: 'Cloud Gate, Chicago, USA' },
    { name: 'Willis Tower Skydeck', desc: 'Step onto the glass ledge 103 floors up', cost: 30, location: 'Willis Tower, Chicago, USA' },
    { name: 'Navy Pier', desc: 'Enjoy lakefront attractions and entertainment', cost: 15, location: 'Navy Pier, Chicago, USA' },
    { name: 'Art Institute of Chicago', desc: 'See world-class art collections', cost: 30, location: 'Art Institute of Chicago, USA' },
    { name: 'Magnificent Mile Shopping', desc: 'Shop along Michigan Avenue', cost: 60, location: 'Magnificent Mile, Chicago, USA' },
    { name: 'Chicago Architecture Boat Tour', desc: 'Cruise the Chicago River learning about buildings', cost: 45, location: 'Chicago River, USA' },
    { name: 'Millennium Park', desc: 'Relax in the downtown urban park', cost: 0, location: 'Millennium Park, Chicago, USA' },
    { name: 'Deep Dish Pizza Dinner', desc: 'Try authentic Chicago deep-dish pizza', cost: 40, location: 'Lincoln Park, Chicago, USA' },
  ],
  'San Francisco': [
    { name: 'Golden Gate Bridge', desc: 'Walk or bike across the iconic bridge', cost: 0, location: 'Golden Gate Bridge, San Francisco, USA' },
    { name: 'Alcatraz Island', desc: 'Tour the famous former federal prison', cost: 45, location: 'Alcatraz Island, San Francisco, USA' },
    { name: 'Fisherman\'s Wharf', desc: 'See sea lions and enjoy waterfront dining', cost: 0, location: 'Fisherman\'s Wharf, San Francisco, USA' },
    { name: 'Cable Car Ride', desc: 'Experience San Francisco\'s historic cable cars', cost: 8, location: 'San Francisco Cable Cars, USA' },
    { name: 'Chinatown', desc: 'Explore the oldest Chinatown in North America', cost: 20, location: 'San Francisco Chinatown, USA' },
    { name: 'Golden Gate Park', desc: 'Visit gardens, museums, and Japanese Tea Garden', cost: 10, location: 'Golden Gate Park, San Francisco, USA' },
    { name: 'Painted Ladies', desc: 'See the famous Victorian houses at Alamo Square', cost: 0, location: 'Painted Ladies, San Francisco, USA' },
    { name: 'Seafood Dinner', desc: 'Enjoy fresh seafood and clam chowder', cost: 55, location: 'Pier 39, San Francisco, USA' },
  ],
  'Miami': [
    { name: 'South Beach', desc: 'Relax on the famous Art Deco beach', cost: 0, location: 'South Beach, Miami, USA' },
    { name: 'Art Deco Historic District', desc: 'Walk through colorful 1930s architecture', cost: 0, location: 'Art Deco District, Miami Beach, USA' },
    { name: 'Wynwood Walls', desc: 'See spectacular outdoor street art', cost: 0, location: 'Wynwood Walls, Miami, USA' },
    { name: 'Vizcaya Museum & Gardens', desc: 'Tour the Italian Renaissance-style villa', cost: 25, location: 'Vizcaya Museum, Miami, USA' },
    { name: 'Little Havana', desc: 'Experience Cuban culture and cuisine', cost: 20, location: 'Little Havana, Miami, USA' },
    { name: 'Everglades Airboat Tour', desc: 'See alligators in their natural habitat', cost: 50, location: 'Everglades National Park, Florida, USA' },
    { name: 'Bayside Marketplace', desc: 'Shop and dine at the waterfront complex', cost: 35, location: 'Bayside Marketplace, Miami, USA' },
    { name: 'Cuban Dinner', desc: 'Savor authentic Cuban sandwiches and mojitos', cost: 40, location: 'Calle Ocho, Miami, USA' },
  ],
  'Berlin': [
    { name: 'Brandenburg Gate', desc: 'Visit Berlin\'s most iconic landmark', cost: 0, location: 'Brandenburg Gate, Berlin, Germany' },
    { name: 'Berlin Wall Memorial', desc: 'Learn about the divided city\'s history', cost: 0, location: 'Berlin Wall Memorial, Germany' },
    { name: 'Reichstag Building', desc: 'Tour the German Parliament with glass dome', cost: 0, location: 'Reichstag Building, Berlin, Germany' },
    { name: 'Museum Island', desc: 'Explore five world-renowned museums', cost: 20, location: 'Museum Island, Berlin, Germany' },
    { name: 'East Side Gallery', desc: 'See the longest remaining Berlin Wall section with art', cost: 0, location: 'East Side Gallery, Berlin, Germany' },
    { name: 'Checkpoint Charlie', desc: 'Visit the famous Cold War crossing point', cost: 0, location: 'Checkpoint Charlie, Berlin, Germany' },
    { name: 'Alexanderplatz Shopping', desc: 'Shop at Berlin\'s central square', cost: 45, location: 'Alexanderplatz, Berlin, Germany' },
    { name: 'German Cuisine Dinner', desc: 'Enjoy schnitzel, currywurst, and beer', cost: 35, location: 'Kreuzberg, Berlin, Germany' },
  ],
  'Madrid': [
    { name: 'Prado Museum', desc: 'See masterpieces by Velázquez and Goya', cost: 15, location: 'Prado Museum, Madrid, Spain' },
    { name: 'Royal Palace of Madrid', desc: 'Tour the official residence of Spanish royalty', cost: 15, location: 'Royal Palace of Madrid, Spain' },
    { name: 'Retiro Park', desc: 'Relax in Madrid\'s most famous park', cost: 0, location: 'Retiro Park, Madrid, Spain' },
    { name: 'Puerta del Sol', desc: 'Visit the bustling city center square', cost: 0, location: 'Puerta del Sol, Madrid, Spain' },
    { name: 'Reina Sofía Museum', desc: 'See Picasso\'s Guernica and modern art', cost: 12, location: 'Reina Sofía Museum, Madrid, Spain' },
    { name: 'Gran Vía Shopping', desc: 'Shop along Madrid\'s main shopping street', cost: 50, location: 'Gran Vía, Madrid, Spain' },
    { name: 'El Rastro Flea Market', desc: 'Browse Madrid\'s famous Sunday market', cost: 25, location: 'El Rastro, Madrid, Spain' },
    { name: 'Tapas Tour Dinner', desc: 'Hop between tapas bars like a local', cost: 40, location: 'La Latina, Madrid, Spain' },
  ],
  'Prague': [
    { name: 'Charles Bridge', desc: 'Walk the historic 14th-century bridge', cost: 0, location: 'Charles Bridge, Prague, Czech Republic' },
    { name: 'Prague Castle', desc: 'Explore the largest ancient castle complex', cost: 12, location: 'Prague Castle, Czech Republic' },
    { name: 'Old Town Square', desc: 'See the Astronomical Clock and Gothic churches', cost: 0, location: 'Old Town Square, Prague, Czech Republic' },
    { name: 'Jewish Quarter', desc: 'Visit historic synagogues and Jewish cemetery', cost: 15, location: 'Jewish Quarter, Prague, Czech Republic' },
    { name: 'Petřín Lookout Tower', desc: 'Climb the mini Eiffel Tower for city views', cost: 5, location: 'Petřín Tower, Prague, Czech Republic' },
    { name: 'Wenceslas Square', desc: 'Stroll the commercial and cultural center', cost: 0, location: 'Wenceslas Square, Prague, Czech Republic' },
    { name: 'Vltava River Cruise', desc: 'See Prague\'s landmarks from the river', cost: 18, location: 'Vltava River, Prague, Czech Republic' },
    { name: 'Czech Beer Hall Dinner', desc: 'Enjoy goulash and world-famous Czech beer', cost: 25, location: 'Old Town, Prague, Czech Republic' },
  ],
  'Vienna': [
    { name: 'Schönbrunn Palace', desc: 'Tour the former imperial summer residence', cost: 20, location: 'Schönbrunn Palace, Vienna, Austria' },
    { name: 'St. Stephen\'s Cathedral', desc: 'Visit Vienna\'s Gothic masterpiece', cost: 8, location: 'St. Stephen\'s Cathedral, Vienna, Austria' },
    { name: 'Hofburg Palace', desc: 'Explore the Habsburg dynasty\'s winter palace', cost: 15, location: 'Hofburg Palace, Vienna, Austria' },
    { name: 'Belvedere Palace', desc: 'See Klimt\'s "The Kiss" and baroque gardens', cost: 18, location: 'Belvedere Palace, Vienna, Austria' },
    { name: 'Vienna State Opera', desc: 'Tour or attend a performance at the opera house', cost: 12, location: 'Vienna State Opera, Austria' },
    { name: 'Naschmarkt', desc: 'Browse Vienna\'s popular outdoor market', cost: 30, location: 'Naschmarkt, Vienna, Austria' },
    { name: 'Ringstrasse Walk', desc: 'Stroll the grand boulevard with monuments', cost: 0, location: 'Ringstrasse, Vienna, Austria' },
    { name: 'Viennese Café & Schnitzel', desc: 'Enjoy coffee culture and traditional schnitzel', cost: 40, location: 'Innere Stadt, Vienna, Austria' },
  ],
  'Stockholm': [
    { name: 'Vasa Museum', desc: 'See the 17th-century warship that sank and was recovered', cost: 18, location: 'Vasa Museum, Stockholm, Sweden' },
    { name: 'Gamla Stan', desc: 'Explore the charming medieval old town', cost: 0, location: 'Gamla Stan, Stockholm, Sweden' },
    { name: 'Royal Palace', desc: 'Visit one of Europe\'s largest palaces', cost: 15, location: 'Royal Palace Stockholm, Sweden' },
    { name: 'ABBA Museum', desc: 'Experience interactive exhibits about the famous band', cost: 25, location: 'ABBA Museum, Stockholm, Sweden' },
    { name: 'Skansen Open-Air Museum', desc: 'Discover Swedish history and Nordic animals', cost: 20, location: 'Skansen, Stockholm, Sweden' },
    { name: 'Djurgården Island', desc: 'Enjoy the park island with museums and nature', cost: 0, location: 'Djurgården, Stockholm, Sweden' },
    { name: 'Drottninggatan Shopping', desc: 'Shop on Stockholm\'s main pedestrian street', cost: 50, location: 'Drottninggatan, Stockholm, Sweden' },
    { name: 'Swedish Dinner', desc: 'Try meatballs, herring, and Nordic cuisine', cost: 55, location: 'Södermalm, Stockholm, Sweden' },
  ],
};

// Default generic places for cities not in the database
const defaultPlaces = [
  { name: 'Historical Museum', desc: 'Explore local artifacts and cultural history', cost: 25, location: '' },
  { name: 'City Center', desc: 'Walk through bustling streets and local markets', cost: 0, location: '' },
  { name: 'Main Landmark', desc: 'Visit the iconic monument and take photos', cost: 15, location: '' },
  { name: 'Local Restaurant', desc: 'Experience authentic local cuisine and flavors', cost: 40, location: '' },
  { name: 'Art Gallery', desc: 'Discover contemporary and classical art', cost: 20, location: '' },
  { name: 'Central Park', desc: 'Relax in nature and enjoy scenic views', cost: 0, location: '' },
  { name: 'Shopping District', desc: 'Browse local shops and find unique souvenirs', cost: 50, location: '' },
  { name: 'Night Market', desc: 'Experience vibrant evening atmosphere and food', cost: 30, location: '' },
];

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [travelDetails, setTravelDetails] = useState<TravelDetails>({
    from: '',
    destination: '',
    days: 1,
    budget: 1000,
    currency: 'USD',
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const convertCurrency = (amount: number, currency: string): number => {
    return Math.round(amount * currencyRates[currency]);
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const symbol = currencySymbols[currency];
    const converted = convertCurrency(amount, currency);
    return `${symbol}${converted.toLocaleString()}`;
  };

  const openInMaps = (location: string, placeName: string) => {
    if (location) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(mapsUrl, '_blank');
    } else {
      // Fallback if no specific location
      const query = `${placeName}, ${travelDetails.destination}`;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const calculateFlightTimes = (from: string, to: string) => {
    const duration = flightDurations[from]?.[to] || 8; // Default 8 hours if not found
    const departureHour = 8 + Math.floor(Math.random() * 6); // Random departure between 8 AM and 2 PM
    const departureMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes

    const departure = new Date();
    departure.setHours(departureHour, departureMinute, 0);

    const arrival = new Date(departure);
    arrival.setHours(arrival.getHours() + Math.floor(duration));
    arrival.setMinutes(arrival.getMinutes() + Math.round((duration % 1) * 60));

    const formatTime = (date: Date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    return {
      departure: formatTime(departure),
      arrival: formatTime(arrival),
      duration: `${Math.floor(duration)}h ${Math.round((duration % 1) * 60)}m`,
    };
  };

  const generateItinerary = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate costs
    const flightCost = Math.min(travelDetails.budget * 0.3, 500);
    const hotelNightlyRate = Math.min((travelDetails.budget * 0.4) / travelDetails.days, 200);
    const hotelTotalCost = hotelNightlyRate * travelDetails.days;
    const dailyActivityBudget = (travelDetails.budget - flightCost - hotelTotalCost) / travelDetails.days;

    // Get flight times
    const flightTimes = calculateFlightTimes(travelDetails.from, travelDetails.destination);

    // Get real hotel
    const hotels = destinationHotels[travelDetails.destination];
    const selectedHotel = hotels ? hotels[Math.floor(Math.random() * hotels.length)] : { name: 'Luxury Hotel', rating: 5 };

    // Get destination-specific places
    const placesData = destinationPlaces[travelDetails.destination] || defaultPlaces.map(p => ({
      ...p,
      location: p.location || `${p.name}, ${travelDetails.destination}`
    }));

    // Calculate activities per day based on available places
    const totalPlaces = placesData.length;
    const activitiesPerDay = totalPlaces >= 5 ? 5 : Math.min(totalPlaces, 4);

    const places = Array.from({ length: travelDetails.days }, (_, dayIndex) => {
      const dayActivities = [];
      const timeSlots = ['09:00 AM', '11:30 AM', '02:00 PM', '05:00 PM', '07:30 PM'];

      for (let i = 0; i < activitiesPerDay; i++) {
        const placeIndex = (dayIndex * activitiesPerDay + i) % placesData.length;
        dayActivities.push({
          time: timeSlots[i],
          place: placesData[placeIndex].name,
          description: placesData[placeIndex].desc,
          estimatedCost: placesData[placeIndex].cost,
          location: placesData[placeIndex].location,
        });
      }

      return {
        day: dayIndex + 1,
        activities: dayActivities,
      };
    });

    const totalCost = flightCost + hotelTotalCost + (dailyActivityBudget * travelDetails.days);

    const generatedItinerary: Itinerary = {
      flight: {
        from: travelDetails.from,
        to: travelDetails.destination,
        estimatedCost: Math.round(flightCost),
        departure: flightTimes.departure,
        arrival: flightTimes.arrival,
      },
      hotel: {
        name: selectedHotel.name,
        checkIn: 'Day 1 - 03:00 PM',
        checkOut: `Day ${travelDetails.days} - 11:00 AM`,
        nightlyRate: Math.round(hotelNightlyRate),
        totalCost: Math.round(hotelTotalCost),
        rating: selectedHotel.rating,
      },
      places,
      summary: {
        totalCost: Math.round(totalCost),
        remainingBudget: Math.round(travelDetails.budget - totalCost),
      },
    };

    setItinerary(generatedItinerary);
  };

  const resetForm = () => {
    setShowForm(false);
    setItinerary(null);
    setTravelDetails({
      from: '',
      destination: '',
      days: 1,
      budget: 1000,
      currency: 'USD',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Clouds */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>☁️</div>
        <div className="absolute top-40 right-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>☁️</div>
        <div className="absolute bottom-32 left-1/4 text-7xl opacity-20 animate-float" style={{ animationDelay: '4s' }}>☁️</div>

        {/* Flying Planes */}
        <div className="absolute top-1/3 text-4xl animate-fly-across" style={{ animationDelay: '1s' }}>✈️</div>
        <div className="absolute top-2/3 text-3xl animate-fly-across-reverse" style={{ animationDelay: '5s' }}>🛫</div>
      </div>

      {/* Welcome Section */}
      {!showForm && !itinerary && (
        <div className="flex min-h-screen items-center justify-center px-4 relative z-10">
          <div className="max-w-4xl text-center">
            <div className="mb-8 animate-fade-in-up">
              {/* Rotating Globe */}
              <div className="text-8xl mb-4 animate-spin-slow inline-block">🌍</div>
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 animate-fade-in">
                TravelPlanner
              </h1>
              <div className="flex items-center justify-center gap-2 text-2xl text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <span className="animate-bounce">✈️</span>
                <span>Your Perfect Trip Companion</span>
                <span className="animate-pulse">🗺️</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                Welcome to Your Journey!
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Planning a trip has never been easier. TravelPlanner helps you create personalized
                travel itineraries tailored to your budget and preferences. Simply tell us where
                you want to go, how long you&apos;re staying, and your budget, and we&apos;ll craft the
                perfect journey for you.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="p-6 bg-blue-50 rounded-xl animate-scale-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.3s' }}>
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Smart Planning</h3>
                  <p className="text-sm text-gray-600">
                    Get optimized itineraries based on your budget and duration
                  </p>
                </div>
                <div className="p-6 bg-purple-50 rounded-xl animate-scale-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.5s' }}>
                  <div className="text-4xl mb-3">🏨</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Real Hotel Recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Stay at luxury hotels from The Plaza to Burj Al Arab
                  </p>
                </div>
                <div className="p-6 bg-pink-50 rounded-xl animate-scale-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.7s' }}>
                  <div className="text-4xl mb-3">📍</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Real Landmarks</h3>
                  <p className="text-sm text-gray-600">
                    Visit Eiffel Tower, Statue of Liberty, and more iconic places
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Start Planning Your Trip
              </button>
            </div>

            <p className="text-gray-500 text-sm">
              Join thousands of travelers who have discovered their perfect journey with TravelPlanner
            </p>
          </div>
        </div>
      )}

      {/* Form Section */}
      {showForm && !itinerary && (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Plan Your Trip</h2>
              <p className="text-gray-600 mb-8">Fill in the details below to create your personalized itinerary</p>

              <form onSubmit={generateItinerary} className="space-y-6">
                <div>
                  <label htmlFor="from" className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      🛫 From (Origin City)
                    </span>
                  </label>
                  <select
                    id="from"
                    required
                    value={travelDetails.from}
                    onChange={(e) => setTravelDetails({ ...travelDetails, from: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
                  >
                    <option value="">Select origin city</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="destination" className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      🛬 Destination
                    </span>
                  </label>
                  <select
                    id="destination"
                    required
                    value={travelDetails.destination}
                    onChange={(e) => setTravelDetails({ ...travelDetails, destination: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
                  >
                    <option value="">Select destination</option>
                    {availableCities.filter(city => city !== travelDetails.from).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {travelDetails.destination && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <span>✓</span> Complete travel data available for {travelDetails.destination}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="days" className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        📅 Number of Days
                      </span>
                    </label>
                    <input
                      type="number"
                      id="days"
                      required
                      min="1"
                      max="30"
                      value={travelDetails.days}
                      onChange={(e) => setTravelDetails({ ...travelDetails, days: e.target.value === '' ? 1 : parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        💱 Currency
                      </span>
                    </label>
                    <select
                      id="currency"
                      value={travelDetails.currency}
                      onChange={(e) => setTravelDetails({ ...travelDetails, currency: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
                    >
                      {Object.keys(currencyRates).map(curr => (
                        <option key={curr} value={curr}>
                          {curr} ({currencySymbols[curr]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      💰 Budget ({travelDetails.currency})
                    </span>
                  </label>
                  <input
                    type="number"
                    id="budget"
                    required
                    min="100"
                    value={travelDetails.budget}
                    onChange={(e) => setTravelDetails({ ...travelDetails, budget: e.target.value === '' ? 100 : parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  />
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <span className="font-semibold">Total Budget:</span>
                    <span className="text-blue-700 font-bold">{formatCurrency(travelDetails.budget, travelDetails.currency)}</span>
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Generate Itinerary
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Itinerary Display */}
      {itinerary && (
        <div className="min-h-screen px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Your Personalized Itinerary</h2>
              <p className="text-gray-600">
                {travelDetails.from} → {travelDetails.destination} | {travelDetails.days} Days
              </p>
            </div>

            {/* Flight Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">✈️</span>
                <h3 className="text-2xl font-bold text-gray-800">Flight Details</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-semibold">From:</span>
                    <span className="text-gray-900">{itinerary.flight.from}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-semibold">To:</span>
                    <span className="text-gray-900">{itinerary.flight.to}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="text-gray-700 font-semibold">Departure:</span>
                    <span className="text-gray-900">{itinerary.flight.departure}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="text-gray-700 font-semibold">Arrival:</span>
                    <span className="text-gray-900">{itinerary.flight.arrival}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Estimated Flight Cost:</span>
                  <span className="text-2xl font-bold">{formatCurrency(itinerary.flight.estimatedCost, travelDetails.currency)}</span>
                </div>
              </div>
            </div>

            {/* Hotel Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🏨</span>
                <h3 className="text-2xl font-bold text-gray-800">Accommodation</h3>
              </div>
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{itinerary.hotel.name}</h4>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-400">{'★'.repeat(Math.floor(itinerary.hotel.rating))}</span>
                  <span className="text-gray-600">({itinerary.hotel.rating}/5)</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-semibold block mb-1">Check-in:</span>
                  <span className="text-gray-900">{itinerary.hotel.checkIn}</span>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-semibold block mb-1">Check-out:</span>
                  <span className="text-gray-900">{itinerary.hotel.checkOut}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-semibold">Nightly Rate:</span>
                  <span className="text-gray-900 font-bold">{formatCurrency(itinerary.hotel.nightlyRate, travelDetails.currency)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg">
                  <span className="font-semibold text-lg">Total Stay Cost:</span>
                  <span className="text-2xl font-bold">{formatCurrency(itinerary.hotel.totalCost, travelDetails.currency)}</span>
                </div>
              </div>
            </div>

            {/* Places to Visit Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📍</span>
                <h3 className="text-2xl font-bold text-gray-800">Daily Itinerary</h3>
              </div>

              {/* Helpful tip for longer trips */}
              {travelDetails.days > 2 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-400 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">Maximize Your Experience!</h4>
                      <p className="text-sm text-orange-800">
                        For longer stays, consider exploring nearby cities too! Each destination has 5-8 unique attractions.
                        You can also extend your visit to neighboring areas for more variety.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {itinerary.places.map((day) => (
                  <div key={day.day} className="border-l-4 border-blue-500 pl-6 pb-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                        {day.day}
                      </span>
                      Day {day.day}
                    </h4>
                    <div className="space-y-4">
                      {day.activities.map((activity, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer group"
                          onClick={() => openInMaps(activity.location, activity.place)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-blue-600 font-bold">{activity.time}</span>
                              <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {activity.place}
                              </span>
                              <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                📍
                              </span>
                            </div>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {formatCurrency(activity.estimatedCost, travelDetails.currency)}
                            </span>
                          </div>
                          <p className="text-gray-600 ml-20">{activity.description}</p>
                          <p className="text-xs text-gray-400 ml-20 mt-1 group-hover:text-blue-500 transition-colors">
                            Click to view on Google Maps
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white mb-6">
              <h3 className="text-2xl font-bold mb-6">Trip Summary</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <p className="text-blue-100 mb-2">Total Budget</p>
                  <p className="text-3xl font-bold">{formatCurrency(travelDetails.budget, travelDetails.currency)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <p className="text-blue-100 mb-2">Estimated Cost</p>
                  <p className="text-3xl font-bold">{formatCurrency(itinerary.summary.totalCost, travelDetails.currency)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <p className="text-blue-100 mb-2">Remaining Budget</p>
                  <p className="text-3xl font-bold">{formatCurrency(itinerary.summary.remainingBudget, travelDetails.currency)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetForm}
                className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Plan Another Trip
              </button>
              <button
                onClick={() => window.print()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Print Itinerary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
