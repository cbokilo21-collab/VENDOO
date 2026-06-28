// ─── Team Management Service ───────────────────────────────────────────────────
// Staff management with role-based permissions, activity tracking, and collaboration

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: TeamRole;
  permissions: Permission[];
  status: 'active' | 'invited' | 'suspended' | 'deleted';
  lastActive: string;
  joinedAt: string;
  department?: string;
  location?: string;
  bio?: string;
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export type TeamRole = 'owner' | 'admin' | 'manager' | 'staff' | 'viewer';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'products' | 'orders' | 'customers' | 'analytics' | 'settings' | 'pos' | 'marketing';
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  createdByName: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
}

class TeamService {
  private members: Map<string, TeamMember> = new Map();
  private activityLogs: ActivityLog[] = [];
  private tasks: Map<string, Task> = new Map();
  private invites: Map<string, TeamInvite> = new Map();

  private readonly rolePermissions: Record<TeamRole, Permission[]> = {
    owner: this.getAllPermissions(),
    admin: this.getAllPermissions(),
    manager: this.getManagerPermissions(),
    staff: this.getStaffPermissions(),
    viewer: this.getViewerPermissions(),
  };

  private readonly allPermissions: Permission[] = [
    // Products
    { id: 'products_view', name: 'View Products', description: 'Can view product catalog', category: 'products' },
    { id: 'products_create', name: 'Create Products', description: 'Can add new products', category: 'products' },
    { id: 'products_edit', name: 'Edit Products', description: 'Can modify product details', category: 'products' },
    { id: 'products_delete', name: 'Delete Products', description: 'Can remove products', category: 'products' },
    { id: 'products_inventory', name: 'Manage Inventory', description: 'Can adjust stock levels', category: 'products' },
    
    // Orders
    { id: 'orders_view', name: 'View Orders', description: 'Can view order list', category: 'orders' },
    { id: 'orders_create', name: 'Create Orders', description: 'Can create manual orders', category: 'orders' },
    { id: 'orders_edit', name: 'Edit Orders', description: 'Can modify order details', category: 'orders' },
    { id: 'orders_refund', name: 'Process Refunds', description: 'Can issue refunds', category: 'orders' },
    { id: 'orders_fulfill', name: 'Fulfill Orders', description: 'Can mark orders as shipped', category: 'orders' },
    
    // Customers
    { id: 'customers_view', name: 'View Customers', description: 'Can view customer list', category: 'customers' },
    { id: 'customers_create', name: 'Create Customers', description: 'Can add new customers', category: 'customers' },
    { id: 'customers_edit', name: 'Edit Customers', description: 'Can modify customer details', category: 'customers' },
    { id: 'customers_delete', name: 'Delete Customers', description: 'Can remove customers', category: 'customers' },
    
    // Analytics
    { id: 'analytics_view', name: 'View Analytics', description: 'Can view analytics dashboard', category: 'analytics' },
    { id: 'analytics_export', name: 'Export Reports', description: 'Can export data reports', category: 'analytics' },
    
    // Settings
    { id: 'settings_view', name: 'View Settings', description: 'Can view store settings', category: 'settings' },
    { id: 'settings_edit', name: 'Edit Settings', description: 'Can modify store settings', category: 'settings' },
    { id: 'settings_billing', name: 'Manage Billing', description: 'Can manage billing and payments', category: 'settings' },
    
    // POS
    { id: 'pos_view', name: 'View POS', description: 'Can access POS interface', category: 'pos' },
    { id: 'pos_process', name: 'Process Sales', description: 'Can process POS transactions', category: 'pos' },
    { id: 'pos_refund', name: 'POS Refunds', description: 'Can process POS refunds', category: 'pos' },
    
    // Marketing
    { id: 'marketing_view', name: 'View Marketing', description: 'Can view marketing campaigns', category: 'marketing' },
    { id: 'marketing_create', name: 'Create Campaigns', description: 'Can create marketing campaigns', category: 'marketing' },
    { id: 'marketing_send', name: 'Send Communications', description: 'Can send emails/SMS', category: 'marketing' },
  ];

  private getAllPermissions(): Permission[] {
    return this.allPermissions;
  }

  private getManagerPermissions(): Permission[] {
    return this.allPermissions.filter(p => 
      !p.id.includes('delete') && 
      !p.id.includes('billing') &&
      !p.id.includes('settings_edit')
    );
  }

  private getStaffPermissions(): Permission[] {
    return this.allPermissions.filter(p => 
      p.category === 'products' && (p.id.includes('view') || p.id.includes('inventory')) ||
      p.category === 'orders' && (p.id.includes('view') || p.id.includes('fulfill')) ||
      p.category === 'customers' && p.id.includes('view') ||
      p.category === 'pos' && p.id.includes('process')
    );
  }

  private getViewerPermissions(): Permission[] {
    return this.allPermissions.filter(p => p.id.includes('view'));
  }

  // ─── Team Member Management ───────────────────────────────────────────────────

  addMember(member: Omit<TeamMember, 'id' | 'lastActive' | 'joinedAt'>): TeamMember {
    const newMember: TeamMember = {
      ...member,
      id: `TM-${Date.now()}`,
      lastActive: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      permissions: this.rolePermissions[member.role],
    };

    this.members.set(newMember.id, newMember);
    this.logActivity(newMember.id, newMember.name, 'member_added', 'TeamMember', newMember.id, { role: member.role });

    return newMember;
  }

  updateMember(memberId: string, updates: Partial<TeamMember>): TeamMember | null {
    const member = this.members.get(memberId);
    if (!member) return null;

    const updated = { ...member, ...updates };
    this.members.set(memberId, updated);

    if (updates.role) {
      updated.permissions = this.rolePermissions[updates.role];
    }

    this.logActivity(memberId, member.name, 'member_updated', 'TeamMember', memberId, updates);

    return updated;
  }

  removeMember(memberId: string, reason: string): boolean {
    const member = this.members.get(memberId);
    if (!member) return false;

    member.status = 'deleted';
    this.logActivity(memberId, member.name, 'member_removed', 'TeamMember', memberId, { reason });

    return true;
  }

  getMember(memberId: string): TeamMember | undefined {
    return this.members.get(memberId);
  }

  getMembers(): TeamMember[] {
    return Array.from(this.members.values()).filter(m => m.status !== 'deleted');
  }

  // ─── Permissions ─────────────────────────────────────────────────────────────

  hasPermission(memberId: string, permissionId: string): boolean {
    const member = this.members.get(memberId);
    if (!member) return false;

    return member.permissions.some(p => p.id === permissionId);
  }

  hasAnyPermission(memberId: string, permissionIds: string[]): boolean {
    const member = this.members.get(memberId);
    if (!member) return false;

    return member.permissions.some(p => permissionIds.includes(p.id));
  }

  updateMemberPermissions(memberId: string, permissions: Permission[]): boolean {
    const member = this.members.get(memberId);
    if (!member) return false;

    member.permissions = permissions;
    this.logActivity(memberId, member.name, 'permissions_updated', 'TeamMember', memberId, { permissionCount: permissions.length });

    return true;
  }

  // ─── Activity Logging ───────────────────────────────────────────────────────

  private logActivity(userId: string, userName: string, action: string, entity: string, entityId: string, details: Record<string, any>): void {
    const log: ActivityLog = {
      id: `LOG-${Date.now()}`,
      userId,
      userName,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };

    this.activityLogs.unshift(log);

    // Keep only last 1000 logs
    if (this.activityLogs.length > 1000) {
      this.activityLogs = this.activityLogs.slice(0, 1000);
    }
  }

  getActivityLogs(limit: number = 100, userId?: string): ActivityLog[] {
    let logs = this.activityLogs;
    
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }

    return logs.slice(0, limit);
  }

  // ─── Task Management ───────────────────────────────────────────────────────

  createTask(task: Omit<Task, 'id' | 'comments' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: `TSK-${Date.now()}`,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(newTask.id, newTask);
    this.logActivity(task.createdBy, task.createdByName, 'task_created', 'Task', newTask.id, { title: task.title });

    return newTask;
  }

  updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const updated = { ...task, ...updates, updatedAt: new Date().toISOString() };
    this.tasks.set(taskId, updated);

    if (updates.status === 'completed') {
      updated.completedAt = new Date().toISOString();
    }

    return updated;
  }

  addTaskComment(taskId: string, userId: string, userName: string, content: string): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const comment: TaskComment = {
      id: `CMT-${Date.now()}`,
      userId,
      userName,
      content,
      createdAt: new Date().toISOString(),
    };

    task.comments.push(comment);
    task.updatedAt = new Date().toISOString();

    return task;
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getTasks(assignedTo?: string, status?: Task['status']): Task[] {
    let tasks = Array.from(this.tasks.values());

    if (assignedTo) {
      tasks = tasks.filter(t => t.assignedTo === assignedTo);
    }

    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }

    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ─── Team Invites ───────────────────────────────────────────────────────────

  createInvite(email: string, role: TeamRole, invitedBy: string, invitedByName: string): TeamInvite {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite: TeamInvite = {
      id: `INV-${Date.now()}`,
      email,
      role,
      invitedBy,
      invitedByName,
      status: 'pending',
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.invites.set(invite.id, invite);
    this.logActivity(invitedBy, invitedByName, 'invite_sent', 'TeamInvite', invite.id, { email, role });

    return invite;
  }

  acceptInvite(inviteId: string, memberId: string): boolean {
    const invite = this.invites.get(inviteId);
    if (!invite || invite.status !== 'pending') return false;

    invite.status = 'accepted';
    invite.acceptedAt = new Date().toISOString();

    // Update member role
    const member = this.members.get(memberId);
    if (member) {
      member.role = invite.role;
      member.permissions = this.rolePermissions[invite.role];
    }

    return true;
  }

  cancelInvite(inviteId: string): boolean {
    const invite = this.invites.get(inviteId);
    if (!invite) return false;

    invite.status = 'cancelled';
    return true;
  }

  getInvites(): TeamInvite[] {
    return Array.from(this.invites.values()).filter(i => i.status === 'pending');
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  getTeamStats(): {
    totalMembers: number;
    activeMembers: number;
    byRole: Record<TeamRole, number>;
    pendingInvites: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    recentActivity: number;
  } {
    const members = Array.from(this.members.values());
    const activeMembers = members.filter(m => m.status === 'active').length;

    const byRole: Record<TeamRole, number> = {
      owner: 0, admin: 0, manager: 0, staff: 0, viewer: 0,
    };
    members.forEach(m => {
      byRole[m.role]++;
    });

    const pendingInvites = this.invites.size;

    const tasks = Array.from(this.tasks.values());
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    const now = new Date();
    const overdueTasks = tasks.filter(t => 
      t.status !== 'completed' && 
      t.dueDate && 
      new Date(t.dueDate) < now
    ).length;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const recentActivity = this.activityLogs.filter(l => new Date(l.timestamp) >= cutoffDate).length;

    return {
      totalMembers: members.length,
      activeMembers,
      byRole,
      pendingInvites,
      totalTasks,
      completedTasks,
      overdueTasks,
      recentActivity,
    };
  }
}

export const teamService = new TeamService();
