// ─── Advanced Analytics Service ─────────────────────────────────────────────────
// Comprehensive business analytics with real-time metrics, forecasting, and insights

export interface AnalyticsMetric {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  period: string;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  revenue: number;
  unitsSold: number;
  views: number;
  conversionRate: number;
  averageRating: number;
  stockTurnover: number;
  returnRate: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  customerCount: number;
  averageLTV: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  characteristics: string[];
}

export interface FunnelStep {
  name: string;
  visitors: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface Forecast {
  period: string;
  predictedRevenue: number;
  predictedOrders: number;
  confidence: number;
  factors: string[];
}

export interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'anomaly';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  metric: string;
  value: number;
  recommendation: string;
  createdAt: string;
}

class AnalyticsService {
  private salesData: SalesData[] = [];
  private productPerformance: Map<string, ProductPerformance> = new Map();
  private customerSegments: CustomerSegment[] = [];
  private insights: Insight[] = [];

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData(): void {
    // Generate demo sales data for the last 90 days
    const now = new Date();
    for (let i = 90; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const baseRevenue = 1000 + Math.random() * 500;
      const weekendBoost = (date.getDay() === 0 || date.getDay() === 6) ? 1.3 : 1;
      const trend = 1 + (i / 90) * 0.2; // 20% growth trend
      
      this.salesData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(baseRevenue * weekendBoost * trend),
        orders: Math.round((baseRevenue * weekendBoost * trend) / 85),
        customers: Math.round((baseRevenue * weekendBoost * trend) / 120),
        averageOrderValue: 85 + Math.random() * 20,
      });
    }

    // Initialize customer segments
    this.customerSegments = [
      {
        id: 'vip',
        name: 'VIP Clients',
        customerCount: 45,
        averageLTV: 2500,
        averageOrderValue: 180,
        purchaseFrequency: 4.2,
        characteristics: ['High value', 'Frequent buyers', 'Low return rate'],
      },
      {
        id: 'regular',
        name: 'Regular Shoppers',
        customerCount: 234,
        averageLTV: 520,
        averageOrderValue: 75,
        purchaseFrequency: 2.1,
        characteristics: ['Consistent spending', 'Brand loyal', 'Responsive to promos'],
      },
      {
        id: 'new',
        name: 'New Customers',
        customerCount: 89,
        averageLTV: 85,
        averageOrderValue: 65,
        purchaseFrequency: 1.0,
        characteristics: ['First-time buyers', 'Price sensitive', 'High potential'],
      },
      {
        id: 'at_risk',
        name: 'At Risk',
        customerCount: 67,
        averageLTV: 320,
        averageOrderValue: 70,
        purchaseFrequency: 0.8,
        characteristics: ['Declining activity', 'High return rate', 'Churn risk'],
      },
    ];
  }

  // ─── Revenue Metrics ───────────────────────────────────────────────────────

  getRevenueMetrics(days: number = 30): {
    totalRevenue: number;
    revenueChange: number;
    revenueChangePercent: number;
    averageDailyRevenue: number;
    projectedMonthlyRevenue: number;
    metrics: AnalyticsMetric[];
  } {
    const recentData = this.salesData.slice(-days);
    const previousData = this.salesData.slice(-days * 2, -days);

    const totalRevenue = recentData.reduce((sum, d) => sum + d.revenue, 0);
    const previousRevenue = previousData.reduce((sum, d) => sum + d.revenue, 0);

    const revenueChange = totalRevenue - previousRevenue;
    const revenueChangePercent = previousRevenue > 0 
      ? ((revenueChange / previousRevenue) * 100) 
      : 0;

    const averageDailyRevenue = totalRevenue / days;
    const projectedMonthlyRevenue = averageDailyRevenue * 30;

    const metrics: AnalyticsMetric[] = [
      {
        name: 'Total Revenue',
        value: totalRevenue,
        change: revenueChange,
        changePercent: revenueChangePercent,
        period: `${days} days`,
      },
      {
        name: 'Average Order Value',
        value: recentData.reduce((sum, d) => sum + d.averageOrderValue, 0) / recentData.length,
        change: 0,
        changePercent: 5.2,
        period: `${days} days`,
      },
      {
        name: 'Total Orders',
        value: recentData.reduce((sum, d) => sum + d.orders, 0),
        change: 0,
        changePercent: 12.8,
        period: `${days} days`,
      },
      {
        name: 'Conversion Rate',
        value: 3.2,
        change: 0,
        changePercent: 8.5,
        period: `${days} days`,
      },
    ];

    return {
      totalRevenue,
      revenueChange,
      revenueChangePercent,
      averageDailyRevenue,
      projectedMonthlyRevenue,
      metrics,
    };
  }

  // ─── Sales Trends ───────────────────────────────────────────────────────────

  getSalesTrends(days: number = 90): SalesData[] {
    return this.salesData.slice(-days);
  }

  getSalesByDayOfWeek(): Array<{ day: string; averageRevenue: number; averageOrders: number }> {
    const dayData: Record<number, { revenue: number; orders: number; count: number }> = {};

    this.salesData.forEach(d => {
      const date = new Date(d.date);
      const day = date.getDay();
      
      if (!dayData[day]) {
        dayData[day] = { revenue: 0, orders: 0, count: 0 };
      }
      dayData[day].revenue += d.revenue;
      dayData[day].orders += d.orders;
      dayData[day].count++;
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return Object.entries(dayData).map(([day, data]) => ({
      day: dayNames[parseInt(day)],
      averageRevenue: data.revenue / data.count,
      averageOrders: data.orders / data.count,
    }));
  }

  // ─── Product Analytics ───────────────────────────────────────────────────────

  getProductPerformance(productId: string): ProductPerformance | undefined {
    return this.productPerformance.get(productId);
  }

  getTopProducts(limit: number = 10): ProductPerformance[] {
    return Array.from(this.productPerformance.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  getUnderperformingProducts(threshold: number = 100): ProductPerformance[] {
    return Array.from(this.productPerformance.values())
      .filter(p => p.revenue < threshold && p.views > 100)
      .sort((a, b) => a.conversionRate - b.conversionRate);
  }

  // ─── Customer Analytics ─────────────────────────────────────────────────────

  getCustomerSegments(): CustomerSegment[] {
    return this.customerSegments;
  }

  calculateCustomerLifetimeValue(customerId: string): number {
    // Simplified LTV calculation
    const segment = this.customerSegments.find(s => s.id === 'regular');
    return segment?.averageLTV || 500;
  }

  getChurnRate(days: number = 30): number {
    // Simplified churn rate calculation
    return 5.2; // 5.2% monthly churn rate
  }

  // ─── Conversion Funnel ───────────────────────────────────────────────────────

  getConversionFunnel(): FunnelStep[] {
    return [
      { name: 'Product Views', visitors: 15000, conversionRate: 100, dropOffRate: 0 },
      { name: 'Add to Cart', visitors: 3200, conversionRate: 21.3, dropOffRate: 78.7 },
      { name: 'Initiate Checkout', visitors: 1800, conversionRate: 12.0, dropOffRate: 43.8 },
      { name: 'Purchase', visitors: 480, conversionRate: 3.2, dropOffRate: 73.3 },
    ];
  }

  getFunnelInsights(): Insight[] {
    const funnel = this.getConversionFunnel();
    const insights: Insight[] = [];

    // Identify biggest drop-off
    let maxDropOff = 0;
    let biggestDropOffStep = '';
    
    for (let i = 1; i < funnel.length; i++) {
      const dropOff = funnel[i - 1].dropOffRate;
      if (dropOff > maxDropOff) {
        maxDropOff = dropOff;
        biggestDropOffStep = funnel[i].name;
      }
    }

    if (maxDropOff > 50) {
      insights.push({
        id: `INS-${Date.now()}`,
        type: 'warning',
        severity: 'high',
        title: 'High Drop-off Detected',
        description: `${biggestDropOffStep} has a ${maxDropOff.toFixed(1)}% drop-off rate`,
        metric: 'Conversion Rate',
        value: maxDropOff,
        recommendation: 'Consider optimizing the checkout process or offering incentives',
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  }

  // ─── Forecasting ───────────────────────────────────────────────────────────

  generateForecast(periods: number = 12): Forecast[] {
    const forecasts: Forecast[] = [];
    const recentData = this.salesData.slice(-30);
    const avgRevenue = recentData.reduce((sum, d) => sum + d.revenue, 0) / recentData.length;
    const avgOrders = recentData.reduce((sum, d) => sum + d.orders, 0) / recentData.length;
    const growthRate = 0.02; // 2% monthly growth

    for (let i = 1; i <= periods; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      
      const predictedRevenue = avgRevenue * Math.pow(1 + growthRate, i);
      const predictedOrders = avgOrders * Math.pow(1 + growthRate, i);

      forecasts.push({
        period: month.toLocaleString('default', { month: 'long', year: 'numeric' }),
        predictedRevenue: Math.round(predictedRevenue),
        predictedOrders: Math.round(predictedOrders),
        confidence: Math.max(70 - i * 3, 40), // Confidence decreases over time
        factors: ['Seasonal trends', 'Historical growth', 'Market conditions'],
      });
    }

    return forecasts;
  }

  // ─── AI-Powered Insights ────────────────────────────────────────────────────

  generateInsights(): Insight[] {
    const insights: Insight[] = [];
    const recentData = this.salesData.slice(-7);
    const previousWeek = this.salesData.slice(-14, -7);

    const recentRevenue = recentData.reduce((sum, d) => sum + d.revenue, 0);
    const previousRevenue = previousWeek.reduce((sum, d) => sum + d.revenue, 0);
    const revenueChange = ((recentRevenue - previousRevenue) / previousRevenue) * 100;

    // Revenue trend insight
    if (revenueChange > 15) {
      insights.push({
        id: `INS-${Date.now()}`,
        type: 'trend',
        severity: 'high',
        title: 'Strong Revenue Growth',
        description: `Revenue increased by ${revenueChange.toFixed(1)}% this week`,
        metric: 'Revenue',
        value: revenueChange,
        recommendation: 'Consider increasing marketing spend to capitalize on momentum',
        createdAt: new Date().toISOString(),
      });
    } else if (revenueChange < -10) {
      insights.push({
        id: `INS-${Date.now()}`,
        type: 'warning',
        severity: 'high',
        title: 'Revenue Decline Detected',
        description: `Revenue decreased by ${Math.abs(revenueChange).toFixed(1)}% this week`,
        metric: 'Revenue',
        value: revenueChange,
        recommendation: 'Review recent changes and consider promotional offers',
        createdAt: new Date().toISOString(),
      });
    }

    // Add funnel insights
    insights.push(...this.getFunnelInsights());

    return insights;
  }

  // ─── Real-Time Dashboard Data ───────────────────────────────────────────────

  getDashboardData(): {
    metrics: AnalyticsMetric[];
    salesChart: SalesData[];
    topProducts: ProductPerformance[];
    customerSegments: CustomerSegment[];
    insights: Insight[];
    forecast: Forecast[];
  } {
    return {
      metrics: this.getRevenueMetrics(30).metrics,
      salesChart: this.getSalesTrends(30),
      topProducts: this.getTopProducts(5),
      customerSegments: this.customerSegments,
      insights: this.generateInsights(),
      forecast: this.generateForecast(6),
    };
  }

  // ─── Comparative Analytics ───────────────────────────────────────────────────

  comparePeriods(currentDays: number, previousDays: number): {
    revenue: { current: number; previous: number; change: number; changePercent: number };
    orders: { current: number; previous: number; change: number; changePercent: number };
    customers: { current: number; previous: number; change: number; changePercent: number };
    averageOrderValue: { current: number; previous: number; change: number; changePercent: number };
  } {
    const currentData = this.salesData.slice(-currentDays);
    const previousData = this.salesData.slice(-currentDays - previousDays, -currentDays);

    const currentRevenue = currentData.reduce((sum, d) => sum + d.revenue, 0);
    const previousRevenue = previousData.reduce((sum, d) => sum + d.revenue, 0);

    const currentOrders = currentData.reduce((sum, d) => sum + d.orders, 0);
    const previousOrders = previousData.reduce((sum, d) => sum + d.orders, 0);

    const currentCustomers = currentData.reduce((sum, d) => sum + d.customers, 0);
    const previousCustomers = previousData.reduce((sum, d) => sum + d.customers, 0);

    const currentAOV = currentData.reduce((sum, d) => sum + d.averageOrderValue, 0) / currentData.length;
    const previousAOV = previousData.reduce((sum, d) => sum + d.averageOrderValue, 0) / previousData.length;

    return {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: currentRevenue - previousRevenue,
        changePercent: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      },
      orders: {
        current: currentOrders,
        previous: previousOrders,
        change: currentOrders - previousOrders,
        changePercent: previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0,
      },
      customers: {
        current: currentCustomers,
        previous: previousCustomers,
        change: currentCustomers - previousCustomers,
        changePercent: previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0,
      },
      averageOrderValue: {
        current: currentAOV,
        previous: previousAOV,
        change: currentAOV - previousAOV,
        changePercent: previousAOV > 0 ? ((currentAOV - previousAOV) / previousAOV) * 100 : 0,
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
