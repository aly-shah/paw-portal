
import { ServiceProvider, ServiceType, Product, Event, Pet, BreedTrait, Post, UserRole, JobListing, PetListing, PostType, Connection } from './types';

export const APP_NAME = "PawPortal";

export const PET_TAXONOMY = [
    { id: 'DOG', label: 'Dog', localLabel: 'Kutta', icon: 'Dog', breeds: ['German Shepherd', 'Labrador', 'Poodle', 'Bulldog', 'Golden Retriever', 'Local Mix'], dynamicFields: [] },
    { id: 'CAT', label: 'Cat', localLabel: 'Billi', icon: 'Cat', breeds: ['Persian', 'Siamese', 'Maine Coon', 'Stray Mix'], dynamicFields: [] },
    { id: 'BIRD', label: 'Bird', localLabel: 'Parinda', icon: 'Bird', breeds: ['Parrot', 'Sparrow', 'Pigeon'], dynamicFields: [] },
    { id: 'RABBIT', label: 'Rabbit', localLabel: 'Khargosh', icon: 'Rabbit', breeds: ['Angora', 'Dutch', 'Lionhead'], dynamicFields: [] },
    { id: 'FISH', label: 'Fish', localLabel: 'Machli', icon: 'Fish', breeds: ['Goldfish', 'Betta', 'Guppy'], dynamicFields: [{ key: 'tankSize', label: 'Tank Size (L)', type: 'number' }] },
];

export const PET_PERSONALITY_TRAITS: Record<string, string[]> = {
    'Dog': ['Friendly', 'Energetic', 'Calm', 'Protective', 'Playful', 'Anxious', 'Vocal'],
    'Cat': ['Independent', 'Cuddly', 'Vocal', 'Lazy', 'Hunter', 'Playful'],
    'default': ['Friendly', 'Shy', 'Active']
};

export const PET_FAVORITES_SUGGESTIONS: Record<string, string[]> = {
    'Dog': ['Bone', 'Ball', 'Frisbee', 'Chicken', 'Squeaky Toy', 'Car Rides'],
    'Cat': ['Laser Pointer', 'Cardboard Box', 'Catnip', 'Tuna', 'Feather Wand'],
    'default': ['Treats', 'Toys']
};

export const BREED_TRAIT_DATABASE: Record<string, BreedTrait> = {
    'German Shepherd': {
        id: 'bt1',
        breed: 'German Shepherd',
        healthRisks: ['Hip Dysplasia', 'Bloat', 'Elbow Dysplasia'],
        behavioralTraits: ['Intelligent', 'Protective', 'Active', 'Loyal'],
        careTips: ['Regular exercise is crucial', 'Weekly brushing', 'Early socialization'],
        recommendedProducts: ['Joint Supplements', 'Durable Chew Toys', 'Puzzle Feeder']
    },
    'Persian': {
        id: 'bt2',
        breed: 'Persian',
        healthRisks: ['Kidney Disease', 'Respiratory Issues', 'Eye Conditions'],
        behavioralTraits: ['Quiet', 'Gentle', 'Affectionate', 'Sedentary'],
        careTips: ['Daily grooming for coat', 'Indoor living preferred', 'Eye cleaning'],
        recommendedProducts: ['Grooming Brush', 'Hairball Control Food', 'Ceramic Bowl']
    },
    'Labrador': {
        id: 'bt3',
        breed: 'Labrador',
        healthRisks: ['Obesity', 'Joint Issues', 'Ear Infections'],
        behavioralTraits: ['Friendly', 'High Energy', 'Food Motivated', 'Water Lover'],
        careTips: ['Watch diet closely', 'Needs play time', 'Regular ear cleaning'],
        recommendedProducts: ['Slow Feeder', 'Fetch Toys', 'Ear Wipes']
    },
    'Siamese': {
        id: 'bt4',
        breed: 'Siamese',
        healthRisks: ['Dental Disease', 'Respiratory Issues'],
        behavioralTraits: ['Vocal', 'Social', 'Intelligent', 'Demanding'],
        careTips: ['Needs interaction', 'Puzzle toys', 'Teeth brushing'],
        recommendedProducts: ['Interactive Toys', 'Dental Treats']
    },
    'Bulldog': {
        id: 'bt5',
        breed: 'Bulldog',
        healthRisks: ['Breathing Issues', 'Skin Infections', 'Overheating'],
        behavioralTraits: ['Calm', 'Stubborn', 'Friendly'],
        careTips: ['Keep cool', 'Clean skin folds', 'Moderate exercise'],
        recommendedProducts: ['Cooling Mat', 'Skin Wipes', 'Harness']
    }
};

export const MOCK_PETS: Pet[] = [
    {
        id: 'p1',
        name: 'Barnaby',
        type: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 28,
        image: 'https://picsum.photos/id/237/200/200',
        gender: 'Male',
        color: 'Amber',
        microchip: '981020023456789',
        neutered: true,
        dietaryNotes: 'Grain-free diet preferred',
        personality: {
            energyLevel: 'High',
            trainability: 'Easy',
            tags: ['Friendly', 'Playful']
        },
        dynamicDetails: {
            favorites: ['Tennis Ball', 'Swimming']
        },
        owner: { id: 'u1', name: 'Jane Doe' }, // Added ID
        history: [],
        savedMatches: [],
        isPublic: true
    },
    {
        id: 'p2',
        name: 'Luna',
        type: 'Cat',
        breed: 'Siamese',
        age: 2,
        weight: 4,
        image: 'https://picsum.photos/id/1074/200/200',
        gender: 'Female',
        color: 'Blue',
        microchip: '981020098765432',
        neutered: true,
        personality: {
            energyLevel: 'Medium',
            trainability: 'Moderate',
            tags: ['Vocal', 'Independent']
        },
        dynamicDetails: {
            favorites: ['Feather Wand']
        },
        owner: { id: 'u2', name: 'Ali Khan' }, // Added ID
        history: [],
        savedMatches: [],
        isPublic: true
    },
    {
        id: 'p3',
        name: 'Rocky',
        type: 'Dog',
        breed: 'Bulldog',
        age: 4,
        weight: 22,
        image: 'https://picsum.photos/id/1062/200/200',
        gender: 'Male',
        color: 'Fawn',
        personality: {
            energyLevel: 'Low',
            trainability: 'Stubborn',
            tags: ['Calm', 'Stubborn', 'Friendly']
        },
        dynamicDetails: {
            favorites: ['Sleeping', 'Chew Toys']
        },
        owner: { id: 'u3', name: 'Bilal R.' }, // Added ID
        history: [],
        isPublic: true
    },
    {
        id: 'p4',
        name: 'Coco',
        type: 'Dog',
        breed: 'Poodle',
        age: 1,
        weight: 8,
        image: 'https://picsum.photos/id/1025/200/200',
        gender: 'Female',
        color: 'White',
        personality: {
            energyLevel: 'High',
            trainability: 'Easy',
            tags: ['Intelligent', 'Active']
        },
        dynamicDetails: {
            favorites: ['Agility', 'Frisbee']
        },
        owner: { id: 'u4', name: 'Zara M.' }, // Added ID
        history: [],
        isPublic: true
    }
];

export const MOCK_CONNECTIONS: Connection[] = [
    {
        id: 'c1',
        requesterId: 'u2',
        receiverId: 'me',
        status: 'PENDING',
        timestamp: '2 hours ago',
        // In pending state (incoming), this shows WHO is requesting (Ali's Pet Luna)
        pet: { 
            id: 'p2', 
            name: 'Luna', 
            image: 'https://picsum.photos/id/1074/100/100', 
            breed: 'Siamese', 
            type: 'Cat' 
        }
    },
    {
        id: 'c2',
        requesterId: 'me',
        receiverId: 'u3',
        status: 'CONNECTED',
        timestamp: 'Yesterday',
        // In connected state, this shows WHO I am connected to (Bilal's Pet Rocky)
        pet: { 
            id: 'p3', 
            name: 'Rocky', 
            image: 'https://picsum.photos/id/1062/100/100', 
            breed: 'Bulldog', 
            type: 'Dog' 
        }
    }
];

export const MOCK_SERVICES: ServiceProvider[] = [
    {
        id: 's1',
        name: 'Dr. Sarah Jenkins',
        type: ServiceType.VET_HOME,
        rating: 4.9,
        reviews: 124,
        image: 'https://picsum.photos/id/1011/300/300',
        location: 'DHA Phase 6',
        priceRange: 'PKR 1500-3000',
        description: 'Experienced veterinarian offering home visits for routine checkups and minor emergencies.',
        available: true,
        coordinates: { x: 20, y: 30 },
        distance: '2.5 km',
        specialties: ['General Practice', 'Dermatology'],
        isEmergency: false,
        services: [
            { id: 'sv1', name: 'Consultation', price: 1500, duration: '30 min' },
            { id: 'sv2', name: 'Vaccination', price: 2500, duration: '15 min' }
        ]
    },
    {
        id: 's2',
        name: 'Paws & Strides',
        type: ServiceType.WALKER,
        rating: 4.8,
        reviews: 56,
        image: 'https://picsum.photos/id/1025/300/300',
        location: 'Clifton Block 4',
        priceRange: 'PKR 800/walk',
        description: 'Professional dog walking service. We love your pets like our own.',
        available: true,
        coordinates: { x: 60, y: 50 },
        distance: '1.2 km',
        specialties: ['Large Breeds', 'Puppy Training'],
        isEmergency: false,
        services: [
            { id: 'sv3', name: '30 Min Walk', price: 800, duration: '30 min' },
            { id: 'sv4', name: '60 Min Walk', price: 1400, duration: '60 min' }
        ]
    },
    {
        id: 's3',
        name: 'Downtown Pet Clinic',
        type: ServiceType.CLINIC,
        rating: 4.7,
        reviews: 310,
        image: 'https://picsum.photos/id/1062/300/300',
        location: 'Saddar',
        priceRange: 'PKR 1000+',
        description: 'Full service veterinary clinic with emergency care.',
        available: true,
        coordinates: { x: 80, y: 20 },
        distance: '5.0 km',
        specialties: ['Surgery', 'Emergency', 'Dental'],
        isEmergency: true,
        services: [
            { id: 'sv5', name: 'ER Visit', price: 3000, duration: 'varies' },
            { id: 'sv6', name: 'Dental Cleaning', price: 5000, duration: '60 min' }
        ]
    }
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'pr1',
        name: 'Royal Canin Adult',
        category: 'Food',
        price: 4500,
        rating: 4.8,
        reviews: 450,
        image: 'https://picsum.photos/id/1080/300/300',
        vendor: 'PetMart',
        stock: 20,
        description: 'Premium dry food for adult dogs.'
    },
    {
        id: 'pr2',
        name: 'Rubber Chew Toy',
        category: 'Toy',
        price: 800,
        rating: 4.5,
        reviews: 120,
        image: 'https://picsum.photos/id/1081/300/300',
        vendor: 'ToyLand',
        stock: 50,
        description: 'Durable rubber toy for aggressive chewers.'
    },
    {
        id: 'pr3',
        name: 'Flea & Tick Collar',
        category: 'Health',
        price: 1200,
        rating: 4.2,
        reviews: 89,
        image: 'https://picsum.photos/id/1082/300/300',
        vendor: 'VetMeds',
        stock: 15,
        description: 'Protects against fleas and ticks for up to 8 months.'
    }
];

export const MOCK_EVENTS: Event[] = [
    {
        id: 'ev1',
        title: 'Sunday Park Meetup',
        date: 'Oct 30 10:00 AM',
        time: '10:00 AM',
        location: 'F-9 Park',
        attendees: 24,
        image: 'https://picsum.photos/id/1083/300/200',
        description: 'Bring your dogs for a fun morning run.',
        category: 'Meetup',
        organizer: { name: 'Local Dog Club', role: 'Community', avatar: 'https://picsum.photos/id/60/50/50' }
    },
    {
        id: 'ev2',
        title: 'Puppy Training Workshop',
        date: 'Nov 05 02:00 PM',
        time: '02:00 PM',
        location: 'Community Center',
        attendees: 15,
        image: 'https://picsum.photos/id/1084/300/200',
        description: 'Learn basics of puppy training with certified trainer.',
        category: 'Workshop',
        organizer: { name: 'Paws Academy', role: 'Trainer', avatar: 'https://picsum.photos/id/61/50/50' }
    }
];

export const MOCK_PATIENTS_DETAILED = [
    {
        id: 'p1',
        name: 'Barnaby',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'Male',
        weight: 28,
        image: 'https://picsum.photos/id/237/200/200',
        owner: { id: 'u1', name: 'Jane Doe', phone: '0300-1234567', email: 'jane@example.com', address: 'DHA Ph 6' },
        lastVisit: '2023-10-15',
        vitals: { weight: '28 kg', temp: '38.5 C', heartRate: '80 bpm' },
        history: [
            { date: '2023-10-15', type: 'Vaccination', notes: 'Annual boosters given.', treatment: 'Rabies, DHPP' },
            { date: '2023-05-20', type: 'Checkup', notes: 'Mild ear infection.', treatment: 'Ear drops' }
        ],
        type: 'Dog',
        color: 'Amber',
        microchip: '981020023456789',
        neutered: true,
        dietaryNotes: 'Grain-free',
        personality: { tags: ['Friendly', 'Playful'] },
        dynamicDetails: { favorites: ['Ball'] },
        isPublic: true
    },
    {
        id: 'p2',
        name: 'Luna',
        breed: 'Siamese',
        age: 2,
        gender: 'Female',
        weight: 4,
        image: 'https://picsum.photos/id/1074/200/200',
        owner: { id: 'u2', name: 'Ali Khan', phone: '0321-9876543', email: 'ali@example.com', address: 'Clifton' },
        lastVisit: '2023-09-10',
        vitals: { weight: '4 kg', temp: '38.2 C', heartRate: '120 bpm' },
        history: [
            { date: '2023-09-10', type: 'Checkup', notes: 'Healthy checkup.', treatment: 'None' }
        ],
        type: 'Cat',
        color: 'Cream',
        microchip: '981020012345678',
        neutered: true,
        dietaryNotes: '',
        personality: { tags: ['Vocal'] },
        dynamicDetails: { favorites: ['Feather'] },
        isPublic: true
    }
];

export const MOCK_APPOINTMENTS = [
    { id: 'apt1', date: '2024-10-26', time: '09:00', patientId: 'p1', type: 'Checkup' },
    { id: 'apt2', date: '2024-10-26', time: '10:00', patientId: 'p2', type: 'Vaccination' },
    { id: 'apt3', date: '2024-10-26', time: '14:00', patientId: 'p1', type: 'Follow-up' }
];

export const MOCK_CARE_TEAM = [
    { id: 'ct1', name: 'Dr. Sarah', role: 'Veterinarian', image: 'https://picsum.photos/id/1011/100/100' },
    { id: 'ct2', name: 'Alex', role: 'Dog Walker', image: 'https://picsum.photos/id/1025/100/100' }
];

export const MOCK_OWNER_ALERTS = [
    { id: 'a1', type: 'medical', text: 'Barnaby vaccination due', time: 'Tomorrow', action: 'View' },
    { id: 'a2', type: 'logistics', text: 'Food delivery arriving', time: '2:00 PM', action: 'Track' }
];

export const MOCK_MY_JOBS: JobListing[] = [
    {
        id: 'mj1',
        type: 'Dog Walking',
        petId: 'p1',
        petName: 'Barnaby',
        petBreed: 'Golden Retriever',
        petImage: 'https://picsum.photos/id/237/100/100',
        date: 'Mon, Oct 30',
        time: '08:00 AM',
        duration: '30 min',
        pay: 800,
        status: 'OPEN',
        applicants: [],
        location: 'DHA Ph 6',
        requirements: ['Strong Walker']
    }
];

export const MOCK_FEED: Post[] = [
    {
        id: 'po1',
        author: { id: 'u1', name: 'Dr. Sarah', role: UserRole.VET, avatar: 'https://picsum.photos/id/1011/100/100', verified: true },
        type: 'TIP',
        content: 'Summer is here! Keep your pets hydrated and avoid walking them on hot pavement.',
        timestamp: '2 hours ago',
        likes: 45,
        comments: []
    },
    {
        id: 'po2',
        author: { id: 'u2', name: 'PetMart', role: UserRole.VENDOR, avatar: 'https://picsum.photos/id/1062/100/100', verified: true },
        type: 'PROMOTION',
        content: 'Flash Sale on all cooling mats! 20% off this weekend.',
        timestamp: '5 hours ago',
        likes: 12,
        comments: [],
        image: 'https://picsum.photos/id/1080/400/300',
        price: 2500,
        actionLabel: 'Shop Deal'
    }
];

export const MOCK_ADOPTION_LISTINGS: PetListing[] = [
    {
        id: 'al1',
        petId: 'np1',
        type: 'ADOPTION',
        price: 5000,
        title: 'Loving Tabby needs home',
        description: 'Moving abroad, need a loving home for Mimi.',
        reason: 'Relocation',
        images: ['https://picsum.photos/id/40/300/300'],
        status: 'AVAILABLE',
        owner: { id: 'u3', name: 'Ahmed', avatar: 'https://picsum.photos/id/65/100/100', location: 'Gulberg', verified: true },
        stats: { views: 120, saves: 5 },
        petDetails: { breed: 'Tabby', age: 2 }
    }
];

export const AVAILABLE_JOBS = [
    { 
        id: 'j1', 
        type: 'Dog Walking', 
        pet: 'Bruno', 
        breed: 'German Shepherd', 
        distance: '0.8 km', 
        time: 'Today, 5:00 PM', 
        duration: '45 min', 
        pay: 1200, 
        urgent: true, 
        image: 'https://picsum.photos/id/237/300/300',
        owner: { name: 'Sarah J.', rating: 4.9, avatar: 'https://picsum.photos/id/64/100/100', verified: true },
        description: "Bruno is a high-energy shepherd who loves to run. I need someone who can keep up with him! Please stick to the park trails.",
        requirements: ['Experience with large dogs', 'Active walker'],
        location: 'Central Park, Sector F-9',
        coordinates: { x: 30, y: 40 }
    },
    { 
        id: 'j2', 
        type: 'Pet Sitting', 
        pet: 'Mimi', 
        breed: 'Persian Cat', 
        distance: '2.1 km', 
        time: 'Tomorrow, 9:00 AM', 
        duration: '4 hrs', 
        pay: 3000, 
        urgent: false, 
        image: 'https://picsum.photos/id/1074/300/300',
        owner: { name: 'Ali K.', rating: 4.7, avatar: 'https://picsum.photos/id/65/100/100', verified: true },
        description: "Mimi just needs company while I'm at work. She mostly sleeps but needs feeding at 11 AM.",
        requirements: ['Cat friendly', 'Quiet presence'],
        location: 'Bahria Town Phase 4',
        coordinates: { x: 60, y: 20 }
    },
    { 
        id: 'j3', 
        type: 'Dog Walking', 
        pet: 'Coco', 
        breed: 'Poodle', 
        distance: '1.5 km', 
        time: 'Wed, 7:00 AM', 
        duration: '30 min', 
        pay: 800, 
        urgent: false, 
        image: 'https://picsum.photos/id/1025/300/300',
        owner: { name: 'Zara M.', rating: 5.0, avatar: 'https://picsum.photos/id/66/100/100', verified: false },
        description: "Coco is a senior dog, so a slow, gentle walk around the block is perfect.",
        requirements: ['Patient', 'Senior dog experience'],
        location: 'DHA Phase 6',
        coordinates: { x: 45, y: 60 }
    },
    { 
        id: 'j4', 
        type: 'House Visit', 
        pet: 'Rocky', 
        breed: 'Bulldog', 
        distance: '5.0 km', 
        time: 'Thu, 12:00 PM', 
        duration: '1 hr', 
        pay: 1500, 
        urgent: true, 
        image: 'https://picsum.photos/id/1062/300/300',
        owner: { name: 'Bilal R.', rating: 4.8, avatar: 'https://picsum.photos/id/67/100/100', verified: true },
        description: "Just need someone to let Rocky out in the yard and refill his water bowl.",
        requirements: ['Reliable', 'Short notice ok'],
        location: 'Blue Area',
        coordinates: { x: 70, y: 50 }
    },
    { 
        id: 'j5', 
        type: 'Boarding', 
        pet: 'Luna', 
        breed: 'Labrador', 
        distance: '12.0 km', 
        time: 'Fri - Sun', 
        duration: '3 Days', 
        pay: 8000, 
        urgent: false, 
        image: 'https://picsum.photos/id/238/300/300',
        owner: { name: 'Omer F.', rating: 4.9, avatar: 'https://picsum.photos/id/68/100/100', verified: true },
        description: "Going out of town for the weekend. Luna needs a loving home to stay in.",
        requirements: ['Fenced Yard', 'No other pets preferred'],
        location: 'Clifton Block 2',
        coordinates: { x: 20, y: 70 }
    },
    // --- New Vet Specific Jobs ---
    { 
        id: 'j6', 
        type: 'Vet Visit', 
        pet: 'Max', 
        breed: 'Golden Retriever', 
        distance: '3.5 km', 
        time: 'Tomorrow, 2:00 PM', 
        duration: '1 hr', 
        pay: 5000, 
        urgent: true, 
        image: 'https://picsum.photos/id/1025/300/300',
        owner: { name: 'Fatima S.', rating: 5.0, avatar: 'https://picsum.photos/id/69/100/100', verified: true },
        description: "Max has a limp on hind leg. Need assessment.",
        requirements: ['Licensed Vet', 'Mobile Equipment'],
        location: 'DHA Phase 8',
        coordinates: { x: 55, y: 35 }
    },
    { 
        id: 'j7', 
        type: 'Vet Visit', 
        pet: 'Oreo', 
        breed: 'Cat', 
        distance: '1.2 km', 
        time: 'Today, ASAP', 
        duration: '30 min', 
        pay: 3500, 
        urgent: true, 
        image: 'https://picsum.photos/id/1074/300/300',
        owner: { name: 'Kamran A.', rating: 4.5, avatar: 'https://picsum.photos/id/70/100/100', verified: true },
        description: "Minor wound cleaning needed.",
        requirements: ['Cat Specialist', 'First Aid'],
        location: 'Gulberg',
        coordinates: { x: 40, y: 55 }
    }
];
