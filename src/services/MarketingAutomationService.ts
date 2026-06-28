// ─── Marketing Automation Service ───────────────────────────────────────────────
// Automated marketing campaigns, email sequences, and customer engagement

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  trigger: CampaignTrigger;
  audience: CampaignAudience;
  content: CampaignContent;
  schedule: CampaignSchedule;
  metrics: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CampaignTrigger {
  type: 'abandoned_cart' | 'purchase' | 'signup' | 'inactive' | 'birthday' | 'low_stock' | 'price_drop' | 'custom';
  conditions?: Record<string, any>;
  delayHours?: number;
}

export interface CampaignAudience {
  type: 'all' | 'segment' | 'custom';
  segmentIds?: string[];
  customerIds?: string[];
  estimatedSize: number;
}

export interface CampaignContent {
  subject?: string;
  body: string;
  template?: string;
  variables?: Record<string, string>;
  attachments?: Array<{ name: string; url: string }>;
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  startDate?: string;
  endDate?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  timezone: string;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  bounced: number;
  revenue: number;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  status: 'active' | 'paused' | 'draft';
  metrics: WorkflowMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  type: 'customer_signup' | 'first_purchase' | 'abandoned_cart' | 'purchase_above_amount' | 'inactive_days' | 'birthday' | 'custom_event';
  conditions?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: 'email' | 'sms' | 'wait' | 'condition' | 'action';
  order: number;
  config: any;
  delay?: { value: number; unit: 'minutes' | 'hours' | 'days' };
}

export interface WorkflowMetrics {
  enrolled: number;
  completed: number;
  dropped: number;
  conversionRate: number;
  averageTimeToComplete: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  customerCount: number;
  lastUpdated: string;
  isDynamic: boolean;
}

export interface SegmentRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

class MarketingAutomationService {
  private campaigns: Map<string, Campaign> = new Map();
  private workflows: Map<string, AutomationWorkflow> = new Map();
  private segments: Map<string, CustomerSegment> = new Map();

  // ─── Campaign Management ─────────────────────────────────────────────────────

  createCampaign(campaign: Omit<Campaign, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>): Campaign {
    const newCampaign: Campaign = {
      ...campaign,
      id: `CMP-${Date.now()}`,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        unsubscribed: 0,
        bounced: 0,
        revenue: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.campaigns.set(newCampaign.id, newCampaign);
    return newCampaign;
  }

  launchCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.status !== 'draft') return false;

    campaign.status = campaign.schedule.type === 'immediate' ? 'running' : 'scheduled';
    campaign.startedAt = new Date().toISOString();
    campaign.updatedAt = new Date().toISOString();

    if (campaign.schedule.type === 'immediate') {
      this.executeCampaign(campaign);
    }

    return true;
  }

  private executeCampaign(campaign: Campaign): void {
    // Simulate campaign execution
    campaign.metrics.sent = campaign.audience.estimatedSize;
    campaign.metrics.delivered = Math.floor(campaign.metrics.sent * 0.95);
    campaign.metrics.opened = Math.floor(campaign.metrics.delivered * 0.35);
    campaign.metrics.clicked = Math.floor(campaign.metrics.opened * 0.15);
    campaign.metrics.converted = Math.floor(campaign.metrics.clicked * 0.25);
    campaign.metrics.revenue = campaign.metrics.converted * 45;

    campaign.status = 'completed';
    campaign.completedAt = new Date().toISOString();
    campaign.updatedAt = new Date().toISOString();
  }

  pauseCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.status !== 'running') return false;

    campaign.status = 'paused';
    campaign.updatedAt = new Date().toISOString();
    return true;
  }

  getCampaign(campaignId: string): Campaign | undefined {
    return this.campaigns.get(campaignId);
  }

  getCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  // ─── Workflow Management ─────────────────────────────────────────────────────

  createWorkflow(workflow: Omit<AutomationWorkflow, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>): AutomationWorkflow {
    const newWorkflow: AutomationWorkflow = {
      ...workflow,
      id: `WRK-${Date.now()}`,
      metrics: {
        enrolled: 0,
        completed: 0,
        dropped: 0,
        conversionRate: 0,
        averageTimeToComplete: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.workflows.set(newWorkflow.id, newWorkflow);
    return newWorkflow;
  }

  activateWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    workflow.status = 'active';
    workflow.updatedAt = new Date().toISOString();
    return true;
  }

  getWorkflow(workflowId: string): AutomationWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  getWorkflows(): AutomationWorkflow[] {
    return Array.from(this.workflows.values());
  }

  // ─── Customer Segments ───────────────────────────────────────────────────────

  createSegment(segment: Omit<CustomerSegment, 'id' | 'customerCount' | 'lastUpdated'>): CustomerSegment {
    const newSegment: CustomerSegment = {
      ...segment,
      id: `SEG-${Date.now()}`,
      customerCount: this.calculateSegmentSize(segment.rules),
      lastUpdated: new Date().toISOString(),
    };

    this.segments.set(newSegment.id, newSegment);
    return newSegment;
  }

  private calculateSegmentSize(rules: SegmentRule[]): number {
    // Simulate segment size calculation
    return Math.floor(Math.random() * 500) + 50;
  }

  getSegment(segmentId: string): CustomerSegment | undefined {
    return this.segments.get(segmentId);
  }

  getSegments(): CustomerSegment[] {
    return Array.from(this.segments.values());
  }

  // ─── Pre-built Templates ───────────────────────────────────────────────────────

  getAbandonedCartTemplate(): Omit<Campaign, 'id' | 'metrics' | 'createdAt' | 'updatedAt'> {
    return {
      name: 'Abandoned Cart Recovery',
      type: 'email',
      status: 'draft',
      trigger: {
        type: 'abandoned_cart',
        delayHours: 2,
      },
      audience: {
        type: 'segment',
        estimatedSize: 150,
      },
      content: {
        subject: 'You left something behind! 🛒',
        body: 'Hi {{customer_name}},\n\nWe noticed you left some items in your cart. Don\'t miss out!\n\n{{cart_items}}\n\nComplete your purchase now: {{cart_url}}',
        variables: {
          customer_name: 'Customer name',
          cart_items: 'Cart items',
          cart_url: 'Cart URL',
        },
      },
      schedule: {
        type: 'immediate',
        timezone: 'UTC',
      },
    };
  }

  getWelcomeSequenceTemplate(): AutomationWorkflow {
    return {
      id: '',
      name: 'Welcome Sequence',
      trigger: {
        type: 'customer_signup',
      },
      steps: [
        {
          id: 'step-1',
          type: 'email',
          order: 1,
          config: {
            subject: 'Welcome to {{store_name}}! 👋',
            body: 'Hi {{customer_name}},\n\nWelcome to our store! Here\'s a special offer for your first purchase.',
          },
          delay: { value: 0, unit: 'hours' },
        },
        {
          id: 'step-2',
          type: 'email',
          order: 2,
          config: {
            subject: 'Get to know our products',
            body: 'Discover our best-selling items and customer favorites.',
          },
          delay: { value: 2, unit: 'days' },
        },
        {
          id: 'step-3',
          type: 'email',
          order: 3,
          config: {
            subject: 'Exclusive 10% off for you',
            body: 'Here\'s your exclusive discount code: WELCOME10',
          },
          delay: { value: 5, unit: 'days' },
        },
      ],
      status: 'draft',
      metrics: {
        enrolled: 0,
        completed: 0,
        dropped: 0,
        conversionRate: 0,
        averageTimeToComplete: 0,
      },
      createdAt: '',
      updatedAt: '',
    };
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  getMarketingStats(days: number = 30): {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageConversionRate: number;
    byType: Record<string, { sent: number; revenue: number }>;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const campaigns = Array.from(this.campaigns.values());
    const recentCampaigns = campaigns.filter(c => new Date(c.createdAt) >= cutoffDate);

    const totalSent = recentCampaigns.reduce((sum, c) => sum + c.metrics.sent, 0);
    const totalOpens = recentCampaigns.reduce((sum, c) => sum + c.metrics.opened, 0);
    const totalClicks = recentCampaigns.reduce((sum, c) => sum + c.metrics.clicked, 0);
    const totalConversions = recentCampaigns.reduce((sum, c) => sum + c.metrics.converted, 0);
    const totalRevenue = recentCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);

    const averageOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const averageClickRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;
    const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    const byType: Record<string, { sent: number; revenue: number }> = {};
    recentCampaigns.forEach(c => {
      if (!byType[c.type]) {
        byType[c.type] = { sent: 0, revenue: 0 };
      }
      byType[c.type].sent += c.metrics.sent;
      byType[c.type].revenue += c.metrics.revenue;
    });

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'running').length,
      totalSent,
      totalOpens,
      totalClicks,
      totalConversions,
      totalRevenue,
      averageOpenRate,
      averageClickRate,
      averageConversionRate,
      byType,
    };
  }
}

export const marketingAutomationService = new MarketingAutomationService();
