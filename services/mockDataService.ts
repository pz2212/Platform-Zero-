
import { 
  User, UserRole, Product, InventoryItem, Order, Customer, 
  RegistrationRequest, Driver, Packer, Lead, SupplierPriceRequest,
  PricingRule, OnboardingFormTemplate, BusinessProfile,
  SupplierPriceRequestItem, AppNotification, ChatMessage, OrderItem
} from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Admin User', businessName: 'Platform Zero', role: UserRole.ADMIN, email: 'admin@pz.com' },
  { id: 'u2', name: 'Sarah Wholesaler', businessName: 'Fresh Wholesalers', role: UserRole.WHOLESALER, email: 'sarah@fresh.com', dashboardVersion: 'v2', activeSellingInterests: ['Tomatoes', 'Lettuce', 'Apples'], activeBuyingInterests: ['Potatoes', 'Carrots'], businessProfile: { isComplete: true } as any },
  { id: 'u3', name: 'Bob Farmer', businessName: 'Green Valley Farms', role: UserRole.FARMER, email: 'bob@greenvalley.com', dashboardVersion: 'v2', activeSellingInterests: ['Tomatoes', 'Eggplant'], businessProfile: { isComplete: true } as any },
  { id: 'u4', name: 'Alice Consumer', businessName: 'The Morning Cafe', role: UserRole.CONSUMER, email: 'alice@cafe.com' },
  { id: 'u5', name: 'Pippa', businessName: "Pippa's Farm", role: UserRole.WHOLESALER, email: 'alex@platformzerosolutions.com', dashboardVersion: 'v2', businessProfile: { isComplete: true, businessLocation: 'N/A' } as any },
  // DEMO SUPPLIERS
  { id: 's1', name: 'Jim Potato', businessName: 'Spud King Gippsland', role: UserRole.FARMER, email: 'jim@spuds.com', activeSellingInterests: ['Potatoes', 'Onions'] },
  { id: 's2', name: 'Kelly Citrus', businessName: 'Sunraysia Citrus Co', role: UserRole.FARMER, email: 'kelly@citrus.com', activeSellingInterests: ['Oranges', 'Lemons', 'Limes'] },
  { id: 's3', name: 'Mark Veg', businessName: 'Werribee Veggies', role: UserRole.WHOLESALER, email: 'mark@werribee.com', activeSellingInterests: ['Broccoli', 'Carrots', 'Cauliflower'] },
  { id: 's4', name: 'Fruit Direct', businessName: 'Tropical Imports QLD', role: UserRole.WHOLESALER, email: 'fruit@tropical.com', activeSellingInterests: ['Mangoes', 'Bananas', 'Pineapples'] },
  { id: 's5', name: 'Gourmet Growers', businessName: 'Mornington Microgreens', role: UserRole.FARMER, email: 'gourmet@micro.com', activeSellingInterests: ['Microgreens', 'Edible Flowers'] },
  
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
    { id: 'p5', name: 'Dutch Cream Potatoes', category: 'Vegetable', variety: 'Grade A', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 2.10, co2SavingsPerKg: 0.9 },
    { id: 'p6', name: 'Navel Oranges', category: 'Fruit', variety: 'Juicing', imageUrl: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 1.50, co2SavingsPerKg: 1.8 },
    { id: 'p7', name: 'Broccoli', category: 'Vegetable', variety: 'Heads', imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 3.20, co2SavingsPerKg: 1.4 },
    { id: 'p8', name: 'Carrots', category: 'Vegetable', variety: 'Bunched', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=100&h=100', defaultPricePerKg: 1.10, co2SavingsPerKg: 0.7 },
  ];
  private inventory: InventoryItem[] = [
    { id: 'i1', productId: 'p1', ownerId: 'u3', quantityKg: 500, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley' },
    { id: 'i2', productId: 'p2', ownerId: 'u2', quantityKg: 1000, expiryDate: new Date(Date.now() + 86400000 * 14).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', originalFarmerName: 'Bob\'s Spuds', harvestLocation: 'Gippsland' },
    { id: 'i3', productId: 'p4', ownerId: 'u2', quantityKg: 200, expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley' },
    // Inventory for Demo Suppliers
    { id: 'di1', productId: 'p5', ownerId: 's1', quantityKg: 5000, expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', harvestLocation: 'Gippsland' },
    { id: 'di2', productId: 'p6', ownerId: 's2', quantityKg: 2000, expiryDate: new Date(Date.now() + 86400000 * 10).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', harvestLocation: 'Mildura' },
    { id: 'di3', productId: 'p7', ownerId: 's3', quantityKg: 800, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', harvestLocation: 'Werribee' },
    { id: 'di4', productId: 'p8', ownerId: 's3', quantityKg: 1500, expiryDate: new Date(Date.now() + 86400000 * 12).toISOString(), harvestDate: new Date().toISOString(), status: 'Available', harvestLocation: 'Werribee' },
  ];
  private orders: Order[] = [];
  private customers: Customer[] = [
      { id: 'c1', businessName: 'Fresh Market Co', contactName: 'Sarah Johnson', category: 'Retail', commonProducts: 'Tomatoes, Lettuce, Apples', location: 'Richmond' },
      { id: 'c2', businessName: 'Healthy Eats', contactName: 'Chef Mario', category: 'Restaurant', commonProducts: 'Tomatoes, Eggplant, Broccoli', location: 'South Yarra' },
      { id: 'c3', businessName: 'The Pizza Place', contactName: 'Tony', category: 'Restaurant', commonProducts: 'Tomatoes, Onions, Herbs', location: 'Collingwood' },
      { id: 'c4', businessName: 'Melbourne Juice Bar', contactName: 'Lucy', category: 'Cafe', commonProducts: 'Apples, Oranges, Carrots', location: 'CBD' },
      { id: 'c5', businessName: 'St Johns Primary', contactName: 'Canteen Manager', category: 'Unassigned', commonProducts: 'Apples, Bananas, Lettuce', location: 'Hawthorn' },
      { id: 'c6', businessName: 'The Grand Hotel', contactName: 'Executive Chef', category: 'Pub', commonProducts: 'Potatoes, Carrots, Onions', location: 'Carlton' },
      { id: 'c7', businessName: 'Artisan Sourdough', contactName: 'Dave', category: 'Cafe', commonProducts: 'Tomatoes, Lettuce', location: 'Fitzroy' },
      { id: 'c8', businessName: 'Veggie Delights', contactName: 'Sam', category: 'Retail', commonProducts: 'Eggplant, Broccoli, Carrots', location: 'Brunswick' },
  ];
  private leads: Lead[] = [];
  private registrationRequests: RegistrationRequest[] = [];
  private drivers: Driver[] = [];
  private packers: Packer[] = [];
  private supplierPriceRequests: SupplierPriceRequest[] = [];
  private pricingRules: PricingRule[] = [];
  private notifications: AppNotification[] = [];
  private messages: ChatMessage[] = [];
  
  private formTemplates: Record<string, OnboardingFormTemplate> = {
      'CONSUMER': { role: UserRole.CONSUMER, sections: [] },
      'WHOLESALER': { role: UserRole.WHOLESALER, sections: [] },
      'FARMER': { role: UserRole.FARMER, sections: [] }
  };

  constructor() {
      // Initialize with base orders for the current user demos
      this.generateDemoOrders();

      try {
          const storedRequests = localStorage.getItem('pz_registrationRequests');
          if (storedRequests) this.registrationRequests = JSON.parse(storedRequests);
          
          const storedCustomers = localStorage.getItem('pz_customers');
          if (storedCustomers) {
              const parsed = JSON.parse(storedCustomers);
              if (parsed.length > 0) this.customers = parsed;
          }
          
          const storedOrders = localStorage.getItem('pz_orders');
          if (storedOrders) this.orders = JSON.parse(storedOrders);
          
          const storedProducts = localStorage.getItem('pz_products');
          if (storedProducts) this.products = JSON.parse(storedProducts);
          
          const storedUsers = localStorage.getItem('pz_users');
          if (storedUsers) this.users = JSON.parse(storedUsers);
          
          const storedNotifs = localStorage.getItem('pz_notifications');
          if (storedNotifs) this.notifications = JSON.parse(storedNotifs);

          const storedPriceReqs = localStorage.getItem('pz_supplierPriceRequests');
          if (storedPriceReqs) this.supplierPriceRequests = JSON.parse(storedPriceReqs);

          const storedMessages = localStorage.getItem('pz_chat_messages');
          if (storedMessages) this.messages = JSON.parse(storedMessages);

          const storedForms = localStorage.getItem('pz_form_templates');
          if (storedForms) this.formTemplates = JSON.parse(storedForms);
      } catch (e) {
          console.error("Failed to load mock data from storage", e);
      }
  }

  private generateDemoOrders() {
      const today = new Date();
      const sellerIds = ['u2', 'u3', 's1', 's2', 's3'];
      const buyerIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'u4'];
      
      // Create 40 orders spread across the last 30 days
      for (let i = 0; i < 40; i++) {
          const date = new Date();
          date.setDate(today.getDate() - (i % 30));
          // Mix hours
          date.setHours(8 + (i % 10), (i * 13) % 60);

          const sellerId = sellerIds[i % sellerIds.length];
          const buyerId = buyerIds[i % buyerIds.length];
          const itemCount = 1 + (i % 4);
          
          const items: OrderItem[] = [];
          for (let j = 0; j < itemCount; j++) {
              const p = this.products[j % this.products.length];
              items.push({
                  productId: p.id,
                  quantityKg: 10 + (j * 5),
                  pricePerKg: p.defaultPricePerKg
              });
          }

          const total = items.reduce((s, item) => s + (item.quantityKg * item.pricePerKg), 0);

          this.orders.push({
              id: `o-demo-${i}`,
              buyerId,
              sellerId,
              items,
              totalAmount: total,
              status: i < 5 ? 'Pending' : 'Delivered',
              date: date.toISOString(),
              paymentStatus: i % 3 === 0 ? 'Paid' : 'Unpaid',
              // Fix line 150: Type '"card"' is not assignable to type '"pay_now" | "invoice" | "amex"'.
              paymentMethod: i % 2 === 0 ? 'invoice' : 'pay_now',
              deliveredAt: i >= 5 ? date.toISOString() : undefined
          });
      }
  }

  private persistData() {
    try {
        localStorage.setItem('pz_registrationRequests', JSON.stringify(this.registrationRequests));
        localStorage.setItem('pz_customers', JSON.stringify(this.customers));
        localStorage.setItem('pz_orders', JSON.stringify(this.orders));
        localStorage.setItem('pz_products', JSON.stringify(this.products));
        localStorage.setItem('pz_users', JSON.stringify(this.users));
        localStorage.setItem('pz_notifications', JSON.stringify(this.notifications));
        localStorage.setItem('pz_supplierPriceRequests', JSON.stringify(this.supplierPriceRequests));
        localStorage.setItem('pz_chat_messages', JSON.stringify(this.messages));
        localStorage.setItem('pz_form_templates', JSON.stringify(this.formTemplates));
    } catch (e) {
        console.error("Failed to persist mock data", e);
    }
  }

  // --- CHAT SYSTEM ---
  getChatMessages(userId1: string, userId2: string): ChatMessage[] {
    return this.messages.filter(m => 
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  sendChatMessage(senderId: string, receiverId: string, text: string, isProductLink = false, productId?: string) {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      isProductLink,
      productId
    };
    this.messages.push(newMessage);
    this.persistData();
    return newMessage;
  }

  deleteUser(userId: string) {
      this.users = this.users.filter(u => u.id !== userId);
      this.customers = this.customers.filter(c => c.id !== userId);
      this.persistData();
  }

  deleteRegistrationRequest(requestId: string) {
      this.registrationRequests = this.registrationRequests.filter(r => r.id !== requestId);
      this.persistData();
  }

  getAppNotifications(userId: string) {
      return this.notifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addAppNotification(userId: string, title: string, message: string, type: AppNotification['type'], link?: string) {
      const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId,
          title,
          message,
          type,
          timestamp: new Date().toISOString(),
          isRead: false,
          link
      };
      this.notifications.push(newNotif);
      this.persistData();
  }

  markNotificationAsRead(notifId: string) {
      const n = this.notifications.find(x => x.id === notifId);
      if (n) {
          n.isRead = true;
          this.persistData();
      }
  }

  markAllNotificationsRead(userId: string) {
      this.notifications.forEach(n => {
          if (n.userId === userId) n.isRead = true;
      });
      this.persistData();
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
      customerType: string,
      role?: UserRole
  }) {
      const id = `u-man-${Date.now()}`;
      let role = data.role;
      
      if (!role) {
          role = data.type === 'Buyer' ? UserRole.CONSUMER : UserRole.WHOLESALER;
      }
      
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
              isComplete: false 
          }
      };

      this.users.push(newUser);

      if (role === UserRole.CONSUMER) {
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
      this.addAppNotification(sellerId, 'New Order Received', `Order #${newOrder.id.split('-')[1]} received from ${logistics.contactName || 'Buyer'}. Action required.`, 'ORDER', '/');
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
      this.addAppNotification(item.ownerId, 'Instant Sale Recorded', `Quantity of ${quantity}kg sold via Direct Link.`, 'ORDER', '/');
      this.persistData();
  }

  deliverOrder(orderId: string, deliveredBy: string, photoUrl: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Delivered';
          order.deliveredAt = new Date().toISOString();
          order.deliveryDriverName = deliveredBy;
          order.deliveryPhotoUrl = photoUrl;
          this.addAppNotification(order.buyerId, 'Order Delivered', `Order #${order.id.split('-')[1]} has been delivered by ${deliveredBy}.`, 'ORDER', '/orders');
          this.persistData();
      }
  }

  acceptOrderV2(orderId: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Confirmed';
          this.addAppNotification('u1', 'Order Acceptance', `Partner confirmed fulfillment for Order #${orderId.split('-')[1] || orderId}.`, 'SYSTEM', '/');
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

    const newUser: User = {
      id: inviteId,
      name: data.name,
      businessName: data.businessName,
      email: data.email.toLowerCase(),
      role: data.role,
      dashboardVersion: 'v2',
      businessProfile: { isComplete: false } as any
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
          this.persistData();
      }
  }

  getLeads() { return this.leads; }
  getAllSupplierPriceRequests() { return this.supplierPriceRequests; }
  getSupplierPriceRequests(supplierId: string) { return this.supplierPriceRequests.filter(r => r.supplierId === supplierId); }
  createSupplierPriceRequest(req: SupplierPriceRequest) { 
      this.supplierPriceRequests.push(req); 
      this.persistData(); 
  }
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
              connectionStatus: 'Active',
              joinedDate: new Date().toISOString(),
              connectedSupplierId: req.supplierId
          };
          this.customers.push(newCustomer);
          this.persistData();
          return newCustomer;
      }
      return null;
  }

  getRepStats(repId: string) {
      return { totalSales: 15400, commissionMade: 770, commissionComing: 320, customerCount: 12, orders: this.orders };
  }

  getRepCustomers(repId: string) { return this.customers.filter(c => c.assignedPzRepId === repId); }
  getFormTemplate(role: UserRole) { return this.formTemplates[role]; }
  getPricingRules(ownerId: string, productId: string) { return this.pricingRules.filter(r => r.ownerId === ownerId && r.productId === productId); }
  savePricingRules(rules: PricingRule[]) {
      if (rules.length > 0) {
          this.pricingRules = this.pricingRules.filter(r => !(r.ownerId === rules[0].ownerId && r.productId === rules[0].productId));
          this.pricingRules.push(...rules);
          this.persistData();
      }
  }

  findBuyersForProduct(productName: string) {
      return this.customers.filter(c => c.commonProducts?.toLowerCase().includes(productName.toLowerCase())).slice(0, 8);
  }

  // --- FIXES: ADDING MISSING METHODS ---

  /**
   * Adds a new customer to the marketplace list.
   */
  addMarketplaceCustomer(customer: Customer) {
      this.customers.push(customer);
      this.persistData();
  }

  /**
   * Updates an onboarding form template for a specific role.
   */
  updateFormTemplate(role: UserRole, template: OnboardingFormTemplate) {
      this.formTemplates[role] = template;
      this.persistData();
  }

  /**
   * Returns orders assigned to a specific driver.
   */
  getDriverOrders(driverId: string) {
      return this.orders.filter(o => o.logistics?.driverId === driverId);
  }

  /**
   * Returns orders assigned to a specific packer.
   */
  getPackerOrders(packerId: string) {
      return this.orders.filter(o => o.packerId === packerId);
  }

  /**
   * Rejects a registration request by ID.
   */
  rejectRegistration(id: string) {
      const req = this.registrationRequests.find(r => r.id === id);
      if (req) {
          req.status = 'Rejected';
          this.persistData();
      }
  }

  /**
   * Simulates sending onboarding communications to a customer.
   */
  sendOnboardingComms(customerId: string) {
      const customer = this.customers.find(c => c.id === customerId);
      if (customer) {
          this.addAppNotification(
              customer.id, 
              'Welcome to Platform Zero', 
              'Your portal is ready! Click here to finalize your setup and terms.', 
              'SYSTEM', 
              '/settings'
          );
      }
  }

  /**
   * Returns all active issues for a PZ Representative's assigned customers.
   */
  getRepIssues(repId: string) {
      const myCustomerIds = this.customers.filter(c => c.assignedPzRepId === repId).map(c => c.id);
      return this.orders.filter(o => myCustomerIds.includes(o.buyerId) && o.issue);
  }

  /**
   * Confirms an order and assigns fulfillment team (V1 flow).
   */
  confirmOrderV1(orderId: string, items: OrderItem[], packerId: string, packerName?: string, driverId?: string, driverName?: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Confirmed';
          order.packerId = packerId;
          order.packerName = packerName;
          if (!order.logistics) {
              order.logistics = { method: 'LOGISTICS' };
          }
          order.logistics.driverId = driverId;
          order.logistics.driverName = driverName;
          this.persistData();
      }
  }

  /**
   * Marks order items as verified or reported with issues by a consumer.
   */
  verifyOrder(orderId: string, issues: {itemId: string, type: string, action: string}[]) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          if (issues.length > 0) {
              const firstIssue = issues[0];
              order.issue = {
                  type: firstIssue.type as any,
                  description: `Issue with item ${firstIssue.itemId}. Requested: ${firstIssue.action}`,
                  reportedAt: new Date().toISOString(),
                  deadline: new Date(Date.now() + 86400000).toISOString(),
                  requestedResolution: 'Credit',
                  status: 'Open'
              };
          }
          this.persistData();
      }
  }
}

export const mockService = new MockDataService();
