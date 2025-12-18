
export enum UserRole {
  FARMER = 'FARMER',
  WHOLESALER = 'WHOLESALER',
  CONSUMER = 'CONSUMER',
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  PZ_REP = 'PZ_REP'
}

export interface BusinessProfile {
  // Company Info
  companyName: string;
  tradingName: string;
  abn: string;
  businessLocation: string;
  directorName: string;
  businessMobile: string;
  email: string;
  
  // Accounts Info
  accountsEmail: string;
  accountsMobile: string;
  
  // Operations
  tradingDaysHours: string;
  productsSold: string;
  
  // Logistics Logic
  hasLogistics: boolean | null; // Yes or No
  // If Has Logistics = Yes
  deliversStatewide?: boolean;
  deliveryDistanceKm?: string;
  deliversInterstate?: boolean;
  // If Has Logistics = No
  logisticPartner1?: string;
  logisticPartner2?: string;
  logisticPartner3?: string;
  
  // Banking
  bankName: string;
  bsb: string;
  accountNumber: string;
  
  // Commercial Terms
  agreeTo14DayTerms: boolean;
  agreeTo20PercentDiscount: boolean | null; // Yes or No
  alternativeDiscount?: string; // If No to above
  
  // Legal
  acceptedTandCs: boolean;
  isComplete: boolean;
}

export interface User {
  id: string;
  name: string;
  businessName: string;
  role: UserRole;
  email: string;
  dashboardVersion?: 'v1' | 'v2'; // Preference for dashboard version
  // V1 Seller Onboarding Fields
  paymentTerms?: '14 Days' | '30 Days';
  acceptFastPay?: boolean; // 15% discount for 24h payment
  bankDetails?: {
    accountName: string;
    bsb: string;
    accountNumber: string;
  };
  // Detailed Business Profile (New Onboarding)
  businessProfile?: BusinessProfile;
  
  // Network Map Interests
  activeSellingInterests?: string[];
  activeBuyingInterests?: string[];
  // Rep Fields
  commissionRate?: number; // Percentage, e.g. 5.0 for 5%
}

export interface RegistrationRequest {
  id: string;
  name: string;
  businessName: string;
  email: string;
  requestedRole: UserRole;
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  details?: string;
  // Specific data for Consumers/Leads
  consumerData?: {
    mobile: string;
    location: string;
    weeklySpend: number;
    orderFrequency: string;
    // Enhanced Onboarding Data
    abn?: string;
    deliveryAddress?: string;
    deliveryInstructions?: string;
    productsList?: string;
    deliveryDays?: string[];
    deliveryTimeSlot?: string;
    chefName?: string;
    chefEmail?: string;
    chefMobile?: string;
    accountsEmail?: string;
    accountsMobile?: string;
    want55DayTerms?: boolean;
    invoiceFile?: string; // Base64 encoded invoice
  };
}

export interface Driver {
  id: string;
  wholesalerId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleRegistration: string;
  vehicleType: 'Van' | 'Truck' | 'Refrigerated Truck';
  status: 'Active' | 'Inactive';
}

export interface Packer {
  id: string;
  wholesalerId: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Product {
  id: string;
  name: string;
  category: 'Vegetable' | 'Fruit';
  variety: string;
  imageUrl: string;
  defaultPricePerKg: number;
  industryPrice?: number;
  co2SavingsPerKg?: number; // AI calculated sustainability metric
}

export interface InventoryItem {
  id: string;
  productId: string;
  ownerId: string;
  quantityKg: number;
  expiryDate: string; // ISO date string
  harvestDate: string;
  status: 'Available' | 'Sold' | 'Expired' | 'Pending Approval' | 'Rejected' | 'Donated';
  // Traceability fields
  originalFarmerName?: string;
  harvestLocation?: string;
  receivedDate?: string;
  notes?: string;
  discountAfterDays?: number; // V1 feature
  batchImageUrl?: string; // Specific image for this batch
}

export interface OrderIssue {
  type: 'Quality' | 'Damage' | 'Missing Item' | 'Wrong Item';
  description: string;
  photoUrl?: string; // URL to the evidence photo
  reportedAt: string; // ISO Date
  deadline: string; // ISO Date - 60 min window
  requestedResolution: 'Replacement' | 'Refund' | 'Credit' | 'Delivery of Missing Items';
  requestedDeliveryDate?: string; // When they want the replacement/missing item
  requestedDeliveryTime?: string;
  status: 'Open' | 'Resolved' | 'Rejected';
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Ready for Delivery' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  logistics?: LogisticsDetails;
  acceptanceDeadline?: string; // ISO Date string for urgent orders
  customerNotes?: string; // Special instructions from customer
  issue?: OrderIssue; // Active product issue if any
  
  // Financials
  paymentStatus?: 'Paid' | 'Unpaid' | 'Overdue';
  paymentMethod?: 'pay_now' | 'invoice' | 'amex';
  
  // V1 Seller Workflow Fields
  packerId?: string;
  packerName?: string;
  packedAt?: string;
  deliveryDriverName?: string;
  deliveryPhotoUrl?: string;
  deliveredAt?: string;
}

export interface OrderItem {
  productId: string;
  quantityKg: number;
  pricePerKg: number;
  isPacked?: boolean;
}

export interface LogisticsDetails {
  method: 'PICKUP' | 'LOGISTICS';
  // Internal Fleet Assignment
  driverId?: string;
  driverName?: string;
  // External Partner (Legacy/Backup)
  partner?: 'Little Logistics' | 'Collins Transport' | 'LinFox';
  
  deliveryLocation?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  refrigeration?: boolean;
}

export type ConsumerConnectionStatus = 'Active' | 'Pending Connection' | 'Pricing Pending' | 'Pending PZ Approval' | 'Not Connected';

export type BusinessCategory = 'Cafe' | 'Restaurant' | 'Pub' | 'Food Manufacturer' | 'Retail';

export interface Customer {
  id: string;
  businessName: string;
  contactName: string;
  email?: string; // Added for display in table
  phone?: string;
  category: BusinessCategory | 'Unassigned' | 'Chain' | 'Retailer'; // Extended types
  joinedDate?: string;
  
  // Address & Location
  abn?: string;
  location?: string;
  deliveryAddress?: string;

  // Operational Profile
  weeklySpend?: number;
  orderFrequency?: string;
  deliveryTimeWindow?: string;
  commonProducts?: string; // Comma separated list or description

  // Key Contacts
  director?: { name: string; email: string; phone: string };
  accounts?: { name: string; email: string; phone: string };
  chef?: { name: string; email: string; phone: string };
  
  // Connection & Onboarding Status
  connectionStatus?: ConsumerConnectionStatus;
  connectedSupplierId?: string;
  connectedSupplierName?: string;
  connectedSupplierRole?: 'Wholesaler' | 'Farmer';
  pricingTier?: string; // e.g. "Tier 1", "Tier 2"
  pzMarkup?: number; // e.g. 15 for 15%
  pricingStatus?: 'Approved' | 'Pending' | 'Not Set' | 'Pending PZ Approval';
  
  // Support
  assignedPzRepId?: string;
  assignedPzRepName?: string; // The PZ Sales/Success Rep assigned to this relationship

  onboardingData?: {
    estimatedVolume: string;
    orderFrequency: 'Daily' | 'Weekly' | 'Ad-hoc';
    deliveryAddress: string;
    specialRequirements?: string;
  };
}

// V1 Lead Interface
export interface Lead {
  id: string;
  businessName: string;
  location: string;
  weeklySpend: number;
  deliveryTimePref: string;
  requestedProducts: {
    productId: string;
    productName: string;
    currentPrice: number; // The price they currently pay (target to beat)
  }[];
}

export interface MarketInsight {
  trend: 'Up' | 'Down' | 'Stable';
  percentage: number;
  description: string;
}

export interface PricingRule {
  id: string;
  ownerId: string;
  productId: string;
  category: BusinessCategory;
  strategy: 'FIXED' | 'PERCENTAGE_DISCOUNT';
  value: number; // If FIXED, it's the price. If PERCENTAGE, it's the discount % (e.g. 10 for 10% off).
  isActive: boolean;
}

export interface BuyerInterest {
  customerId: string;
  productName: string; // Generic name, e.g., "Eggplants"
  maxPrice?: number;
}

// --- FORM CUSTOMIZATION TYPES ---
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'checkbox' | 'date' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select type
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface OnboardingFormTemplate {
  role: UserRole;
  sections: FormSection[];
}

// --- SUPPLIER REQUEST TYPES ---
export interface SupplierPriceRequestItem {
  productId: string;
  productName: string;
  targetPrice: number; // Admin calculated 35% margin price
  offeredPrice?: number; // Supplier's counter or acceptance
}

export interface SupplierPriceRequest {
  id: string;
  supplierId: string; // Who receives it
  status: 'PENDING' | 'SUBMITTED' | 'WON' | 'LOST'; // SUBMITTED = Supplier sent quote back
  createdAt: string;
  customerContext: string; // e.g., "Pricing for new Cafe Chain" (Anonymized or Real Name)
  customerLocation: string; // Add location for identification
  items: SupplierPriceRequestItem[];
}
