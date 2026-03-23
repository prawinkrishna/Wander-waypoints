import { WizardStep } from '../models/wizard-step.model';

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'location',
    title: 'Where are you traveling?',
    subtitle: 'Tell us your origin and destination',
    icon: 'flight',
    fields: [
      {
        key: 'location-pair',
        type: 'location-pair',
        label: 'Locations',
        options: [
          { value: 'origin', label: 'Origin', icon: 'flight_takeoff', description: 'Starting city' },
          { value: 'destination', label: 'Destination', icon: 'flight_land', description: 'Where are you going?' }
        ]
      }
    ]
  },
  {
    id: 'dates',
    title: 'When are you traveling?',
    subtitle: 'Pick your travel dates',
    icon: 'calendar_today',
    fields: [
      {
        key: 'date-range',
        type: 'date-range',
        label: 'Travel Dates'
      }
    ]
  },
  {
    id: 'tripType',
    title: 'What kind of trip?',
    subtitle: 'Choose your travel style',
    icon: 'groups',
    fields: [
      {
        key: 'tripType',
        type: 'card-select',
        label: 'Trip Type',
        options: [
          { value: 'solo', label: 'Solo', icon: 'person', description: 'Just me, exploring at my own pace' },
          { value: 'couple', label: 'Couple', icon: 'favorite', description: 'Romantic getaway for two' },
          { value: 'group', label: 'Group', icon: 'groups', description: 'Fun trip with friends' },
          { value: 'family', label: 'Family', icon: 'family_restroom', description: 'Kid-friendly adventures' }
        ]
      }
    ]
  },
  {
    id: 'budget',
    title: "What's your budget?",
    subtitle: 'This helps us tailor recommendations',
    icon: 'payments',
    fields: [
      {
        key: 'budget',
        type: 'card-select',
        label: 'Budget',
        options: [
          { value: 'low', label: 'Budget', icon: 'savings', description: 'Hostels, street food, public transport' },
          { value: 'medium', label: 'Mid-Range', icon: 'account_balance_wallet', description: 'Hotels, restaurants, some tours' },
          { value: 'high', label: 'Luxury', icon: 'diamond', description: 'Premium stays, fine dining, private tours' }
        ]
      }
    ]
  },
  {
    id: 'travelStyle',
    title: 'Your travel pace',
    subtitle: 'How packed should your days be?',
    icon: 'speed',
    fields: [
      {
        key: 'travelStyle',
        type: 'card-select',
        label: 'Travel Style',
        options: [
          { value: 'relaxed', label: 'Relaxed', icon: 'spa', description: '2-3 activities per day, plenty of downtime' },
          { value: 'balanced', label: 'Balanced', icon: 'balance', description: '3-4 activities with breaks in between' },
          { value: 'packed', label: 'Packed', icon: 'bolt', description: '5+ activities, see everything!' }
        ]
      }
    ]
  },
  {
    id: 'transport',
    title: 'How will you get around?',
    subtitle: 'Choose your preferred way to travel between places',
    icon: 'commute',
    fields: [{
      key: 'transportPreference',
      type: 'card-select',
      label: 'Transport Preference',
      options: [
        { value: 'own_vehicle', label: 'Own Vehicle', icon: 'directions_car', description: 'Driving your own car or motorcycle' },
        { value: 'rental', label: 'Rental Car', icon: 'car_rental', description: 'Renting a car at the destination' },
        { value: 'public_transport', label: 'Public Transport', icon: 'directions_bus', description: 'Buses, trains, metro, local transit' },
        { value: 'walking_cycling', label: 'Walk & Cycle', icon: 'directions_walk', description: 'On foot and by bicycle' },
        { value: 'mix', label: 'Mix (AI Decides)', icon: 'auto_awesome', description: 'Let AI pick the best mode for each leg' }
      ]
    }]
  },
  {
    id: 'details',
    title: 'Name your trip',
    subtitle: 'Give your adventure a title',
    icon: 'edit_note',
    fields: [
      {
        key: 'title',
        type: 'text',
        label: 'Trip Title',
        placeholder: 'e.g. Summer in Tokyo',
        icon: 'title'
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Tell us about your trip...',
        icon: 'description',
        hint: 'A brief description of your trip'
      }
    ]
  },
  {
    id: 'final',
    title: 'Final touches',
    subtitle: 'Add a cover image and choose your options',
    icon: 'tune',
    fields: [
      {
        key: 'coverImage',
        type: 'image-url',
        label: 'Cover Image URL',
        placeholder: 'https://example.com/image.jpg',
        icon: 'image'
      },
      {
        key: 'isPublic',
        type: 'toggle',
        label: 'Public Trip',
        hint: 'Others can discover and view your trip'
      },
      {
        key: 'useAI',
        type: 'toggle',
        label: 'Generate itinerary with AI',
        hint: 'Let AI create a detailed day-by-day itinerary for your trip'
      }
    ]
  }
];
