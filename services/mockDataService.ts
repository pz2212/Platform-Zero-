
import { 
  User, UserRole, Product, InventoryItem, Order, Customer, 
  RegistrationRequest, Driver, Packer, Lead, SupplierPriceRequest,
  PricingRule, OnboardingFormTemplate, BusinessProfile,
  SupplierPriceRequestItem
} from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Admin User', businessName: 'Platform Zero', role: UserRole.ADMIN, email: 'admin@pz.com' },
  { id: 'u2', name: 'Sarah Wholesaler', businessName: 'Fresh Wholesalers', role: UserRole.WHOLESALER, email: 'sarah@fresh.com', dashboardVersion: 'v2', businessProfile: { isComplete: true } as any },
  { id: 'u3', name: 'Bob Farmer', businessName: 'Green Valley Farms', role: UserRole.FARMER, email: 'bob@greenvalley.com', dashboardVersion: 'v2', businessProfile: { isComplete: true } as any },
  { id: 'u4', name: 'Alice Consumer', businessName: 'The Morning Cafe', role: UserRole.CONSUMER, email: 'alice@cafe.com' },
  { id: 'rep1', name: 'Rep User', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep1@pz.com', commissionRate: 5.0 },
  { id: 'd1', name: 'Dave Driver', businessName: 'Fresh Wholesalers', role: UserRole.DRIVER, email: 'dave@fresh.com' }
];

class MockDataService {
  private users: User[] = [...USERS];
  private products: Product[] = [
    { id: 'p1', name: 'Organic Tomatoes', category: 'Vegetable', variety: 'Roma', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 4.50, co2SavingsPerKg: 1.2 },
    { id: 'p2', name: 'Fresh Lettuce', category: 'Vegetable', variety: 'Cos', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 1.20, co2SavingsPerKg: 0.8 },
    { id: 'p3', name: 'Apples', category: 'Fruit', variety: 'Pink Lady', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 3.80, co2SavingsPerKg: 1.5 },
    { id: 'p4', name: 'Eggplants', category: 'Vegetable', variety: 'Black Beauty', imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 5.50, co2SavingsPerKg: 1.1 },
  ];
  private inventory: InventoryItem[] = [
    { id: 'i1', productId: 'p1', ownerId: 'u3', quantityKg: 500, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley' },
    { id: 'i2', productId: 'p2', ownerId: 'u2', quantityKg: 1000, expiryDate: new Date(Date.now() + 86400000 * 14).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', originalFarmerName: 'Bob\'s Spuds', harvestLocation: 'Gippsland' },
    { id: 'i3', productId: 'p4', ownerId: 'u2', quantityKg: 200, expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley' },
  ];
  private orders: Order[] = [
    { 
        id: 'o-1001', buyerId: 'c1', sellerId: 'u2', items: [{ productId: 'p1', quantityKg: 25, pricePerKg: 4.50 }, { productId: 'p2', quantityKg: 10, pricePerKg: 1.20 }], totalAmount: 245.50, status: 'Pending', date: new Date().toISOString(), priority: 'HIGH', customerNotes: 'Please ensure fresh quality for restaurant use. Customer needs delivery by 8 AM.',
        logistics: { method: 'LOGISTICS', deliveryLocation: 'Fresh Market Co - 123 Main St' },
        paymentStatus: 'Unpaid'
    },
    { 
        id: 'o-1002', buyerId: 'c2', sellerId: 'u2', items: [{ productId: 'p1', quantityKg: 50, pricePerKg: 4.50 }, { productId: 'p2', quantityKg: 20, pricePerKg: 1.20 }, { productId: 'p4', quantityKg: 15, pricePerKg: 5.50 }], totalAmount: 412.75, status: 'Pending', date: new Date(Date.now() - 15 * 60000).toISOString(), priority: 'URGENT', customerNotes: 'Urgent order for today\'s lunch prep. Quality must be restaurant grade.',
        logistics: { method: 'LOGISTICS', deliveryLocation: 'Healthy Eats - 456 Green Ave' },
        paymentStatus: 'Unpaid'
    }
  ];
  private customers: Customer[] = [
      { id: 'c1', businessName: 'Fresh Market Co', contactName: 'Sarah Johnson', email: 'orders@freshmarket.com', phone: '0400 123 456', category: 'Retail', connectionStatus: 'Active', connectedSupplierName: 'Fresh Wholesalers', connectedSupplierId: 'u2', connectedSupplierRole: 'Wholesaler', pricingStatus: 'Approved', joinedDate: '2023-01-15', pzMarkup: 15 },
      { id: 'c2', businessName: 'Healthy Eats Restaurant', contactName: 'Chef Mario', email: 'mario@healthyeats.com', phone: '0400 333 444', category: 'Restaurant', connectionStatus: 'Active', connectedSupplierName: 'Fresh Wholesalers', connectedSupplierId: 'u2', connectedSupplierRole: 'Wholesaler', pricingStatus: 'Approved', joinedDate: '2023-02-10', pzMarkup: 12 }
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
  
  private formTemplates: Record<string, OnboardingFormTemplate> = {
      'CONSUMER': { role: UserRole.CONSUMER, sections: [{ id: 's1', title: 'Basic Info', fields: [{ id: 'f1', label: 'Business Name', type: 'text', required: true }] }] },
      'WHOLESALER': { role: UserRole.WHOLESALER, sections: [] },
      'FARMER': { role: UserRole.FARMER, sections: [] }
  };

  constructor() {
      try {
          const storedRequests = localStorage.getItem('pz_registrationRequests');
          if (storedRequests) this.registrationRequests = JSON.parse(storedRequests);
          const storedCustomers = localStorage.getItem('pz_customers');
          if (storedCustomers) this.customers = JSON.parse(storedCustomers);
          const storedOrders = localStorage.getItem('pz_orders');
          if (storedOrders) this.orders = JSON.parse(storedOrders);
          const storedProducts = localStorage.getItem('pz_products');
          if (storedProducts) this.products = JSON.parse(storedProducts);
          const storedUsers = localStorage.getItem('pz_users');
          if (storedUsers) this.users = JSON.parse(storedUsers);
      } catch (e) {
          console.error("Failed to load mock data from storage", e);
      }
  }

  private persistData() {
    try {
        localStorage.setItem('pz_registrationRequests', JSON.stringify(this.registrationRequests));
        localStorage.setItem('pz_customers', JSON.stringify(this.customers));
        localStorage.setItem('pz_orders', JSON.stringify(this.orders));
        localStorage.setItem('pz_products', JSON.stringify(this.products));
        localStorage.setItem('pz_users', JSON.stringify(this.users));
    } catch (e) {
        console.error("Failed to persist mock data", e);
    }
  }

  getAllUsers() { return this.users; }
  getCustomers() { return this.customers; }
  getWholesalers() { return this.users.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER); }
  getPzRepresentatives() { return this.users.filter(u => u.role === UserRole.PZ_REP); }
  addEmployee(user: User) { this.users.push(user); this.persistData(); }
  updateUserVersion(userId: string, version: 'v1' | 'v2') {
      const user = this.users.find(u => u.id === userId);
      if (user) user.dashboardVersion = version;
      this.persistData();
  }
  updateUserV1Details(userId: string, details: any) {
      const user = this.users.find(u => u.id === userId);
      if (user) Object.assign(user, details);
      this.persistData();
  }
  updateBusinessProfile(userId: string, profile: BusinessProfile) {
      const user = this.users.find(u => u.id === userId);
      if (user) {
        user.businessProfile = { ...profile, isComplete: true };
        if (user.role === UserRole.CONSUMER) {
          const exists = this.customers.find(c => c.id === user.id);
          if (!exists) {
            this.customers.push({
              id: user.id,
              businessName: profile.tradingName || profile.companyName,
              contactName: profile.directorName,
              email: user.email,
              category: 'Restaurant',
              connectionStatus: 'Active',
              joinedDate: new Date().toISOString()
            });
          }
        }
      }
      this.persistData();
  }

  onboardNewBusiness(data: {
      type: 'Buyer' | 'Supplier',
      businessName: string,
      email: string,
      phone: string,
      abn: string,
      address: string,
      customerType: string
  }) {
      const id = `u-man-${Date.now()}`;
      const role = data.type === 'Buyer' ? UserRole.CONSUMER : UserRole.WHOLESALER;
      
      const newUser: User = {
          id,
          name: data.businessName,
          businessName: data.businessName,
          email: data.email.toLowerCase(),
          role,
          dashboardVersion: 'v2',
          businessProfile: {
              companyName: data.businessName,
              tradingName: data.businessName,
              abn: data.abn,
              businessLocation: data.address,
              directorName: 'Pending',
              businessMobile: data.phone,
              email: data.email.toLowerCase(),
              accountsEmail: data.email.toLowerCase(),
              accountsMobile: data.phone,
              tradingDaysHours: '',
              productsSold: '',
              hasLogistics: null,
              bankName: '',
              bsb: '',
              accountNumber: '',
              agreeTo14DayTerms: false,
              agreeTo20PercentDiscount: null,
              acceptedTandCs: false,
              isComplete: false // MUST COMPLETE DOCUMENTS IN THEIR PORTAL
          }
      };

      this.users.push(newUser);

      if (data.type === 'Buyer') {
          const customer: Customer = {
              id: `c-man-${Date.now()}`,
              businessName: data.businessName,
              contactName: 'Pending Setup',
              email: data.email.toLowerCase(),
              phone: data.phone,
              category: data.customerType as any,
              abn: data.abn,
              location: data.address,
              connectionStatus: 'Pending Connection',
              joinedDate: new Date().toISOString()
          };
          this.customers.push(customer);
      }

      this.persistData();
      return newUser;
  }

  updateCustomerMarkup(customerId: string, markup: number) {
      const customer = this.customers.find(c => c.id === customerId);
      if (customer) {
          customer.pzMarkup = markup;
          this.persistData();
      }
  }

  updateCustomerSupplier(customerId: string, supplierId: string) {
      const customer = this.customers.find(c => c.id === customerId);
      const supplier = this.users.find(u => u.id === supplierId);
      if (customer && supplier) {
          customer.connectedSupplierId = supplier.id;
          customer.connectedSupplierName = supplier.businessName;
          customer.connectedSupplierRole = supplier.role === UserRole.FARMER ? 'Farmer' : 'Wholesaler';
          customer.connectionStatus = 'Active';
          this.persistData();
      }
  }

  updateCustomerRep(customerId: string, repId: string) {
      const customer = this.customers.find(c => c.id === customerId);
      const rep = this.users.find(u => u.id === repId);
      if (customer && rep) {
          customer.assignedPzRepId = rep.id;
          customer.assignedPzRepName = rep.name;
          this.persistData();
      }
  }

  updateUserInterests(userId: string, selling: string[], buying: string[]) {
      const user = this.users.find(u => u.id === userId);
      if (user) {
          user.activeSellingInterests = selling;
          user.activeBuyingInterests = buying;
      }
      this.persistData();
  }

  getAllProducts() { return this.products; }
  getProduct(id: string) { return this.products.find(p => p.id === id); }
  addProduct(product: Product) { this.products.push(product); this.persistData(); }
  updateProductPrice(id: string, price: number) {
      const product = this.products.find(p => p.id === id);
      if (product) product.defaultPricePerKg = price;
      this.persistData();
  }
  deleteProduct(id: string) { this.products = this.products.filter(p => p.id !== id); this.persistData(); }

  getInventory(userId: string) { return this.inventory.filter(i => i.ownerId === userId); }
  getAllInventory() { return this.inventory; }
  getInventoryByOwner(ownerId: string) { return this.inventory.filter(i => i.ownerId === ownerId); }
  addInventoryItem(item: InventoryItem) { this.inventory.push(item); this.persistData(); }
  updateInventoryStatus(itemId: string, status: any) {
      const item = this.inventory.find(i => i.id === itemId);
      if (item) item.status = status;
      this.persistData();
  }
  
  verifyPrice(itemId: string, newPrice?: number) {
    const item = this.inventory.find(i => i.id === itemId);
    if (item) {
        item.lastPriceVerifiedDate = new Date().toLocaleDateString();
        if (newPrice !== undefined) {
            this.updateProductPrice(item.productId, newPrice);
        }
        this.persistData();
    }
  }

  searchGlobalInventory(query: string, excludeUserId: string) {
      const lowerQuery = query.toLowerCase();
      return this.inventory.filter(i => 
          i.ownerId !== excludeUserId && 
          i.status === 'Available' && 
          (this.getProduct(i.productId)?.name.toLowerCase().includes(lowerQuery) || false)
      );
  }

  getDrivers(userId: string) { return this.drivers.filter(d => d.wholesalerId === userId); }
  addDriver(driver: Driver) { this.drivers.push(driver); this.persistData(); }
  getPackers(userId: string) { return this.packers.filter(p => p.wholesalerId === userId); }
  addPacker(packer: Packer) { this.packers.push(packer); this.persistData(); }

  getOrders(userId: string) { 
      if (userId === 'u1') return this.orders;
      return this.orders.filter(o => o.buyerId === userId || o.sellerId === userId || (o.logistics?.driverId && userId.startsWith('d')));
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
      this.persistData();
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
          logistics: { method: 'LOGISTICS', deliveryLocation: 'Buyer Location' },
          paymentStatus: 'Unpaid',
          paymentMethod: 'invoice'
      };
      this.orders.push(newOrder);
      this.addNotification(item.ownerId, "Instant Order received!");
      this.persistData();
  }

  markOrderDelivered(orderId: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Delivered';
          order.deliveredAt = new Date().toISOString();
          this.persistData();
      }
  }

  deliverOrder(orderId: string, deliveredBy: string, photoUrl: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Delivered';
          order.deliveredAt = new Date().toISOString();
          order.deliveryDriverName = deliveredBy;
          order.deliveryPhotoUrl = photoUrl;
          this.persistData();
      }
  }

  acceptOrderV2(orderId: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Confirmed';
          this.addNotification('u1', `Partner confirmed fulfillment for Order #${orderId.split('-')[1] || orderId}`);
          this.persistData();
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
          this.persistData();
      }
  }

  packOrder(orderId: string, packerName: string, driverId?: string, driverName?: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Ready for Delivery';
          order.packedAt = new Date().toISOString();
          if (packerName && !order.packerName) order.packerName = packerName;
          if (driverId) {
              order.logistics = { ...order.logistics!, driverId, driverName };
          }
          this.persistData();
      }
  }

  verifyOrder(orderId: string, issues: any[]) {
      console.log(`Order ${orderId} verified with issues:`, issues);
  }

  getRegistrationRequests() { return this.registrationRequests; }
  
  createManualInvite(data: any) {
    const inviteId = `invite-${Date.now()}`;
    const req: RegistrationRequest = {
        id: inviteId,
        name: data.name,
        businessName: data.businessName,
        email: data.email.toLowerCase(),
        requestedRole: data.role,
        submittedDate: new Date().toISOString(),
        status: 'Pending',
        details: 'Admin Invitation',
        consumerData: data.role === UserRole.CONSUMER ? {
            mobile: data.mobile || '',
            location: data.location || '',
            weeklySpend: 0,
            orderFrequency: 'Weekly'
        } : undefined
    };
    this.registrationRequests.push(req);

    // Also create a temporary user record so they can "log in" immediately
    const newUser: User = {
      id: inviteId,
      name: data.name,
      businessName: data.businessName,
      email: data.email.toLowerCase(),
      role: data.role,
      dashboardVersion: 'v2',
      businessProfile: {
          companyName: data.businessName,
          tradingName: data.businessName,
          abn: '',
          businessLocation: '',
          directorName: data.name,
          businessMobile: data.mobile,
          email: data.email.toLowerCase(),
          accountsEmail: data.email.toLowerCase(),
          accountsMobile: data.mobile,
          tradingDaysHours: '',
          productsSold: '',
          hasLogistics: null,
          bankName: '',
          bsb: '',
          accountNumber: '',
          agreeTo14DayTerms: false,
          agreeTo20PercentDiscount: null,
          acceptedTandCs: false,
          isComplete: false
      }
    };
    this.users.push(newUser);

    this.persistData();
    return req;
  }

  submitConsumerSignup(data: any) {
      const req: RegistrationRequest = {
          id: `req-${Date.now()}`,
          name: data.name,
          businessName: data.businessName,
          email: data.email.toLowerCase(),
          requestedRole: UserRole.CONSUMER,
          submittedDate: new Date().toISOString(),
          status: 'Pending',
          consumerData: { ...data }
      };
      this.registrationRequests.push(req);
      this.persistData();
  }

  approveRegistration(id: string) {
      const req = this.registrationRequests.find(r => r.id === id);
      if (req) {
          req.status = 'Approved';
          
          // Ensure user account exists
          let user = this.users.find(u => u.email.toLowerCase() === req.email.toLowerCase());
          if (!user) {
              user = {
                id: `u-${Date.now()}`,
                name: req.name,
                businessName: req.businessName,
                email: req.email.toLowerCase(),
                role: req.requestedRole,
                dashboardVersion: 'v2',
                businessProfile: {
                    companyName: req.businessName,
                    tradingName: req.businessName,
                    abn: '',
                    businessLocation: '',
                    directorName: req.name,
                    businessMobile: '',
                    email: req.email.toLowerCase(),
                    accountsEmail: req.email.toLowerCase(),
                    accountsMobile: '',
                    tradingDaysHours: '',
                    productsSold: '',
                    hasLogistics: null,
                    bankName: '',
                    bsb: '',
                    accountNumber: '',
                    agreeTo14DayTerms: false,
                    agreeTo20PercentDiscount: null,
                    acceptedTandCs: false,
                    isComplete: false
                }
              };
              this.users.push(user);
          }

          // If they are a consumer, add to marketplace customers list if not there
          if (user.role === UserRole.CONSUMER) {
            const exists = this.customers.find(c => c.id === user!.id);
            if (!exists) {
              this.customers.push({
                id: user.id,
                businessName: req.businessName,
                contactName: req.name,
                email: req.email.toLowerCase(),
                category: 'Restaurant',
                connectionStatus: 'Pending Connection',
                joinedDate: new Date().toISOString()
              });
            }
          }
          this.persistData();
      }
  }

  rejectRegistration(id: string) {
      const req = this.registrationRequests.find(r => r.id === id);
      if (req) {
          req.status = 'Rejected';
          this.persistData();
      }
  }

  addMarketplaceCustomer(customer: Customer) {
      this.customers.push(customer);
      this.persistData();
  }

  updateCustomerDetails(id: string, updates: Partial<Customer>) {
      const c = this.customers.find(x => x.id === id);
      if (c) {
          Object.assign(c, updates);
          this.persistData();
      }
  }

  getLeads() { return this.leads; }
  removeLead(id: string) { this.leads = this.leads.filter(l => l.id !== id); this.persistData(); }

  getAllSupplierPriceRequests() { return this.supplierPriceRequests; }
  getSupplierPriceRequests(supplierId: string) { return this.supplierPriceRequests.filter(r => r.supplierId === supplierId); }
  createSupplierPriceRequest(req: SupplierPriceRequest) { this.supplierPriceRequests.push(req); this.persistData(); }
  updateSupplierPriceRequest(id: string, updates: Partial<SupplierPriceRequest>) {
      const req = this.supplierPriceRequests.find(r => r.id === id);
      if (req) {
        Object.assign(req, updates);
        this.persistData();
      }
  }

  finalizeDeal(reqId: string) {
      const req = this.supplierPriceRequests.find(r => r.id === reqId);
      if (req) {
          req.status = 'WON';
          const newCustomer: Customer = {
              id: `c-won-${Date.now()}`,
              businessName: req.customerContext,
              contactName: 'Pending Setup',
              category: 'Restaurant',
              connectionStatus: 'Pending Connection',
              joinedDate: new Date().toISOString(),
              connectedSupplierId: req.supplierId,
              email: 'pending@setup.com'
          };
          this.customers.push(newCustomer);
          this.persistData();
          return newCustomer;
      }
      return null;
  }

  getRepStats(repId: string) {
      return {
          totalSales: 15400,
          commissionMade: 770,
          commissionComing: 320,
          customerCount: 12,
          orders: this.orders 
      };
  }

  getRepCustomers(repId: string) {
      return this.customers.filter(c => c.assignedPzRepId === repId);
  }

  getRepIssues(repId: string) {
      const myCustomerIds = this.customers.filter(c => c.assignedPzRepId === repId).map(c => c.id);
      return this.orders.filter(o => o.issue && o.issue.status === 'Open' && myCustomerIds.includes(o.buyerId));
  }

  getFormTemplate(role: UserRole) { return this.formTemplates[role]; }
  updateFormTemplate(role: UserRole, template: OnboardingFormTemplate) { this.formTemplates[role] = template; this.persistData(); }

  getPricingRules(ownerId: string, productId: string) {
      return this.pricingRules.filter(r => r.ownerId === ownerId && r.productId === productId);
  }

  savePricingRules(rules: PricingRule[]) {
      if (rules.length > 0) {
          this.pricingRules = this.pricingRules.filter(r => !(r.ownerId === rules[0].ownerId && r.productId === rules[0].productId));
          this.pricingRules.push(...rules);
          this.persistData();
      }
  }

  findBuyersForProduct(productName: string) {
      return this.customers.slice(0, 3);
  }

  getNotifications(userId: string) {
      return this.notifications.filter(n => n.userId === userId).map(n => n.message);
  }

  addNotification(userId: string, message: string) {
      this.notifications.push({ userId, message });
  }
}

export const mockService = new MockDataService();
