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

// Popular cities for autocomplete
const popularCities = [
  'New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco',
  'London', 'Paris', 'Rome', 'Barcelona', 'Amsterdam',
  'Tokyo', 'Osaka', 'Kyoto', 'Seoul', 'Singapore',
  'Dubai', 'Istanbul', 'Bangkok', 'Mumbai', 'Delhi',
  'Sydney', 'Melbourne', 'Toronto', 'Vancouver', 'Montreal',
  'Berlin', 'Munich', 'Madrid', 'Lisbon', 'Prague',
  'Vienna', 'Stockholm', 'Copenhagen', 'Oslo', 'Helsinki',
];

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

  const generateItinerary = (e: React.FormEvent) => {
    e.preventDefault();

    // Sample itinerary generation (in a real app, this would call an AI API)
    const flightCost = Math.min(travelDetails.budget * 0.3, 500);
    const hotelNightlyRate = Math.min((travelDetails.budget * 0.4) / travelDetails.days, 200);
    const hotelTotalCost = hotelNightlyRate * travelDetails.days;
    const dailyActivityBudget = (travelDetails.budget - flightCost - hotelTotalCost) / travelDetails.days;

    // Get destination-specific places or use defaults
    const placesData = destinationPlaces[travelDetails.destination] || defaultPlaces.map(p => ({
      ...p,
      location: p.location || `${p.name}, ${travelDetails.destination}`
    }));

    const places = Array.from({ length: travelDetails.days }, (_, dayIndex) => ({
      day: dayIndex + 1,
      activities: [
        {
          time: '09:00 AM',
          place: placesData[dayIndex % placesData.length].name,
          description: placesData[dayIndex % placesData.length].desc,
          estimatedCost: placesData[dayIndex % placesData.length].cost,
          location: placesData[dayIndex % placesData.length].location,
        },
        {
          time: '01:00 PM',
          place: placesData[(dayIndex + 1) % placesData.length].name,
          description: placesData[(dayIndex + 1) % placesData.length].desc,
          estimatedCost: placesData[(dayIndex + 1) % placesData.length].cost,
          location: placesData[(dayIndex + 1) % placesData.length].location,
        },
        {
          time: '06:00 PM',
          place: placesData[(dayIndex + 2) % placesData.length].name,
          description: placesData[(dayIndex + 2) % placesData.length].desc,
          estimatedCost: placesData[(dayIndex + 2) % placesData.length].cost,
          location: placesData[(dayIndex + 2) % placesData.length].location,
        },
      ],
    }));

    const totalCost = flightCost + hotelTotalCost + (dailyActivityBudget * travelDetails.days);

    const generatedItinerary: Itinerary = {
      flight: {
        from: travelDetails.from,
        to: travelDetails.destination,
        estimatedCost: Math.round(flightCost),
        departure: '10:30 AM',
        arrival: '02:45 PM',
      },
      hotel: {
        name: `Premium ${travelDetails.destination} Resort & Spa`,
        checkIn: 'Day 1 - 03:00 PM',
        checkOut: `Day ${travelDetails.days} - 11:00 AM`,
        nightlyRate: Math.round(hotelNightlyRate),
        totalCost: Math.round(hotelTotalCost),
        rating: 4.5,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Welcome Section */}
      {!showForm && !itinerary && (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-4xl text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                TravelPlanner
              </h1>
              <div className="flex items-center justify-center gap-2 text-2xl text-gray-600 mb-8">
                <span>✈️</span>
                <span>Your Perfect Trip Companion</span>
                <span>🌍</span>
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
                <div className="p-6 bg-blue-50 rounded-xl">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Smart Planning</h3>
                  <p className="text-sm text-gray-600">
                    Get optimized itineraries based on your budget and duration
                  </p>
                </div>
                <div className="p-6 bg-purple-50 rounded-xl">
                  <div className="text-4xl mb-3">🏨</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Hotel Recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Find the best stays that fit your budget and preferences
                  </p>
                </div>
                <div className="p-6 bg-pink-50 rounded-xl">
                  <div className="text-4xl mb-3">📍</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Places to Visit</h3>
                  <p className="text-sm text-gray-600">
                    Discover must-see attractions and hidden gems
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
                    From (Origin City)
                  </label>
                  <input
                    type="text"
                    id="from"
                    list="from-cities"
                    required
                    value={travelDetails.from}
                    onChange={(e) => setTravelDetails({ ...travelDetails, from: e.target.value })}
                    placeholder="e.g., New York"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <datalist id="from-cities">
                    {popularCities.map(city => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="destination" className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    id="destination"
                    list="destination-cities"
                    required
                    value={travelDetails.destination}
                    onChange={(e) => setTravelDetails({ ...travelDetails, destination: e.target.value })}
                    placeholder="e.g., Paris"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <datalist id="destination-cities">
                    {popularCities.map(city => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                  {destinationPlaces[travelDetails.destination] && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <span>✓</span> Real landmarks available for {travelDetails.destination}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="days" className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Days
                    </label>
                    <input
                      type="number"
                      id="days"
                      required
                      min="1"
                      max="30"
                      value={travelDetails.days}
                      onChange={(e) => setTravelDetails({ ...travelDetails, days: e.target.value === '' ? 1 : parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={travelDetails.currency}
                      onChange={(e) => setTravelDetails({ ...travelDetails, currency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
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
                    Budget ({travelDetails.currency})
                  </label>
                  <input
                    type="number"
                    id="budget"
                    required
                    min="100"
                    value={travelDetails.budget}
                    onChange={(e) => setTravelDetails({ ...travelDetails, budget: e.target.value === '' ? 100 : parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Current budget: {formatCurrency(travelDetails.budget, travelDetails.currency)}
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
