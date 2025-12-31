
import { 
  User, UserRole, Product, InventoryItem, Order, Customer, 
  SupplierPriceRequest, PricingRule,
  SupplierPriceRequestItem, AppNotification, ChatMessage, OrderItem,
  Driver, Packer, RegistrationRequest, OnboardingFormTemplate,
  BusinessProfile, OrderIssue
} from '../types';

export interface DeliAppItem {
    id: string;
    productName: string;
    description: string;
    price: number;
    quantity: number;
    vendorName: string;
    imageUrl: string;
    rating: number;
    distance: string;
    categories: string[];
    isLive: boolean;
}

export const USERS: User[] = [
  { id: 'u1', name: 'Admin User', businessName: 'Platform Zero', role: UserRole.ADMIN, email: 'admin@pz.com' },
  { id: 'u2', name: 'Sarah Wholesaler', businessName: 'Fresh Wholesalers', role: UserRole.WHOLESALER, email: 'sarah@fresh.com', dashboardVersion: 'v2', activeSellingInterests: ['Tomatoes', 'Lettuce', 'Apples'], activeBuyingInterests: ['Potatoes', 'Carrots'], businessProfile: { isComplete: true } as any },
  { id: 'u3', name: 'Bob Farmer', businessName: 'Green Valley Farms', role: UserRole.FARMER, email: 'bob@greenvalley.com', dashboardVersion: 'v2', activeSellingInterests: ['Tomatoes', 'Eggplant'], businessProfile: { isComplete: true } as any },
  { id: 'u4', name: 'Alice Consumer', businessName: 'The Morning Cafe', role: UserRole.CONSUMER, email: 'alice@cafe.com' },
  { id: 'rep1', name: 'Rep User', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep1@pz.com', commissionRate: 5.0 },
];

class MockDataService {
  private users: User[] = [...USERS];
  private products: Product[] = [
    { id: 'p1', name: 'Organic Roma Tomatoes', category: 'Vegetable', variety: 'Roma', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 4.50, co2SavingsPerKg: 1.2 },
    { id: 'p1-truss', name: 'Truss Vine Tomatoes', category: 'Vegetable', variety: 'Vine-Ripened', imageUrl: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 6.20, co2SavingsPerKg: 1.0 },
    { id: 'p2', name: 'Fresh Lettuce', category: 'Vegetable', variety: 'Cos', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 1.20, co2SavingsPerKg: 0.8 },
    { id: 'p3', name: 'Apples', category: 'Fruit', variety: 'Pink Lady', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 3.80, co2SavingsPerKg: 1.5 },
    { id: 'p4', name: 'Eggplants', category: 'Vegetable', variety: 'Black Beauty', imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 5.50, co2SavingsPerKg: 1.1 },
    { id: 'p5', name: 'Dutch Cream Potatoes', category: 'Vegetable', variety: 'Grade A', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 2.10, co2SavingsPerKg: 0.9 },
    { id: 'p-banana-cav', name: 'Cavendish Bananas', category: 'Fruit', variety: 'Cavendish', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ad9902537317?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 3.50, co2SavingsPerKg: 0.9 },
    { id: 'p-banana-lady', name: 'Lady Finger Bananas', category: 'Fruit', variety: 'Lady Finger', imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 5.80, co2SavingsPerKg: 0.7 },
  ];

  private inventory: InventoryItem[] = [
    { id: 'i1', lotNumber: 'PZ-LOT-1001', productId: 'p1', ownerId: 'u3', quantityKg: 500, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley', warehouseLocation: 'Zone A-4' },
    { id: 'i2', lotNumber: 'PZ-LOT-1002', productId: 'p2', ownerId: 'u2', quantityKg: 1000, expiryDate: new Date(Date.now() + 86400000 * 14).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date(Date.now() - 86400000).toISOString(), status: 'Available', originalFarmerName: 'Bob\'s Spuds', harvestLocation: 'Gippsland', warehouseLocation: 'Cold Room 1' },
    { id: 'i3', lotNumber: 'PZ-LOT-1003', productId: 'p4', ownerId: 'u2', quantityKg: 200, expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley', warehouseLocation: 'Zone C-2' },
  ];

  private orders: Order[] = [];
  private notifications: AppNotification[] = [];
  private customers: Customer[] = [
    { id: 'u4', businessName: 'The Morning Cafe', contactName: 'Alice Consumer', category: 'Restaurant', commonProducts: 'Bananas, Potatoes, Lettuce', location: 'Richmond', connectedSupplierId: 'u2', connectedSupplierName: 'Fresh Wholesalers', connectionStatus: 'Active', email: 'alice@cafe.com', phone: '0412 345 678' },
    { id: 'c1', businessName: 'Fresh Market Co', contactName: 'Sarah Johnson', category: 'Retail', commonProducts: 'Tomatoes, Lettuce, Apples', location: 'Richmond', connectedSupplierId: 'u2', connectedSupplierName: 'Fresh Wholesalers', connectionStatus: 'Active', email: 'sarah@freshmarket.com', phone: '0400 999 888' },
    { id: 'c2', businessName: 'Healthy Eats', contactName: 'Chef Mario', category: 'Restaurant', commonProducts: 'Tomatoes, Eggplant, Broccoli', location: 'South Yarra', connectedSupplierId: 'u3', connectedSupplierName: 'Green Valley Farms', connectionStatus: 'Active', email: 'mario@healthy.com', phone: '0455 111 222' },
    { id: 'c3', businessName: 'Richmond Corner Pub', contactName: 'Dave Smith', category: 'Pub/Bar', location: 'Richmond', connectedSupplierId: 'u2', connectionStatus: 'Pricing Pending', email: 'dave@richmondpub.com', phone: '0488 777 666' },
  ];

  private drivers: Driver[] = [];
  private packers: Packer[] = [];
  private registrationRequests: RegistrationRequest[] = [];
  private supplierPriceRequests: SupplierPriceRequest[] = [];
  private chatMessages: ChatMessage[] = [];

  constructor() {
      this.generateDemoOrders();
  }

  private generateDemoOrders() {
      const now = new Date();
      this.orders.push({
          id: `o-demo-1`, buyerId: 'u4', sellerId: 'u2', items: [{ productId: 'p1', quantityKg: 10, pricePerKg: 4.50 }], totalAmount: 45.00, status: 'Shipped', date: now.toISOString(), paymentStatus: 'Unpaid'
      });
  }

  getAllUsers() { return this.users; }
  getCustomers() { return this.customers; }
  getAppNotifications(userId: string) { return this.notifications.filter(n => n.userId === userId); }
  markNotificationAsRead(id: string) { const n = this.notifications.find(x => x.id === id); if (n) n.isRead = true; }
  markAllNotificationsRead(userId: string) { this.notifications.forEach(n => { if (n.userId === userId) n.isRead = true; }); }
  getAllProducts() { return this.products; }
  getInventory(userId: string) { return this.inventory.filter(i => i.ownerId === userId); }
  getAllInventory() { return this.inventory; }
  addInventoryItem(item: InventoryItem) { this.inventory.push(item); }
  updateInventoryStatus(id: string, status: any) { const item = this.inventory.find(i => i.id === id); if (item) item.status = status; }
  getOrders(userId: string) { if (userId === 'u1') return this.orders; return this.orders.filter(o => o.buyerId === userId || o.sellerId === userId); }
  
  createFullOrder(buyerId: string, items: OrderItem[], total: number) {
      const buyerProfile = this.customers.find(c => c.id === buyerId);
      const sellerId = buyerProfile?.connectedSupplierId || 'u2'; 
      const newOrder: Order = { id: `o-${Date.now()}`, buyerId, sellerId, items, totalAmount: total, status: 'Pending', date: new Date().toISOString(), paymentStatus: 'Unpaid' };
      this.orders.push(newOrder);
      this.addAppNotification(sellerId, 'New Order Received', `Order for $${total.toFixed(2)} received.`, 'ORDER');
      return newOrder;
  }

  createInstantOrder(buyerId: string, item: InventoryItem, quantity: number, price: number) {
    const newOrder: Order = { id: `o-inst-${Date.now()}`, buyerId, sellerId: item.ownerId, items: [{ productId: item.productId, quantityKg: quantity, pricePerKg: price }], totalAmount: quantity * price, status: 'Confirmed', date: new Date().toISOString(), paymentStatus: 'Unpaid' };
    this.orders.push(newOrder);
    return newOrder;
  }

  acceptOrderV2(id: string) {
    const order = this.orders.find(o => o.id === id);
    if (order) { order.status = 'Confirmed'; order.confirmedAt = new Date().toISOString(); }
  }

  updateUserInterests(id: string, s: string[], b: string[]) {
    const u = this.users.find(x => x.id === id);
    if (u) { u.activeSellingInterests = s; u.activeBuyingInterests = b; }
  }

  updateProductPricing(id: string, price: number, unit: any) {
    const p = this.products.find(x => x.id === id);
    if (p) { p.defaultPricePerKg = price; p.unit = unit; }
  }

  generateLotId() { return `PZ-${Math.floor(1000 + Math.random() * 9000)}`; }
  findBuyersForProduct(name: string) { return this.customers.filter(c => c.commonProducts?.toLowerCase().includes(name.toLowerCase())); }
  getPzRepresentatives() { return this.users.filter(u => u.role === UserRole.PZ_REP); }
  getInventoryByOwner(ownerId: string) { return this.getInventory(ownerId); }
  addProduct(product: Product) { this.products.push(product); }
  updateProductPrice(id: string, price: number) { const p = this.products.find(x => x.id === id); if (p) p.defaultPricePerKg = price; }

  updateCustomerSupplier(customerId: string, supplierId: string) {
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      customer.connectedSupplierId = supplierId;
      const supplier = this.users.find(u => u.id === supplierId);
      if (supplier) { customer.connectedSupplierName = supplier.businessName; customer.connectedSupplierRole = supplier.role; }
    }
  }

  getDrivers(wholesalerId: string) { return this.drivers.filter(d => d.wholesalerId === wholesalerId); }
  addDriver(driver: Driver) { this.drivers.push(driver); }
  getDriverOrders(driverId: string) { const driver = this.drivers.find(d => d.id === driverId); return this.orders.filter(o => o.logistics?.driverName === driver?.name); }
  deliverOrder(orderId: string, driverName: string, photo: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) { order.status = 'Delivered'; order.deliveredAt = new Date().toISOString(); order.logistics = { ...order.logistics, driverName, deliveryPhoto: photo, deliveryDate: new Date().toISOString() }; }
  }

  addAppNotification(userId: string, title: string, message: string, type: AppNotification['type']) {
    this.notifications.push({ id: `n-${Date.now()}`, userId, title, message, type, timestamp: new Date().toISOString(), isRead: false });
  }

  addEmployee(user: User) { this.users.push(user); }
  updateUserVersion(userId: string, version: 'v1' | 'v2') { const user = this.users.find(u => u.id === userId); if (user) user.dashboardVersion = version; }
  getRegistrationRequests() { return this.registrationRequests; }
  approveRegistration(id: string) { const req = this.registrationRequests.find(r => r.id === id); if (req) req.status = 'Approved'; }
  rejectRegistration(id: string) { const req = this.registrationRequests.find(r => r.id === id); if (req) req.status = 'Rejected'; }
  createManualInvite(data: any): RegistrationRequest {
    const req: RegistrationRequest = { id: `req-${Date.now()}`, businessName: data.businessName, name: data.name, email: data.email, requestedRole: data.role || UserRole.CONSUMER, status: 'Pending', submittedDate: new Date().toISOString(), consumerData: { location: data.location, mobile: data.mobile } };
    this.registrationRequests.push(req);
    // Auto-create a customer record for immediate directory visibility
    this.customers.push({ id: `c-${Date.now()}`, businessName: data.businessName, contactName: data.name, email: data.email, phone: data.mobile, category: 'Restaurant', connectionStatus: 'Pending Connection', connectedSupplierId: USERS[1].id });
    return req;
  }
  deleteRegistrationRequest(id: string) { this.registrationRequests = this.registrationRequests.filter(r => r.id !== id); }
  onboardNewBusiness(data: any): User {
    const newUser: User = { id: `u-${Date.now()}`, name: data.name || 'New Lead', businessName: data.businessName, email: data.email, role: data.role || (data.type === 'Supplier' ? UserRole.WHOLESALER : UserRole.CONSUMER), phone: data.phone, businessProfile: { isComplete: false, abn: data.abn, businessLocation: data.address } as any };
    this.users.push(newUser);
    return newUser;
  }
  sendOnboardingComms(customerId: string) { }
  getRepCustomers(repId: string) { return this.customers.filter(c => c.assignedPzRepId === repId); }
  getRepIssues(repId: string) { return this.orders.filter(o => o.issue); }
  getRepStats(repId: string) {
    const customers = this.getRepCustomers(repId);
    const customerIds = customers.map(c => c.id);
    const repOrders = this.orders.filter(o => customerIds.includes(o.buyerId));
    return { totalSales: repOrders.reduce((sum, o) => sum + o.totalAmount, 0), commissionMade: repOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.totalAmount * 0.05, 0), commissionComing: repOrders.filter(o => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + o.totalAmount * 0.05, 0), customerCount: customers.length, orders: repOrders };
  }
  getSupplierPriceRequests(id: string) { return this.supplierPriceRequests.filter(r => r.supplierId === id); }
  getAllSupplierPriceRequests() { return this.supplierPriceRequests; }
  updateSupplierPriceRequest(id: string, req: SupplierPriceRequest) { const idx = this.supplierPriceRequests.findIndex(r => r.id === id); if (idx !== -1) this.supplierPriceRequests[idx] = req; }
  createSupplierPriceRequest(req: SupplierPriceRequest) { this.supplierPriceRequests.push(req); }
  getWholesalers() { return this.users.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER); }
  submitConsumerSignup(data: any) { const req: RegistrationRequest = { id: `reg-${Date.now()}`, businessName: data.businessName, name: data.name, email: data.email, requestedRole: data.requestedRole || UserRole.CONSUMER, status: 'Pending', submittedDate: new Date().toISOString(), consumerData: { location: data.location, weeklySpend: data.weeklySpend, orderFrequency: data.orderFrequency, invoiceFile: data.invoiceFile, mobile: data.mobile } }; this.registrationRequests.push(req); }
  getProduct(id: string) { return this.products.find(p => p.id === id); }
  updateBusinessProfile(userId: string, profile: BusinessProfile) { const user = this.users.find(u => u.id === userId); if (user) user.businessProfile = profile; }
  getPackers(wholesalerId: string) { return this.packers.filter(p => p.wholesalerId === wholesalerId); }
  addPacker(packer: Packer) { this.packers.push(packer); }
  getPackerOrders(packerId: string) { const packer = this.packers.find(p => p.id === packerId); return this.orders.filter(o => o.sellerId === packer?.wholesalerId && o.status === 'Confirmed'); }
  packOrder(orderId: string, packerName: string) { const order = this.orders.find(o => o.id === orderId); if (order) { order.status = 'Ready for Delivery'; order.packedAt = new Date().toISOString(); order.preparedAt = new Date().toISOString(); } }
  deleteUser(id: string) { this.users = this.users.filter(u => u.id !== id); }
  finalizeDeal(reqId: string): Customer | undefined {
    const req = this.supplierPriceRequests.find(r => r.id === reqId);
    if (req) {
      req.status = 'WON';
      const supplier = this.users.find(u => u.id === req.supplierId);
      const newCustomer: Customer = { id: `c-won-${Date.now()}`, businessName: req.customerContext, contactName: 'Pending Onboarding', category: 'Restaurant', location: req.customerLocation, connectedSupplierId: req.supplierId, connectedSupplierName: supplier?.businessName, connectedSupplierRole: supplier?.role, connectionStatus: 'Active' };
      this.customers.push(newCustomer);
      return newCustomer;
    }
  }
  getChatMessages(u1: string, u2: string) { return this.chatMessages.filter(m => (m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1)); }
  sendChatMessage(senderId: string, receiverId: string, text: string) { const msg: ChatMessage = { id: `chat-${Date.now()}`, senderId, receiverId, text, timestamp: new Date().toISOString() }; this.chatMessages.push(msg); }

  getFormTemplate(role: UserRole): OnboardingFormTemplate | undefined {
    return {
      id: `form-${role}`,
      role,
      sections: [
        {
          id: 's1',
          title: 'Business Basics',
          fields: [
            { id: 'f1', label: 'Company Name', type: 'text', required: true },
            { id: 'f2', label: 'ABN', type: 'text', required: true }
          ]
        }
      ]
    };
  }

  uploadToDeli(data: any, vendorName: string) {
    console.log(`Uploading to Deli: ${vendorName}`, data);
  }
}

export const mockService = new MockDataService();
