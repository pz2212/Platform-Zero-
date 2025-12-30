
export enum UserRole {
  FARMER = 'FARMER',
  WHOLESALER = 'WHOLESALER',
  CONSUMER = 'CONSUMER',
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  PZ_REP = 'PZ_REP'
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'LEAD' | 'SYSTEM' | 'APPLICATION' | 'PRICE_REQUEST';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isProductLink?: boolean;
  productId?: string;
}

export interface BusinessProfile {
  isComplete: boolean;
  abn?: string;
  businessLocation?: string;
  companyName?: string;
  bankName?: string;
  bsb?: string;
  accountNumber?: string;
  directorName?: string;
  directorEmail?: string;
  directorPhone?: string;
  accountsName?: string;
  accountsEmail?: string;
  accountsPhone?: string;
  productsSell?: string;
  productsGrow?: string;
  productsBuy?: string;
  hasLogistics?: boolean;
  isPzAgent?: boolean;
}

export interface User {
  id: string;
  name: string;
  businessName: string;
  role: UserRole;
  email: string;
  phone?: string;
  category?: string;
  dashboardVersion?: 'v1' | 'v2';
  businessProfile?: BusinessProfile;
  activeSellingInterests?: string[];
  activeBuyingInterests?: string[];
  commissionRate?: number;
}

export type ProductUnit = 'KG' | 'Tray' | 'Bin' | 'Tonne' | 'loose' | 'Each' | 'Bag';

export interface Product {
  id: string;
  name: string;
  category: 'Vegetable' | 'Fruit';
  variety: string;
  imageUrl: string;
  defaultPricePerKg: number;
  unit?: ProductUnit;
  co2SavingsPerKg?: number;
}

export interface ParsedOrderItem {
    productName: string;
    quantity: number;
    unit: ProductUnit;
    isAmbiguous?: boolean;
    suggestedProductIds?: string[];
    selectedProductId?: string;
}

export interface InventoryItem {
  id: string;
  lotNumber: string; 
  productId: string;
  ownerId: string;
  quantityKg: number;
  unit?: ProductUnit;
  expiryDate: string;
  harvestDate: string;
  uploadedAt: string; 
  status: 'Available' | 'Sold' | 'Expired' | 'Pending Approval' | 'Rejected' | 'Donated';
  originalFarmerName?: string;
  harvestLocation?: string;
  warehouseLocation?: string; 
  discountAfterDays?: number;
  discountPricePerKg?: number;
  batchImageUrl?: string;
  lastPriceVerifiedDate?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  quantityKg: number;
  pricePerKg: number;
  isVerified?: boolean;
  hasIssue?: boolean;
  unit?: ProductUnit;
}

export interface OrderIssue {
  productId?: string;
  type: string;
  description: string;
  reportedAt: string;
  images?: string[];
  replacementRequired?: 'URGENT' | 'NEXT_DELIVERY' | 'NONE';
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Ready for Delivery' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  confirmedAt?: string;
  preparedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Overdue';
  paymentMethod?: 'pay_now' | 'invoice' | 'amex';
  priority?: 'STANDARD' | 'HIGH' | 'URGENT';
  packedAt?: string;
  logistics?: {
    driverName?: string;
    deliveryTime?: string;
    deliveryLocation?: string;
    deliveryDate?: string;
    vehicleDetails?: string;
    deliveryPhoto?: string;
    instructions?: string;
  };
  issue?: OrderIssue;
  itemIssues?: OrderIssue[];
  isFullyVerified?: boolean;
}

export interface Customer {
  id: string;
  businessName: string;
  contactName: string;
  email?: string;
  phone?: string;
  category: string;
  location?: string;
  connectedSupplierId?: string;
  connectedSupplierName?: string;
  connectedSupplierRole?: string;
  pzMarkup?: number;
  pricingStatus?: string;
  assignedPzRepId?: string;
  assignedPzRepName?: string;
  commonProducts?: string;
  connectionStatus?: 'Active' | 'Pending Connection' | 'Pricing Pending' | 'Lead';
  onboardingData?: {
    deliveryAddress?: string;
  };
}

export interface SupplierPriceRequestItem {
  productId: string;
  productName: string;
  targetPrice: number;
  offeredPrice?: number;
  isMatchingTarget?: boolean;
}

export interface SupplierPriceRequest {
  id: string;
  supplierId: string;
  status: 'PENDING' | 'SUBMITTED' | 'WON' | 'LOST';
  createdAt: string;
  customerContext: string;
  customerLocation: string;
  items: SupplierPriceRequestItem[];
}

export interface PricingRule {
  id: string;
  ownerId: string;
  productId: string;
  category: string;
  strategy: 'FIXED' | 'PERCENTAGE_DISCOUNT';
  value: number;
  isActive: boolean;
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

export interface LogisticsDetails {
  method: 'PICKUP' | 'LOGISTICS';
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryLocation?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox';
  required: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface OnboardingFormTemplate {
  id: string;
  role: UserRole;
  sections: FormSection[];
}

export interface RegistrationRequest {
  id: string;
  businessName: string;
  name: string;
  email: string;
  requestedRole: UserRole;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
  paymentTerms?: string;
  customTerms?: string;
  consumerData?: {
    location?: string;
    weeklySpend?: number;
    orderFrequency?: string;
    invoiceFile?: string; 
    mobile?: string;
  };
}

export interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  source: 'AI_SCAN' | 'MANUAL' | 'REFERRAL';
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED';
}
