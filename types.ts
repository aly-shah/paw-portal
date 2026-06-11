
export enum ServiceType {
  VET_HOME = 'VET_HOME',
  CLINIC = 'CLINIC',
  WALKER = 'WALKER'
}

export enum UserRole {
  OWNER = 'OWNER',
  VET = 'VET',
  CLINIC = 'CLINIC',
  VENDOR = 'VENDOR',
  CARE_GIVER = 'CARE_GIVER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type ConnectionStatus = 'PENDING' | 'CONNECTED' | 'REJECTED';

export interface Connection {
    id: string;
    requesterId: string;
    receiverId: string;
    status: ConnectionStatus;
    timestamp: string;
    // Display context is now the Pet, not the User
    pet: { 
        id: string;
        name: string;
        image: string;
        breed: string;
        type: string;
    }; 
}

export interface ServiceItem {
    id: string;
    name: string;
    price: number;
    duration: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: ServiceType;
  rating: number;
  reviews: number;
  image: string;
  location: string;
  priceRange?: string;
  description: string;
  available?: boolean;
  // New Fields
  coordinates?: { x: number; y: number }; // Percentages for mock map
  distance?: string;
  specialties?: string[];
  isEmergency?: boolean;
  services: ServiceItem[]; // Now required
}

export interface Product {
  id: string;
  name: string;
  category: 'Food' | 'Toy' | 'Accessory' | 'Health' | 'Grooming';
  price: number;
  salePrice?: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  vendor: string;
  brand?: string;
  description?: string;
  stock: number;
  weight?: number;
  tags?: string[];
  // Vendor Specific
  sku?: string;
  costPrice?: number;
  status?: 'Active' | 'Draft' | 'Archived';
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  image: string;
  description: string;
  category: 'Meetup' | 'Workshop' | 'Walk' | 'Competition';
  organizer: {
      name: string;
      role: string;
      avatar: string;
  };
  isAttending?: boolean;
}

export type PostType = 'GENERAL' | 'TIP' | 'PROMOTION' | 'ALERT' | 'SERVICE';

export interface Comment {
    id: string;
    user: string;
    avatar: string;
    text: string;
    timestamp: string;
}

export interface Post {
    id: string;
    author: {
        id: string;
        name: string;
        role: UserRole;
        avatar: string;
        verified?: boolean;
    };
    type: PostType;
    content: string;
    image?: string;
    timestamp: string;
    likes: number;
    comments: Comment[];
    isLiked?: boolean;
    // Commerce / Action Fields
    price?: number;
    actionLabel?: string; // e.g., "Shop Now", "Book Visit"
    actionLink?: string;
}

export interface MatchInsight {
    providerId: string;
    timestamp: number;
    insight: string;
    questions: string[];
    compatibilityScore: number; // 0-100
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number; // years
  weight: number; // kg
  image: string;
  // New cultural/dynamic fields
  gender?: 'Male' | 'Female';
  dynamicDetails?: Record<string, any>;
  owner?: any; // For extended patient view
  lastVisit?: string;
  vitals?: any;
  history?: any[];
  isPublic?: boolean; // New field for privacy setting
  // Phase 2: Genetics
  lineage?: Lineage;
  // Extended Profile
  color?: string;
  microchip?: string;
  neutered?: boolean;
  dietaryNotes?: string;
  // Personality & Behavior
  personality?: {
      energyLevel: 'Low' | 'Medium' | 'High';
      trainability: 'Easy' | 'Moderate' | 'Stubborn';
      tags: string[]; // e.g. "Friendly", "Anxious", "Vocal"
  };
  savedMatches?: MatchInsight[]; // Cache for AI insights
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// --- GENETIC ENGINE TYPES ---

export interface ParentDetails {
    type: 'PUREBRED' | 'MIXED' | 'UNKNOWN';
    breedName?: string; // If purebred
    visualGuess?: string; // If unknown
    knownProfileId?: string; // If linking to existing pet
    name?: string;
}

export interface Lineage {
    sire: ParentDetails;
    dam: ParentDetails;
    confidenceScore: number; // 0 to 100
}

export interface BreedTrait {
    id: string;
    breed: string;
    healthRisks: string[];
    behavioralTraits: string[];
    careTips: string[];
    recommendedProducts: string[]; // Categories like "Slow Feeder", "Puzzle Toy"
}

export interface GeneticProfile {
    predictedHealth: { risk: string; advice: string }[];
    predictedBehavior: { trait: string; advice: string }[];
    carePlan: string[];
    productMatches: string[];
}

// --- WALKER TYPES ---

export interface GeoPoint {
    x: number; // 0-100 relative to map container width
    y: number; // 0-100 relative to map container height
}

export interface WalkEvent {
    id: string;
    type: 'PEE' | 'POOP' | 'PHOTO' | 'WATER';
    timestamp: string;
    location: GeoPoint;
    photoUrl?: string;
}

export interface WalkSession {
    id: string;
    petName: string;
    startTime: number;
    endTime?: number;
    durationSeconds: number;
    distanceKm: number;
    route: GeoPoint[];
    events: WalkEvent[];
    notes?: string;
}

// --- JOB LISTING TYPES (OWNER POSTED) ---
export interface JobApplicant {
    id: string;
    caregiverId: string;
    name: string;
    avatar: string;
    rating: number;
    message: string;
    appliedAt: string;
}

export interface JobListing {
    id: string;
    type: 'Dog Walking' | 'Pet Sitting' | 'House Visit' | 'Boarding' | 'Grooming' | 'Vet Visit';
    petId: string;
    petName: string;
    petBreed: string;
    petImage: string;
    date: string; // Display string e.g. "Every Mon/Wed" or "Oct 24"
    time: string;
    duration: string;
    pay: number;
    status: 'OPEN' | 'FILLED' | 'CANCELLED';
    applicants: JobApplicant[];
    location: string;
    requirements?: string[];
    schedule?: {
        startDate: string;
        startTime: string;
        recurring?: boolean;
    };
}

// --- ADOPTION TYPES ---
export interface PetListing {
    id: string;
    petId: string;
    type: 'ADOPTION' | 'SALE';
    price: number;
    title: string;
    description: string;
    reason: string;
    images: string[];
    status: 'AVAILABLE' | 'PENDING' | 'SOLD';
    owner: {
        id: string;
        name: string;
        avatar: string;
        verified?: boolean;
        location: string;
    };
    stats: {
        views: number;
        saves: number;
    };
    petDetails: Partial<Pet>;
}

// ============================================================
// NEW FEATURES — data models
// ============================================================

// --- PawTag: Lost & Found ---
export type SafetyState = 'SAFE' | 'LOST' | 'FOUND_PENDING';

export interface PetSafetyStatus {
    petId: string;
    state: SafetyState;
    lastSeen?: GeoPoint;
    lastSeenAddress?: string;
    radiusKm?: number;
    note?: string;
    reward?: number;
    updatedAt: string;
}

export interface FoundReport {
    id: string;
    petId?: string;            // resolved if scanned via a PawTag
    finderName: string;
    finderContact: string;
    location?: GeoPoint;
    locationNote?: string;
    photo?: string;
    message?: string;
    timestamp: string;
}

// --- Pet Health Hub ---
export type HealthEventType = 'VACCINE' | 'MEDICATION' | 'VISIT' | 'WEIGHT' | 'NOTE' | 'SCAN';

export interface HealthRecord {
    id: string;
    petId: string;
    type: HealthEventType;
    title: string;
    date: string;
    notes?: string;
    vetName?: string;
    attachmentUrl?: string;
}

export type Recurrence = 'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Reminder {
    id: string;
    petId: string;
    title: string;
    category: 'VACCINE' | 'MEDICATION' | 'CHECKUP' | 'GROOMING' | 'OTHER';
    dueDate: string;
    recurrence: Recurrence;
    relatedProductId?: string;   // deep-link to a Marketplace refill
    done: boolean;
}

export interface CarePlanTask {
    title: string;
    dueInDays: number;
    category: string;
}

export interface CarePlan {
    summary: string;
    tasks: CarePlanTask[];
}

// --- PawScan (AI visual health scan) ---
export interface PawScanResult {
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    observations: string[];
    possibleCauses: string[];
    recommendation: string;
    disclaimer: string;
}

// --- Unified Booking & Telehealth ---
export interface AvailabilitySlot {
    id: string;
    providerId: string;
    providerName: string;
    providerImage?: string;
    serviceType: ServiceType;
    start: string;     // ISO datetime
    durationMin: number;
    priceCents: number;
    mode: 'IN_PERSON' | 'TELEHEALTH';
    isBooked: boolean;
}

export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
    id: string;
    petId: string;
    petName: string;
    providerId: string;
    providerName: string;
    slotId: string;
    start: string;
    durationMin: number;
    mode: 'IN_PERSON' | 'TELEHEALTH';
    status: AppointmentStatus;
    priceCents: number;
    reason?: string;
}

// --- Paw Points (gamified wellness & loyalty) ---
export type PointReason = 'WALK' | 'REMINDER' | 'APPOINTMENT' | 'REDEEM' | 'REFERRAL' | 'SCAN';

export interface PawPointsEntry {
    id: string;
    delta: number;
    reason: PointReason;
    label: string;
    timestamp: string;
}

export interface PawBadge {
    id: string;
    name: string;
    icon: string;       // emoji
    description: string;
    earned: boolean;
}

export interface Reward {
    id: string;
    title: string;
    description: string;
    costPoints: number;
    icon: string;
    vendorName?: string;
}

export interface LeaderboardEntry {
    rank: number;
    petName: string;
    petImage: string;
    ownerName: string;
    points: number;
    isCurrentUser?: boolean;
}
