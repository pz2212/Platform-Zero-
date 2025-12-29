import { 
  User, UserRole, Product, InventoryItem, Order, Customer, 
  SupplierPriceRequest, PricingRule,
  SupplierPriceRequestItem, AppNotification, ChatMessage, OrderItem,
  Driver, Packer, RegistrationRequest, OnboardingFormTemplate
} from '../types';

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
    { id: 'p1', name: 'Organic Tomatoes', category: 'Vegetable', variety: 'Roma', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 4.50, co2SavingsPerKg: 1.2 },
    { id: 'p2', name: 'Fresh Lettuce', category: 'Vegetable', variety: 'Cos', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 1.20, co2SavingsPerKg: 0.8 },
    { id: 'p3', name: 'Apples', category: 'Fruit', variety: 'Pink Lady', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 3.80, co2SavingsPerKg: 1.5 },
    { id: 'p4', name: 'Eggplants', category: 'Vegetable', variety: 'Black Beauty', imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 5.50, co2SavingsPerKg: 1.1 },
    { id: 'p5', name: 'Dutch Cream Potatoes', category: 'Vegetable', variety: 'Grade A', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 2.10, co2SavingsPerKg: 0.9 },
  ];

  private inventory: InventoryItem[] = [
    { id: 'i1', lotNumber: 'PZ-LOT-1001', productId: 'p1', ownerId: 'u3', quantityKg: 500, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley', warehouseLocation: 'Zone A-4' },
    { id: 'i2', lotNumber: 'PZ-LOT-1002', productId: 'p2', ownerId: 'u2', quantityKg: 1000, expiryDate: new Date(Date.now() + 86400000 * 14).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date(Date.now() - 86400000).toISOString(), status: 'Available', originalFarmerName: 'Bob\'s Spuds', harvestLocation: 'Gippsland', warehouseLocation: 'Cold Room 1' },
    { id: 'i3', lotNumber: 'PZ-LOT-1003', productId: 'p4', ownerId: 'u2', quantityKg: 200, expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley', warehouseLocation: 'Zone C-2' },
  ];

  private orders: Order[] = [];
  private customers: Customer[] = [
      { id: 'c1', businessName: 'Fresh Market Co', contactName: 'Sarah Johnson', category: 'Retail', commonProducts: 'Tomatoes, Lettuce, Apples', location: 'Richmond' },
      { id: 'c2', businessName: 'Healthy Eats', contactName: 'Chef Mario', category: 'Restaurant', commonProducts: 'Tomatoes, Eggplant, Broccoli', location: 'South Yarra' },
  ];

  private messages: ChatMessage[] = [];
  private notifications: AppNotification[] = [];
  private supplierPriceRequests: SupplierPriceRequest[] = [];
  private pricingRules: PricingRule[] = [];
  private drivers: Driver[] = [];
  private packers: Packer[] = [];
  private registrationRequests: RegistrationRequest[] = [];
  private formTemplates: OnboardingFormTemplate[] = [
    {
      id: 't1', role: UserRole.CONSUMER, sections: [{ id: 's1', title: 'Business Details', fields: [{ id: 'f1', label: 'Company Name', type: 'text', required: true }] }]
    },
    {
      id: 't2', role: UserRole.WHOLESALER, sections: [{ id: 's1', title: 'Business Details', fields: [{ id: 'f1', label: 'Wholesale License', type: 'text', required: true }] }]
    },
    {
      id: 't3', role: UserRole.FARMER, sections: [{ id: 's1', title: 'Farm Details', fields: [{ id: 'f1', label: 'Acreage', type: 'number', required: true }] }]
    }
  ];

  constructor() {
      // Load initial demo data
      this.generateDemoOrders();
      this.generateInitialNotifications();
  }

  private generateDemoOrders() {
      const today = new Date();
      for (let i = 0; i < 5; i++) {
          this.orders.push({
              id: `o-demo-${i}`,
              buyerId: 'c1',
              sellerId: 'u2',
              items: [{ productId: 'p1', quantityKg: 20, pricePerKg: 4.50 }],
              totalAmount: 90,
              status: 'Pending',
              date: today.toISOString(),
              priority: 'HIGH'
          });
      }
  }

  private generateInitialNotifications() {
      const usersToNotify = ['u1', 'u2', 'u3', 'u4'];
      usersToNotify.forEach(uid => {
          this.addAppNotification(
              uid, 
              'Welcome to Platform Zero', 
              'You have successfully joined the marketplace. Start trading fresh produce today.', 
              'SYSTEM'
          );
          
          if (uid === 'u2' || uid === 'u1') {
              this.addAppNotification(
                  uid,
                  'New Price Request',
                  'Admin has assigned a new pricing negotiation for a local retail lead.',
                  'PRICE_REQUEST',
                  '/market'
              );
          }
      });
  }

  generateLotId() {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PZ-${year}${month}-${random}`;
  }

  getAllUsers() { return this.users; }
  getCustomers() { return this.customers; }
  getWholesalers() { return this.users.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER); }
  getPzRepresentatives() { return this.users.filter(u => u.role === UserRole.PZ_REP); }
  
  getAppNotifications(userId: string) {
    return this.notifications.filter(n => n.userId === userId);
  }

  addAppNotification(userId: string, title: string, message: string, type: any, link?: string) {
    this.notifications.push({
      id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId, title, message, type, timestamp: new Date().toISOString(), isRead: false, link
    });
  }

  markNotificationAsRead(id: string) {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.isRead = true;
  }

  markAllNotificationsRead(userId: string) {
    this.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
  }

  getChatMessages(u1: string, u2: string) {
    return this.messages.filter(m => (m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1));
  }

  sendChatMessage(senderId: string, receiverId: string, text: string, isProductLink = false, productId?: string) {
    this.messages.push({
      id: `m-${Date.now()}`,
      senderId, receiverId, text, timestamp: new Date().toISOString(), isProductLink, productId
    });
  }

  contactNeedsResponse(current: string, contact: string) {
    const msgs = this.getChatMessages(current, contact);
    return msgs.length > 0 && msgs[msgs.length - 1].senderId === contact;
  }

  getAllProducts() { return this.products; }
  getProduct(id: string) { return this.products.find(p => p.id === id); }
  
  addProduct(product: Product) {
    this.products.push(product);
  }

  getInventory(userId: string) { return this.inventory.filter(i => i.ownerId === userId); }
  getAllInventory() { return this.inventory; }
  getInventoryByOwner(ownerId: string) { return this.inventory.filter(i => i.ownerId === ownerId); }
  
  addInventoryItem(item: InventoryItem) { 
    this.inventory.push(item); 
  }

  updateInventoryStatus(id: string, status: any) {
    const item = this.inventory.find(i => i.id === id);
    if (item) item.status = status;
  }

  getOrders(userId: string) { 
    return this.orders.filter(o => o.buyerId === userId || o.sellerId === userId);
  }

  acceptOrderV2(id: string) {
    const order = this.orders.find(o => o.id === id);
    if (order) order.status = 'Confirmed';
  }

  createInstantOrder(buyerId: string, item: InventoryItem, qty: number, price: number) {
    this.orders.push({
      id: `o-inst-${Date.now()}`,
      buyerId,
      sellerId: item.ownerId,
      items: [{ productId: item.productId, quantityKg: qty, pricePerKg: price }],
      totalAmount: qty * price,
      status: 'Confirmed',
      date: new Date().toISOString(),
      paymentStatus: 'Unpaid'
    });
  }

  getSupplierPriceRequests(id: string) { return this.supplierPriceRequests.filter(r => r.supplierId === id); }
  getAllSupplierPriceRequests() { return this.supplierPriceRequests; }
  createSupplierPriceRequest(req: SupplierPriceRequest) { this.supplierPriceRequests.push(req); }
  updateSupplierPriceRequest(id: string, updates: any) {
    const req = this.supplierPriceRequests.find(r => r.id === id);
    if (req) Object.assign(req, updates);
  }
  
  finalizeDeal(id: string) {
    const req = this.supplierPriceRequests.find(r => r.id === id);
    if (req) {
      req.status = 'WON';
      const customer: Customer = {
        id: `c-won-${Date.now()}`,
        businessName: req.customerContext,
        contactName: 'Pending Setup',
        category: 'Restaurant',
        connectedSupplierId: req.supplierId
      };
      this.customers.push(customer);
      return customer;
    }
    return null;
  }

  updateUserInterests(id: string, s: string[], b: string[]) {
    const u = this.users.find(x => x.id === id);
    if (u) { u.activeSellingInterests = s; u.activeBuyingInterests = b; }
  }

  updateProductPrice(id: string, price: number) {
    const p = this.products.find(x => x.id === id);
    if (p) p.defaultPricePerKg = price;
  }

  updateProductPricing(id: string, price: number, unit: any) {
    const p = this.products.find(x => x.id === id);
    if (p) { p.defaultPricePerKg = price; p.unit = unit; }
  }

  getPricingRules(ownerId: string, productId: string) {
    return this.pricingRules.filter(r => r.ownerId === ownerId && r.productId === productId);
  }

  findBuyersForProduct(name: string) {
    return this.customers.filter(c => c.commonProducts?.toLowerCase().includes(name.toLowerCase()));
  }

  addMarketplaceCustomer(c: Customer) { this.customers.push(c); }
  updateCustomerMarkup(id: string, m: number) {
    const c = this.customers.find(x => x.id === id);
    if (c) c.pzMarkup = m;
  }

  updateCustomerSupplier(cid: string, sid: string) {
    const c = this.customers.find(x => x.id === cid);
    const s = this.users.find(x => x.id === sid);
    if (c && s) {
      c.connectedSupplierId = s.id;
      c.connectedSupplierName = s.businessName;
    }
  }

  updateCustomerRep(cid: string, rid: string) {
    const c = this.customers.find(x => x.id === cid);
    const r = this.users.find(x => x.id === rid);
    if (c && r) {
      c.assignedPzRepId = r.id;
      c.assignedPzRepName = r.name;
    }
  }

  verifyPrice(id: string, price?: number) {
    const item = this.inventory.find(i => i.id === id);
    if (item) {
      item.lastPriceVerifiedDate = new Date().toLocaleDateString();
      if (price !== undefined) this.updateProductPrice(item.productId, price);
    }
  }

  getRegistrationRequests() {
    return this.registrationRequests;
  }

  getFormTemplate(role: UserRole) {
    return this.formTemplates.find(t => t.role === role);
  }

  updateFormTemplate(role: UserRole, template: OnboardingFormTemplate) {
    const idx = this.formTemplates.findIndex(t => t.role === role);
    if (idx !== -1) {
      this.formTemplates[idx] = template;
    } else {
      this.formTemplates.push(template);
    }
  }

  getDrivers(wholesalerId: string) {
    return this.drivers.filter(d => d.wholesalerId === wholesalerId);
  }

  addDriver(driver: Driver) {
    this.drivers.push(driver);
  }

  getDriverOrders(driverId: string) {
      const driver = this.drivers.find(d => d.id === driverId);
      return this.orders.filter(o => o.logistics?.driverName === driver?.name || o.logistics?.driverName === 'Rep User');
  }

  deliverOrder(orderId: string, driverName: string, proofPhoto: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Delivered';
          order.deliveredAt = new Date().toISOString();
          if (order.logistics) {
              order.logistics.driverName = driverName;
              order.logistics.deliveryTime = new Date().toLocaleTimeString();
          }
      }
  }

  addEmployee(user: User) {
      this.users.push(user);
  }

  updateUserVersion(userId: string, version: 'v1' | 'v2') {
      const u = this.users.find(x => x.id === userId);
      if (u) u.dashboardVersion = version;
  }

  approveRegistration(requestId: string) {
      const req = this.registrationRequests.find(r => r.id === requestId);
      if (req) {
          req.status = 'Approved';
          const newUser: User = {
              id: `u-${Date.now()}`,
              name: req.name,
              businessName: req.businessName,
              email: req.email,
              role: req.requestedRole,
              dashboardVersion: 'v2'
          };
          this.users.push(newUser);
          
          if (req.requestedRole === UserRole.CONSUMER) {
              this.customers.push({
                  id: `c-${Date.now()}`,
                  businessName: req.businessName,
                  contactName: req.name,
                  email: req.email,
                  category: 'Retail',
                  location: req.consumerData?.location,
                  connectionStatus: 'Active'
              });
          }
      }
  }

  rejectRegistration(requestId: string) {
      const req = this.registrationRequests.find(r => r.id === requestId);
      if (req) req.status = 'Rejected';
  }

  createManualInvite(data: any) {
      const request: RegistrationRequest = {
          id: `req-man-${Date.now()}`,
          businessName: data.businessName,
          name: data.name,
          email: data.email,
          requestedRole: data.role,
          status: 'Pending',
          submittedDate: new Date().toISOString(),
          paymentTerms: data.paymentTerms,
          customTerms: data.customTerms,
          consumerData: {
              location: data.location,
              mobile: data.mobile || data.phone
          }
      };
      this.registrationRequests.push(request);
      return request;
  }

  deleteRegistrationRequest(id: string) {
      this.registrationRequests = this.registrationRequests.filter(r => r.id !== id);
  }

  onboardNewBusiness(data: any) {
      const newUser: User = {
          id: `u-onb-${Date.now()}`,
          name: data.name || 'New User',
          businessName: data.businessName,
          email: data.email,
          role: data.role || UserRole.CONSUMER,
          dashboardVersion: 'v2'
      };
      this.users.push(newUser);

      if (newUser.role === UserRole.CONSUMER) {
          this.customers.push({
              id: `c-onb-${Date.now()}`,
              businessName: data.businessName,
              contactName: data.name || 'Admin',
              email: data.email,
              phone: data.phone,
              category: data.customerType || 'Retail',
              location: data.address,
              connectionStatus: 'Pending Connection'
          });
      }
      return newUser;
  }

  sendOnboardingComms(customerId: string) {
      const customer = this.customers.find(c => c.id === customerId);
      if (customer) {
          customer.connectionStatus = 'Active';
      }
  }

  getRepCustomers(repId: string) {
      return this.customers.filter(c => c.assignedPzRepId === repId);
  }

  getRepIssues(repId: string) {
      const customerIds = this.getRepCustomers(repId).map(c => c.id);
      return this.orders.filter(o => customerIds.includes(o.buyerId) && o.issue);
  }

  getRepStats(repId: string) {
      const customers = this.getRepCustomers(repId);
      const customerIds = customers.map(c => c.id);
      const repOrders = this.orders.filter(o => customerIds.includes(o.buyerId));
      
      const totalSales = repOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const commissionMade = repOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + (o.totalAmount * 0.05), 0);
      const commissionComing = repOrders.filter(o => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + (o.totalAmount * 0.05), 0);

      return {
          totalSales,
          commissionMade,
          commissionComing,
          customerCount: customers.length,
          orders: repOrders
      };
  }

  submitConsumerSignup(data: any) {
      const request: RegistrationRequest = {
          id: `req-signup-${Date.now()}`,
          businessName: data.businessName,
          name: data.name,
          email: data.email,
          requestedRole: data.role || UserRole.CONSUMER,
          status: 'Pending',
          submittedDate: new Date().toISOString(),
          consumerData: {
              location: data.location,
              weeklySpend: data.weeklySpend,
              orderFrequency: data.orderFrequency,
              invoiceFile: data.invoiceFile,
              mobile: data.mobile
          }
      };
      this.registrationRequests.push(request);
      return request;
  }

  verifyOrder(orderId: string, issues: any[]) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          if (issues.length > 0) {
              order.issue = {
                  type: issues[0].type,
                  description: issues[0].action,
                  reportedAt: new Date().toISOString()
              };
          }
          order.paymentStatus = 'Unpaid';
      }
  }

  updateBusinessProfile(userId: string, profile: any) {
      const u = this.users.find(x => x.id === userId);
      if (u) {
          u.businessProfile = profile;
          u.businessName = profile.companyName || u.businessName;
      }
  }

  getPackers(wholesalerId: string) {
      return this.packers.filter(p => p.wholesalerId === wholesalerId);
  }

  addPacker(packer: Packer) {
      this.packers.push(packer);
  }

  getPackerOrders(packerId: string) {
      return this.orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed');
  }

  packOrder(orderId: string, packerName: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Ready for Delivery';
          order.packedAt = new Date().toISOString();
      }
  }

  deleteUser(id: string) {
      this.users = this.users.filter(u => u.id !== id);
  }
}

export const mockService = new MockDataService();