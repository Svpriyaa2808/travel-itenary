'use client';

import { useState } from 'react';

interface TravelDetails {
  from: string;
  destination: string;
  days: number;
  budget: number;
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
    }[];
  }[];
  summary: {
    totalCost: number;
    remainingBudget: number;
  };
}

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [travelDetails, setTravelDetails] = useState<TravelDetails>({
    from: '',
    destination: '',
    days: 1,
    budget: 1000,
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const generateItinerary = (e: React.FormEvent) => {
    e.preventDefault();

    // Sample itinerary generation (in a real app, this would call an AI API)
    const flightCost = Math.min(travelDetails.budget * 0.3, 500);
    const hotelNightlyRate = Math.min((travelDetails.budget * 0.4) / travelDetails.days, 200);
    const hotelTotalCost = hotelNightlyRate * travelDetails.days;
    const dailyActivityBudget = (travelDetails.budget - flightCost - hotelTotalCost) / travelDetails.days;

    const popularPlaces = [
      { name: 'Historical Museum', desc: 'Explore ancient artifacts and cultural history', cost: 25 },
      { name: 'City Center', desc: 'Walk through bustling streets and local markets', cost: 0 },
      { name: 'Famous Landmark', desc: 'Visit the iconic monument and take photos', cost: 15 },
      { name: 'Local Restaurant', desc: 'Experience authentic cuisine and local flavors', cost: 40 },
      { name: 'Art Gallery', desc: 'Discover contemporary and classical art pieces', cost: 20 },
      { name: 'Beach/Park', desc: 'Relax in nature and enjoy scenic views', cost: 0 },
      { name: 'Shopping District', desc: 'Browse local shops and find unique souvenirs', cost: 50 },
      { name: 'Night Market', desc: 'Experience vibrant evening atmosphere and street food', cost: 30 },
    ];

    const places = Array.from({ length: travelDetails.days }, (_, dayIndex) => ({
      day: dayIndex + 1,
      activities: [
        {
          time: '09:00 AM',
          place: popularPlaces[dayIndex % popularPlaces.length].name,
          description: popularPlaces[dayIndex % popularPlaces.length].desc,
          estimatedCost: popularPlaces[dayIndex % popularPlaces.length].cost,
        },
        {
          time: '01:00 PM',
          place: popularPlaces[(dayIndex + 1) % popularPlaces.length].name,
          description: popularPlaces[(dayIndex + 1) % popularPlaces.length].desc,
          estimatedCost: popularPlaces[(dayIndex + 1) % popularPlaces.length].cost,
        },
        {
          time: '06:00 PM',
          place: popularPlaces[(dayIndex + 2) % popularPlaces.length].name,
          description: popularPlaces[(dayIndex + 2) % popularPlaces.length].desc,
          estimatedCost: popularPlaces[(dayIndex + 2) % popularPlaces.length].cost,
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
                    required
                    value={travelDetails.from}
                    onChange={(e) => setTravelDetails({ ...travelDetails, from: e.target.value })}
                    placeholder="e.g., New York"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="destination" className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    id="destination"
                    required
                    value={travelDetails.destination}
                    onChange={(e) => setTravelDetails({ ...travelDetails, destination: e.target.value })}
                    placeholder="e.g., Paris"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

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
                    onChange={(e) => setTravelDetails({ ...travelDetails, days: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    id="budget"
                    required
                    min="100"
                    value={travelDetails.budget}
                    onChange={(e) => setTravelDetails({ ...travelDetails, budget: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-2">Current budget: ${travelDetails.budget.toLocaleString()}</p>
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
                  <span className="text-2xl font-bold">${itinerary.flight.estimatedCost}</span>
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
                  <span className="text-gray-900 font-bold">${itinerary.hotel.nightlyRate}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg">
                  <span className="font-semibold text-lg">Total Stay Cost:</span>
                  <span className="text-2xl font-bold">${itinerary.hotel.totalCost}</span>
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
                        <div key={idx} className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-blue-600 font-bold">{activity.time}</span>
                              <span className="text-lg font-semibold text-gray-800">{activity.place}</span>
                            </div>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                              ${activity.estimatedCost}
                            </span>
                          </div>
                          <p className="text-gray-600 ml-20">{activity.description}</p>
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
                  <p className="text-3xl font-bold">${travelDetails.budget.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <p className="text-blue-100 mb-2">Estimated Cost</p>
                  <p className="text-3xl font-bold">${itinerary.summary.totalCost.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <p className="text-blue-100 mb-2">Remaining Budget</p>
                  <p className="text-3xl font-bold">${itinerary.summary.remainingBudget.toLocaleString()}</p>
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
