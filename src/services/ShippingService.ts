// ─── Shipping & Carrier Integration Service ───────────────────────────────────
// Advanced shipping management with carrier integration, tracking, and rate calculation

export interface Carrier {
  id: string;
  name: string;
  logo: string;
  services: CarrierService[];
  enabled: boolean;
  accountNumber?: string;
  apiCredentials?: {
    apiKey?: string;
    apiSecret?: string;
    accountId?: string;
  };
}

export interface CarrierService {
  id: string;
  name: string;
  type: 'standard' | 'express' | 'overnight' | 'economy';
  estimatedDays: { min: number; max: number };
  baseRate: number;
  ratePerKg: number;
  trackingSupported: boolean;
  insuranceSupported: boolean;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrierId: string;
  serviceId: string;
  trackingNumber: string;
  status: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned';
  origin: Address;
  destination: Address;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  cost: number;
  labelUrl?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  trackingEvents: TrackingEvent[];
  insurance?: {
    amount: number;
    provider: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface ShippingRate {
  carrierId: string;
  carrierName: string;
  serviceId: string;
  serviceName: string;
  rate: number;
  estimatedDays: { min: number; max: number };
  trackingSupported: boolean;
}

class ShippingService {
  private carriers: Map<string, Carrier> = new Map();
  private shipments: Map<string, Shipment> = new Map();

  constructor() {
    this.initializeDefaultCarriers();
  }

  // ─── Carrier Management ─────────────────────────────────────────────────────

  private initializeDefaultCarriers(): void {
    const defaultCarriers: Carrier[] = [
      {
        id: 'dhl',
        name: 'DHL',
        logo: '📦',
        enabled: true,
        services: [
          { id: 'dhl-exp', name: 'DHL Express', type: 'express', estimatedDays: { min: 1, max: 3 }, baseRate: 15.00, ratePerKg: 2.50, trackingSupported: true, insuranceSupported: true },
          { id: 'dhl-std', name: 'DHL Standard', type: 'standard', estimatedDays: { min: 3, max: 5 }, baseRate: 8.00, ratePerKg: 1.50, trackingSupported: true, insuranceSupported: true },
        ],
      },
      {
        id: 'fedex',
        name: 'FedEx',
        logo: '🚛',
        enabled: true,
        services: [
          { id: 'fdx-ovn', name: 'FedEx Overnight', type: 'overnight', estimatedDays: { min: 1, max: 1 }, baseRate: 25.00, ratePerKg: 3.00, trackingSupported: true, insuranceSupported: true },
          { id: 'fdx-exp', name: 'FedEx Express', type: 'express', estimatedDays: { min: 2, max: 3 }, baseRate: 18.00, ratePerKg: 2.50, trackingSupported: true, insuranceSupported: true },
          { id: 'fdx-grd', name: 'FedEx Ground', type: 'standard', estimatedDays: { min: 3, max: 7 }, baseRate: 10.00, ratePerKg: 1.20, trackingSupported: true, insuranceSupported: true },
        ],
      },
      {
        id: 'ups',
        name: 'UPS',
        logo: '🚚',
        enabled: true,
        services: [
          { id: 'ups-exp', name: 'UPS Express', type: 'express', estimatedDays: { min: 2, max: 3 }, baseRate: 16.00, ratePerKg: 2.30, trackingSupported: true, insuranceSupported: true },
          { id: 'ups-std', name: 'UPS Standard', type: 'standard', estimatedDays: { min: 3, max: 6 }, baseRate: 9.00, ratePerKg: 1.40, trackingSupported: true, insuranceSupported: true },
          { id: 'ups-sav', name: 'UPS Saver', type: 'economy', estimatedDays: { min: 5, max: 10 }, baseRate: 6.00, ratePerKg: 1.00, trackingSupported: true, insuranceSupported: false },
        ],
      },
      {
        id: 'colissimo',
        name: 'Colissimo',
        logo: '📮',
        enabled: true,
        services: [
          { id: 'col-exp', name: 'Colissimo Express', type: 'express', estimatedDays: { min: 1, max: 2 }, baseRate: 12.00, ratePerKg: 2.00, trackingSupported: true, insuranceSupported: true },
          { id: 'col-std', name: 'Colissimo Standard', type: 'standard', estimatedDays: { min: 2, max: 4 }, baseRate: 7.00, ratePerKg: 1.30, trackingSupported: true, insuranceSupported: true },
        ],
      },
    ];

    defaultCarriers.forEach(carrier => {
      this.carriers.set(carrier.id, carrier);
    });
  }

  addCarrier(carrier: Carrier): void {
    this.carriers.set(carrier.id, carrier);
  }

  updateCarrier(carrierId: string, updates: Partial<Carrier>): void {
    const carrier = this.carriers.get(carrierId);
    if (carrier) {
      this.carriers.set(carrierId, { ...carrier, ...updates });
    }
  }

  getCarriers(): Carrier[] {
    return Array.from(this.carriers.values()).filter(c => c.enabled);
  }

  // ─── Rate Calculation ───────────────────────────────────────────────────────

  calculateRates(
    origin: Address,
    destination: Address,
    weight: number,
    dimensions?: { length: number; width: number; height: number }
  ): ShippingRate[] {
    const rates: ShippingRate[] = [];

    this.carriers.forEach(carrier => {
      if (!carrier.enabled) return;

      carrier.services.forEach(service => {
        const rate = this.calculateRateForService(service, weight, dimensions);
        rates.push({
          carrierId: carrier.id,
          carrierName: carrier.name,
          serviceId: service.id,
          serviceName: service.name,
          rate,
          estimatedDays: service.estimatedDays,
          trackingSupported: service.trackingSupported,
        });
      });
    });

    return rates.sort((a, b) => a.rate - b.rate);
  }

  private calculateRateForService(
    service: CarrierService,
    weight: number,
    dimensions?: { length: number; width: number; height: number }
  ): number {
    let rate = service.baseRate + (weight * service.ratePerKg);

    // Add dimensional weight surcharge if dimensions provided
    if (dimensions) {
      const dimWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000;
      if (dimWeight > weight) {
        rate += (dimWeight - weight) * service.ratePerKg;
      }
    }

    return Math.round(rate * 100) / 100;
  }

  // ─── Shipment Management ────────────────────────────────────────────────────

  createShipment(
    orderId: string,
    carrierId: string,
    serviceId: string,
    origin: Address,
    destination: Address,
    weight: number,
    dimensions: { length: number; width: number; height: number },
    insurance?: { amount: number; provider: string }
  ): Shipment {
    const carrier = this.carriers.get(carrierId);
    if (!carrier) {
      throw new Error(`Carrier ${carrierId} not found`);
    }

    const service = carrier.services.find(s => s.id === serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found for carrier ${carrierId}`);
    }

    const cost = this.calculateRateForService(service, weight, dimensions);
    const trackingNumber = this.generateTrackingNumber(carrierId);
    
    const estimatedDelivery = this.calculateEstimatedDelivery(service.estimatedDays);

    const shipment: Shipment = {
      id: `SHP-${Date.now()}`,
      orderId,
      carrierId,
      serviceId,
      trackingNumber,
      status: 'created',
      origin,
      destination,
      weight,
      dimensions,
      cost,
      estimatedDelivery,
      trackingEvents: [
        {
          timestamp: new Date().toISOString(),
          status: 'created',
          location: origin.city,
          description: 'Shipment created',
        },
      ],
      insurance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.shipments.set(shipment.id, shipment);
    return shipment;
  }

  private generateTrackingNumber(carrierId: string): string {
    const prefixes: Record<string, string> = {
      dhl: 'DHL',
      fedex: 'FDX',
      ups: 'UPS',
      colissimo: 'COL',
    };
    const prefix = prefixes[carrierId] || 'TRK';
    const random = Math.random().toString(36).substring(2, 12).toUpperCase();
    return `${prefix}${random}`;
  }

  private calculateEstimatedDelivery(days: { min: number; max: number }): string {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + days.min);
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + days.max);

    return `${minDate.toISOString().split('T')[0]} - ${maxDate.toISOString().split('T')[0]}`;
  }

  // ─── Tracking ───────────────────────────────────────────────────────────────

  updateTracking(shipmentId: string, event: TrackingEvent): void {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) return;

    shipment.trackingEvents.unshift(event);
    shipment.status = this.mapEventToStatus(event.status);
    shipment.updatedAt = new Date().toISOString();

    if (shipment.status === 'delivered') {
      shipment.actualDelivery = event.timestamp;
    }
  }

  private mapEventToStatus(eventStatus: string): Shipment['status'] {
    const statusMap: Record<string, Shipment['status']> = {
      'picked_up': 'picked_up',
      'in_transit': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'exception': 'exception',
      'returned': 'returned',
    };
    return statusMap[eventStatus] || 'created';
  }

  getShipment(shipmentId: string): Shipment | undefined {
    return this.shipments.get(shipmentId);
  }

  getShipmentsByOrder(orderId: string): Shipment[] {
    return Array.from(this.shipments.values()).filter(s => s.orderId === orderId);
  }

  // ─── Label Generation ───────────────────────────────────────────────────────

  generateLabel(shipmentId: string): string {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // In a real implementation, this would call the carrier's API to generate a label
    const labelUrl = `https://labels.vendoo.com/${shipment.id}.pdf`;
    shipment.labelUrl = labelUrl;
    shipment.updatedAt = new Date().toISOString();

    return labelUrl;
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  getShippingStats(days: number = 30): {
    totalShipments: number;
    totalCost: number;
    averageCost: number;
    byCarrier: Record<string, { count: number; cost: number }>;
    byStatus: Record<string, number>;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentShipments = Array.from(this.shipments.values()).filter(
      s => new Date(s.createdAt) >= cutoffDate
    );

    const byCarrier: Record<string, { count: number; cost: number }> = {};
    const byStatus: Record<string, number> = {};

    let totalCost = 0;

    recentShipments.forEach(shipment => {
      totalCost += shipment.cost;

      if (!byCarrier[shipment.carrierId]) {
        byCarrier[shipment.carrierId] = { count: 0, cost: 0 };
      }
      byCarrier[shipment.carrierId].count++;
      byCarrier[shipment.carrierId].cost += shipment.cost;

      if (!byStatus[shipment.status]) {
        byStatus[shipment.status] = 0;
      }
      byStatus[shipment.status]++;
    });

    return {
      totalShipments: recentShipments.length,
      totalCost,
      averageCost: recentShipments.length > 0 ? totalCost / recentShipments.length : 0,
      byCarrier,
      byStatus,
    };
  }
}

export const shippingService = new ShippingService();
