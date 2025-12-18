
import { 
  User, UserRole, Product, InventoryItem, Order, Customer, 
  RegistrationRequest, Driver, Packer, Lead, SupplierPriceRequest,
  PricingRule, OnboardingFormTemplate, BusinessProfile,
  SupplierPriceRequestItem
} from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Admin User', businessName: 'Platform Zero', role: UserRole.ADMIN, email: 'admin@pz.com' },
  { id: 'u2', name: 'Sarah Wholesaler', businessName: 'Fresh Wholesalers', role: UserRole.WHOLESALER, email: 'sarah@fresh.com', dashboardVersion: 'v2' },
  { id: 'u3', name: 'Bob Farmer', businessName: 'Green Valley Farms', role: UserRole.FARMER, email: 'bob@greenvalley.com', dashboardVersion: 'v2' },
  { id: 'u4', name: 'Alice Consumer', businessName: 'The Morning Cafe', role: UserRole.CONSUMER, email: 'alice@cafe.com' },
  { id: 'rep1', name: 'Rep User', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep1@pz.com', commissionRate: 5.0 },
  { id: 'd1', name: 'Dave Driver', businessName: 'Fresh Wholesalers', role: UserRole.DRIVER, email: 'dave@fresh.com' } // Maps to driver d1
];

class MockDataService {
  private users: User[] = [...USERS];
  private products: Product[] = [
    { id: 'p1', name: 'Tomatoes', category: 'Vegetable', variety: 'Roma', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 4.50 },
    { id: 'p2', name: 'Potatoes', category: 'Vegetable', variety: 'Washed', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 1.20 },
    { id: 'p3', name: 'Apples', category: 'Fruit', variety: 'Pink Lady', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 3.80 },
    { id: 'p4', name: 'Eggplants', category: 'Vegetable', variety: 'Black Beauty', imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 5.50 },
  ];
  private inventory: InventoryItem[] = [
    { id: 'i1', productId: 'p1', ownerId: 'u3', quantityKg: 500, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley' },
    { id: 'i2', productId: 'p2', ownerId: 'u2', quantityKg: 1000, expiryDate: new Date(Date.now() + 86400000 * 14).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', originalFarmerName: 'Bob\'s Spuds', harvestLocation: 'Gippsland' },
    { id: 'i3', productId: 'p4', ownerId: 'u2', quantityKg: 200, expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley' },
  ];
  private orders: Order[] = [
    { 
        id: 'o-1001', buyerId: 'u4', sellerId: 'u2', items: [{ productId: 'p1', quantityKg: 20, pricePerKg: 4.50 }], totalAmount: 90, status: 'Delivered', date: new Date(Date.now() - 86400000 * 2).toISOString(),
        logistics: { method: 'LOGISTICS', driverName: 'Dave Driver', deliveryTime: '10:00 AM', deliveryLocation: '123 Cafe St' },
        deliveredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        paymentStatus: 'Paid'
    },
    {
        id: 'o-1002', buyerId: 'u4', sellerId: 'u2', items: [{ productId: 'p2', quantityKg: 50, pricePerKg: 1.20 }], totalAmount: 60, status: 'Pending', date: new Date().toISOString(),
        logistics: { method: 'LOGISTICS', deliveryLocation: '123 Cafe St', deliveryDate: new Date(Date.now() + 86400000).toISOString() },
        paymentStatus: 'Unpaid'
    }
  ];
  private customers: Customer[] = [
      { id: 'u4', businessName: 'The Morning Cafe', contactName: 'Alice', email: 'alice@cafe.com', phone: '0400 123 456', category: 'Cafe', connectionStatus: 'Active', connectedSupplierName: 'Fresh Wholesalers', connectedSupplierId: 'u2', pricingStatus: 'Approved', joinedDate: '2023-01-15' },
      { id: 'c2', businessName: 'Metro Bistro', contactName: 'Chef Mario', email: 'mario@metro.com', phone: '0400 333 444', category: 'Restaurant', connectionStatus: 'Active', connectedSupplierName: 'Fresh Wholesalers', connectedSupplierId: 'u2', pricingStatus: 'Approved', joinedDate: '2023-02-10' }
  ];
  private leads: Lead[] = [
      { id: 'l1', businessName: 'Downtown Bistro', location: 'CBD', weeklySpend: 3000, deliveryTimePref: 'Early Morning', requestedProducts: [{productId: 'p1', productName: 'Tomatoes', currentPrice: 5.00}] }
  ];
  private registrationRequests: RegistrationRequest[] = [];
  private drivers: Driver[] = [
      { id: 'd1', wholesalerId: 'u2', name: 'Dave Driver', email: 'dave@fresh.com', phone: '0400123456', licenseNumber: 'DL123456', vehicleRegistration: 'ABC-123', vehicleType: 'Van', status: 'Active' }
  ];
  private packers: Packer[] = [
      { id: 'pk1', wholesalerId: 'u2', name: 'Pete Packer', email: 'pete@fresh.com', phone: '0400654321', status: 'Active' }
  ];
  private supplierPriceRequests: SupplierPriceRequest[] = [];
  private pricingRules: PricingRule[] = [];
  private notifications: {userId: string, message: string}[] = [];
  
  // Forms
  private formTemplates: Record<string, OnboardingFormTemplate> = {
      'CONSUMER': { role: UserRole.CONSUMER, sections: [{ id: 's1', title: 'Basic Info', fields: [{ id: 'f1', label: 'Business Name', type: 'text', required: true }] }] },
      'WHOLESALER': { role: UserRole.WHOLESALER, sections: [] },
      'FARMER': { role: UserRole.FARMER, sections: [] }
  };

  constructor() {
      // Load persistent data if available
      try {
          const storedRequests = localStorage.getItem('pz_registrationRequests');
          if (storedRequests) {
              this.registrationRequests = JSON.parse(storedRequests);
          }
          const storedCustomers = localStorage.getItem('pz_customers');
          if (storedCustomers) {
              this.customers = JSON.parse(storedCustomers);
          }
      } catch (e) {
          console.error("Failed to load mock data from storage", e);
      }
  }

  private persistData() {
      try {
          localStorage.setItem('pz_registrationRequests', JSON.stringify(this.registrationRequests));
          localStorage.setItem('pz_customers', JSON.stringify(this.customers));
      } catch (e) {
          console.error("Failed to persist mock data", e);
      }
  }

  // Users
  getAllUsers() { return this.users; }
  getCustomers() { return this.customers; }
  getWholesalers() { return this.users.filter(u => u.role === UserRole.WHOLESALER); }
  getPzRepresentatives() { return this.users.filter(u => u.role === UserRole.PZ_REP); }
  addEmployee(user: User) { this.users.push(user); }
  updateUserVersion(userId: string, version: 'v1' | 'v2') {
      const user = this.users.find(u => u.id === userId);
      if (user) user.dashboardVersion = version;
  }
  updateUserV1Details(userId: string, details: any) {
      const user = this.users.find(u => u.id === userId);
      if (user) Object.assign(user, details);
  }
  updateBusinessProfile(userId: string, profile: BusinessProfile) {
      const user = this.users.find(u => u.id === userId);
      if (user) user.businessProfile = profile;
  }
  updateUserInterests(userId: string, selling: string[], buying: string[]) {
      const user = this.users.find(u => u.id === userId);
      if (user) {
          user.activeSellingInterests = selling;
          user.activeBuyingInterests = buying;
      }
  }

  // Products
  getAllProducts() { return this.products; }
  getProduct(id: string) { return this.products.find(p => p.id === id); }
  addProduct(product: Product) { this.products.push(product); }
  updateProductPrice(id: string, price: number) {
      const product = this.products.find(p => p.id === id);
      if (product) product.defaultPricePerKg = price;
  }
  deleteProduct(id: string) { this.products = this.products.filter(p => p.id !== id); }

  // Inventory
  getInventory(userId: string) { return this.inventory.filter(i => i.ownerId === userId); }
  getAllInventory() { return this.inventory; }
  getInventoryByOwner(ownerId: string) { return this.inventory.filter(i => i.ownerId === ownerId); }
  addInventoryItem(item: InventoryItem) { this.inventory.push(item); }
  updateInventoryStatus(itemId: string, status: any) {
      const item = this.inventory.find(i => i.id === itemId);
      if (item) item.status = status;
  }
  searchGlobalInventory(query: string, excludeUserId: string) {
      const lowerQuery = query.toLowerCase();
      return this.inventory.filter(i => 
          i.ownerId !== excludeUserId && 
          i.status === 'Available' && 
          (this.getProduct(i.productId)?.name.toLowerCase().includes(lowerQuery) || false)
      );
  }

  // Drivers & Packers
  getDrivers(userId: string) { return this.drivers.filter(d => d.wholesalerId === userId); }
  addDriver(driver: Driver) { this.drivers.push(driver); }
  
  getPackers(userId: string) { return this.packers.filter(p => p.wholesalerId === userId); }
  addPacker(packer: Packer) { this.packers.push(packer); }

  // Orders
  getOrders(userId: string) { 
      // If admin, return all. If user, return orders where they are buyer or seller.
      if (userId === 'u1') return this.orders;
      return this.orders.filter(o => o.buyerId === userId || o.sellerId === userId || (o.logistics?.driverId && userId.startsWith('d'))); // simplistic check
  }
  getDriverOrders(driverId: string) {
      return this.orders.filter(o => o.logistics?.driverId === driverId && o.status !== 'Delivered');
  }
  getPackerOrders(packerId: string) {
      return this.orders.filter(o => o.packerId === packerId && o.status !== 'Shipped' && o.status !== 'Delivered');
  }
  createMarketplaceOrder(buyerId: string, sellerId: string, items: {product: Product, qty: number}[], logistics: any, paymentMethod: any) {
      const newOrder: Order = {
          id: `o-${Date.now()}`,
          buyerId,
          sellerId,
          items: items.map(i => ({ productId: i.product.id, quantityKg: i.qty, pricePerKg: i.product.defaultPricePerKg })),
          totalAmount: items.reduce((sum, i) => sum + (i.product.defaultPricePerKg * i.qty), 0),
          status: 'Pending',
          date: new Date().toISOString(),
          logistics: { ...logistics, method: 'LOGISTICS' },
          paymentStatus: 'Unpaid',
          paymentMethod
      };
      this.orders.push(newOrder);
      this.addNotification(sellerId, `New Order received from ${logistics.contactName || 'Buyer'}`);
  }
  createInstantOrder(buyerId: string, item: InventoryItem, quantity: number, price: number) {
      const newOrder: Order = {
          id: `o-inst-${Date.now()}`,
          buyerId,
          sellerId: item.ownerId,
          items: [{ productId: item.productId, quantityKg: quantity, pricePerKg: price }],
          totalAmount: quantity * price,
          status: 'Confirmed',
          date: new Date().toISOString(),
          logistics: { method: 'LOGISTICS', deliveryLocation: 'Buyer Location' }, // Simplification
          paymentStatus: 'Unpaid',
          paymentMethod: 'invoice'
      };
      this.orders.push(newOrder);
      this.addNotification(item.ownerId, "Instant Order received!");
  }
  markOrderDelivered(orderId: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Delivered';
          order.deliveredAt = new Date().toISOString();
      }
  }
  deliverOrder(orderId: string, deliveredBy: string, photoUrl: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Delivered';
          order.deliveredAt = new Date().toISOString();
          order.deliveryDriverName = deliveredBy;
          order.deliveryPhotoUrl = photoUrl;
      }
  }
  confirmOrderV1(orderId: string, items: any[], packerId: string, packerName: string | undefined, driverId: string, driverName: string | undefined) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Confirmed';
          order.items = items;
          order.packerId = packerId;
          order.packerName = packerName;
          if (driverId) {
              order.logistics = { ...order.logistics, method: 'LOGISTICS', driverId, driverName };
          }
      }
  }
  packOrder(orderId: string, packerName: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Ready for Delivery';
          order.packedAt = new Date().toISOString();
          if (packerName && !order.packerName) {
              order.packerName = packerName;
          }
      }
  }
  verifyOrder(orderId: string, issues: any[]) {
      // Mock verification logic
      console.log(`Order ${orderId} verified with issues:`, issues);
  }

  // Registration & Onboarding
  getRegistrationRequests() { return this.registrationRequests; }
  submitConsumerSignup(data: any) {
      const req: RegistrationRequest = {
          id: `req-${Date.now()}`,
          name: data.name,
          businessName: data.businessName,
          email: data.email,
          requestedRole: UserRole.CONSUMER,
          submittedDate: new Date().toISOString(),
          status: 'Pending',
          consumerData: { ...data }
      };
      this.registrationRequests.push(req);
      this.persistData(); // Persist changes
  }
  approveRegistration(id: string) {
      const req = this.registrationRequests.find(r => r.id === id);
      if (req) {
          req.status = 'Approved';
          // Create customer
          const customer: Customer = {
              id: `c-${Date.now()}`,
              businessName: req.businessName,
              contactName: req.name,
              email: req.email,
              category: 'Cafe', // Default
              connectionStatus: 'Pending Connection',
              joinedDate: new Date().toISOString()
          };
          this.customers.push(customer);
          // Create User
          this.users.push({
              id: `u-${Date.now()}`,
              name: req.name,
              businessName: req.businessName,
              email: req.email,
              role: req.requestedRole
          });
          this.persistData(); // Persist changes
      }
  }
  rejectRegistration(id: string) {
      const req = this.registrationRequests.find(r => r.id === id);
      if (req) {
          req.status = 'Rejected';
          this.persistData(); // Persist changes
      }
  }
  addMarketplaceCustomer(customer: Customer) {
      this.customers.push(customer);
      this.persistData(); // Persist changes
  }
  updateCustomerDetails(id: string, updates: Partial<Customer>) {
      const c = this.customers.find(x => x.id === id);
      if (c) {
          Object.assign(c, updates);
          this.persistData(); // Persist changes
      }
  }

  // Leads
  getLeads() { return this.leads; }
  removeLead(id: string) { this.leads = this.leads.filter(l => l.id !== id); }

  // Supplier Price Requests
  getAllSupplierPriceRequests() { return this.supplierPriceRequests; }
  getSupplierPriceRequests(supplierId: string) { return this.supplierPriceRequests.filter(r => r.supplierId === supplierId); }
  createSupplierPriceRequest(req: SupplierPriceRequest) { this.supplierPriceRequests.push(req); }
  updateSupplierPriceRequest(id: string, updates: Partial<SupplierPriceRequest>) {
      const req = this.supplierPriceRequests.find(r => r.id === id);
      if (req) Object.assign(req, updates);
  }
  finalizeDeal(reqId: string) {
      const req = this.supplierPriceRequests.find(r => r.id === reqId);
      if (req) {
          req.status = 'WON';
          // Create customer
          const newCustomer: Customer = {
              id: `c-won-${Date.now()}`,
              businessName: req.customerContext,
              contactName: 'Unknown',
              category: 'Restaurant',
              connectionStatus: 'Active',
              joinedDate: new Date().toISOString(),
              connectedSupplierId: req.supplierId
          };
          this.customers.push(newCustomer);
          this.persistData(); // Persist new customer
          return newCustomer;
      }
      return null;
  }

  // Reps
  getRepStats(repId: string) {
      // Mock stats
      return {
          totalSales: 15400,
          commissionMade: 770,
          commissionComing: 320,
          customerCount: 12,
          orders: this.orders // passing orders for log
      };
  }
  getRepCustomers(repId: string) {
      return this.customers; // In mock, return all customers for simplicity or filter if field exists
  }
  getRepIssues(repId: string) {
      return this.orders.filter(o => o.issue && o.issue.status === 'Open');
  }

  // Forms
  getFormTemplate(role: UserRole) { return this.formTemplates[role]; }
  updateFormTemplate(role: UserRole, template: OnboardingFormTemplate) { this.formTemplates[role] = template; }

  // Pricing Rules
  getPricingRules(ownerId: string, productId: string) {
      return this.pricingRules.filter(r => r.ownerId === ownerId && r.productId === productId);
  }
  savePricingRules(rules: PricingRule[]) {
      // Remove existing for this product/owner
      if (rules.length > 0) {
          this.pricingRules = this.pricingRules.filter(r => !(r.ownerId === rules[0].ownerId && r.productId === rules[0].productId));
          this.pricingRules.push(...rules);
      }
  }

  // Matcher
  findBuyersForProduct(productName: string) {
      // Return random customers for demo
      return this.customers.slice(0, 3);
  }

  // Notifications
  getNotifications(userId: string) {
      return this.notifications.filter(n => n.userId === userId).map(n => n.message);
  }
  addNotification(userId: string, message: string) {
      this.notifications.push({ userId, message });
  }
}

export const mockService = new MockDataService();
