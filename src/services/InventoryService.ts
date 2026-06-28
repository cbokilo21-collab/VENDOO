// ─── Inventory Management Service ─────────────────────────────────────────────
// Advanced inventory management with alerts, low stock warnings, and auto-reordering

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  location: string;
  lastUpdated: string;
  costPerUnit: number;
  supplier?: string;
  leadTimeDays?: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface StockAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring_soon';
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment' | 'return' | 'transfer';
  quantity: number;
  reason: string;
  userId: string;
  location: string;
  timestamp: string;
  reference?: string;
}

class InventoryService {
  private inventory: Map<string, InventoryItem> = new Map();
  private alerts: StockAlert[] = [];
  private movements: StockMovement[] = [];
  private listeners: Set<(alerts: StockAlert[]) => void> = new Set();

  // ─── Inventory Management ─────────────────────────────────────────────────────
  
  addInventory(item: InventoryItem): void {
    this.inventory.set(item.id, item);
    this.checkStockLevels(item);
  }

  updateStock(productId: string, quantity: number, reason: string, userId: string): void {
    const item = this.inventory.get(productId);
    if (!item) return;

    const oldQuantity = item.quantity;
    item.quantity = quantity;
    item.lastUpdated = new Date().toISOString();

    // Record movement
    const movement: StockMovement = {
      id: `MOV-${Date.now()}`,
      productId,
      productName: item.productName,
      type: quantity > oldQuantity ? 'in' : 'out',
      quantity: Math.abs(quantity - oldQuantity),
      reason,
      userId,
      location: item.location,
      timestamp: new Date().toISOString(),
    };
    this.movements.unshift(movement);

    this.checkStockLevels(item);
  }

  adjustStock(productId: string, adjustment: number, reason: string, userId: string): void {
    const item = this.inventory.get(productId);
    if (!item) return;

    item.quantity += adjustment;
    item.lastUpdated = new Date().toISOString();

    const movement: StockMovement = {
      id: `MOV-${Date.now()}`,
      productId,
      productName: item.productName,
      type: 'adjustment',
      quantity: Math.abs(adjustment),
      reason,
      userId,
      location: item.location,
      timestamp: new Date().toISOString(),
    };
    this.movements.unshift(movement);

    this.checkStockLevels(item);
  }

  // ─── Stock Level Checks ───────────────────────────────────────────────────────

  private checkStockLevels(item: InventoryItem): void {
    // Low stock alert
    if (item.quantity <= item.reorderPoint && item.quantity > 0) {
      this.createAlert({
        id: `ALT-${Date.now()}`,
        type: 'low_stock',
        productId: item.id,
        productName: item.productName,
        currentStock: item.quantity,
        threshold: item.reorderPoint,
        severity: item.quantity <= item.reorderPoint * 0.5 ? 'high' : 'medium',
        message: `Stock faible: ${item.productName} (${item.quantity} unités restantes)`,
        createdAt: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Out of stock alert
    if (item.quantity === 0) {
      this.createAlert({
        id: `ALT-${Date.now()}`,
        type: 'out_of_stock',
        productId: item.id,
        productName: item.productName,
        currentStock: 0,
        threshold: item.reorderPoint,
        severity: 'critical',
        message: `Rupture de stock: ${item.productName}`,
        createdAt: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Overstock alert (more than 3x reorder point)
    if (item.quantity > item.reorderPoint * 3) {
      this.createAlert({
        id: `ALT-${Date.now()}`,
        type: 'overstock',
        productId: item.id,
        productName: item.productName,
        currentStock: item.quantity,
        threshold: item.reorderPoint * 3,
        severity: 'low',
        message: `Surstock: ${item.productName} (${item.quantity} unités)`,
        createdAt: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Expiring soon alert
    if (item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        this.createAlert({
          id: `ALT-${Date.now()}`,
          type: 'expiring_soon',
          productId: item.id,
          productName: item.productName,
          currentStock: item.quantity,
          threshold: 30,
          severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
          message: `Expiration proche: ${item.productName} expire dans ${daysUntilExpiry} jours`,
          createdAt: new Date().toISOString(),
          acknowledged: false,
        });
      }
    }
  }

  private createAlert(alert: StockAlert): void {
    // Check if similar alert already exists and not acknowledged
    const existingAlert = this.alerts.find(
      a => a.productId === alert.productId && 
           a.type === alert.type && 
           !a.acknowledged
    );
    
    if (!existingAlert) {
      this.alerts.unshift(alert);
      this.notifyListeners();
    }
  }

  // ─── Auto-Reorder Suggestions ─────────────────────────────────────────────────

  getReorderSuggestions(): Array<{ item: InventoryItem; suggestedQuantity: number; reason: string }> {
    const suggestions: Array<{ item: InventoryItem; suggestedQuantity: number; reason: string }> = [];
    
    this.inventory.forEach(item => {
      if (item.quantity <= item.reorderPoint) {
        suggestions.push({
          item,
          suggestedQuantity: item.reorderQuantity,
          reason: `Stock actuel (${item.quantity}) en dessous du point de réapprovisionnement (${item.reorderPoint})`,
        });
      }
    });

    return suggestions.sort((a, b) => a.item.quantity - b.item.quantity);
  }

  // ─── Reporting ───────────────────────────────────────────────────────────────

  getInventoryValue(): number {
    let total = 0;
    this.inventory.forEach(item => {
      total += item.quantity * item.costPerUnit;
    });
    return total;
  }

  getLowStockItems(): InventoryItem[] {
    return Array.from(this.inventory.values())
      .filter(item => item.quantity <= item.reorderPoint)
      .sort((a, b) => a.quantity - b.quantity);
  }

  getMovements(productId?: string, limit: number = 50): StockMovement[] {
    if (productId) {
      return this.movements.filter(m => m.productId === productId).slice(0, limit);
    }
    return this.movements.slice(0, limit);
  }

  // ─── Alert Management ─────────────────────────────────────────────────────────

  getAlerts(): StockAlert[] {
    return this.alerts;
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.notifyListeners();
    }
  }

  acknowledgeAllAlerts(): void {
    this.alerts.forEach(a => a.acknowledged = true);
    this.notifyListeners();
  }

  // ─── Event Listeners ─────────────────────────────────────────────────────────

  subscribe(listener: (alerts: StockAlert[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.alerts));
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  getStockTurnoverRate(productId: string, days: number = 30): number {
    const item = this.inventory.get(productId);
    if (!item) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const movements = this.movements.filter(
      m => m.productId === productId && 
           m.type === 'out' && 
           new Date(m.timestamp) >= cutoffDate
    );

    const totalSold = movements.reduce((sum, m) => sum + m.quantity, 0);
    const averageStock = item.quantity + (totalSold / 2);
    
    return averageStock > 0 ? (totalSold / averageStock) * (30 / days) : 0;
  }

  getPredictedStockoutDate(productId: string): Date | null {
    const item = this.inventory.get(productId);
    if (!item || item.quantity === 0) return null;

    const turnoverRate = this.getStockTurnoverRate(productId);
    if (turnoverRate === 0) return null;

    const daysUntilStockout = item.quantity / turnoverRate;
    const stockoutDate = new Date();
    stockoutDate.setDate(stockoutDate.getDate() + Math.floor(daysUntilStockout));
    
    return stockoutDate;
  }
}

export const inventoryService = new InventoryService();
