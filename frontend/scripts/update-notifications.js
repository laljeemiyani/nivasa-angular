const fs = require('fs');
const path = require('path');

const bellPath = path.join(__dirname, '../src/app/shared/components/notification-bell/notification-bell.component.ts');
const adminPagePath = path.join(__dirname, '../src/app/pages/admin/notifications/notifications.component.html');
const resPagePath = path.join(__dirname, '../src/app/pages/resident/notifications/notifications.component.html');

// 1. UPDATE NOTIFICATION BELL
let bellCode = fs.readFileSync(bellPath, 'utf8');

// Add expandedId to class
if (!bellCode.includes('expandedId: string | null = null;')) {
    bellCode = bellCode.replace('  notifications: any[] = [];', '  expandedId: string | null = null;\n  notifications: any[] = [];');
}

// Add toggle function
if (!bellCode.includes('toggleExpand(')) {
    bellCode = bellCode.replace('  handleMarkAsRead(id: string) {', `  toggleExpand(id: string, event: Event) {
    event.stopPropagation();
    this.expandedId = this.expandedId === id ? null : id;
    const notification = this.notifications.find(n => n._id === id);
    if (notification && !notification.isRead) {
      this.handleMarkAsRead(id);
    }
  }

  handleMarkAsRead(id: string) {`);
}

// Replace template for bell
const newBellTemplate = `
    <div class="relative">
      <button
        (click)="toggleDropdown()"
        class="relative p-2 text-slate-500 hover:text-slate-800 focus:outline-none transition-colors rounded-full hover:bg-slate-100"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span *ngIf="unreadCount > 0" class="absolute top-1 right-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-white shadow-sm">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <div *ngIf="isOpen" class="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-down origin-top-right">
        <div class="px-5 py-4 bg-slate-50/50 backdrop-blur-sm border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-base font-bold text-slate-800 tracking-tight">Notifications</h3>
          <button *ngIf="unreadCount > 0" (click)="handleMarkAllAsRead()" class="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-full">
            Mark all read
          </button>
        </div>

        <div class="max-h-[25rem] overflow-y-auto">
          <div *ngIf="isLoading" class="py-12 flex justify-center items-center">
             <div class="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>

          <div *ngIf="!isLoading && notifications.length > 0" class="divide-y divide-slate-100">
            <div *ngFor="let notification of notifications" class="px-5 py-4 transition-colors hover:bg-slate-50 cursor-pointer group" [ngClass]="{ 'bg-primary-50/30': !notification.isRead }" (click)="toggleExpand(notification._id, $event)">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center text-lg" [ngClass]="{
                   'bg-green-100 text-green-600': notification.type === 'success',
                   'bg-amber-100 text-amber-600': notification.type === 'warning',
                   'bg-red-100 text-red-600': notification.type === 'error',
                   'bg-primary-100 text-primary-600': notification.type !== 'success' && notification.type !== 'warning' && notification.type !== 'error'
                }">
                  {{ getNotificationIcon(notification.type) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start gap-2 mb-1">
                     <p class="text-sm font-semibold text-slate-800 leading-tight" [ngClass]="{'text-slate-900': !notification.isRead}">
                       {{ notification.title }}
                     </p>
                     <div *ngIf="!notification.isRead" class="w-2 h-2 bg-primary-500 rounded-full mt-1 shrink-0"></div>
                  </div>
                  
                  <p class="text-[13px] text-slate-500 leading-relaxed transition-all duration-300" 
                     [ngClass]="expandedId === notification._id ? 'line-clamp-none' : 'line-clamp-2'">
                    {{ notification.message }}
                  </p>
                  
                  <div class="flex items-center justify-between mt-2">
                     <p class="text-[11px] font-medium text-slate-400">
                       {{ timeAgo(notification.createdAt) }}
                     </p>
                     <span *ngIf="expandedId !== notification._id" class="text-[10px] font-semibold text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">Click to expand</span>
                     <span *ngIf="expandedId === notification._id" class="text-[10px] font-semibold text-slate-400">Click to collapse</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!isLoading && notifications.length === 0" class="py-12 px-6 text-center">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
               <svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <p class="text-base font-semibold text-slate-700">All caught up!</p>
            <p class="text-sm text-slate-500 mt-1">Check back later for new alerts.</p>
          </div>
        </div>

        <div class="p-3 bg-slate-50/80 border-t border-slate-100">
          <a [routerLink]="userRole === 'admin' ? '/admin/notifications' : '/resident/notifications'"
             class="block w-full text-center py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
             (click)="setIsOpen(false)">
            View all notifications →
          </a>
        </div>
      </div>
    </div>
  `;

bellCode = bellCode.replace(/<div class="relative">[\s\S]*?<\/div>\s*`/g, newBellTemplate + '`');

// Use cleaner icons
if (bellCode.includes("getNotificationIcon(type: string): string {")) {
    bellCode = bellCode.replace(`    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }`, `    switch (type) {
      case 'success': return '✓';
      case 'warning': return '!';
      case 'error': return '✕';
      default: return 'i';
    }`);
}
fs.writeFileSync(bellPath, bellCode);


// 2. UPDATE ADMIN NOTIFICATION PAGE
const adminPageHTML = `<div class="space-y-6 max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
    <div>
      <h1 class="text-3xl font-display font-bold tracking-tight text-slate-900 mb-2">Notifications Center</h1>
      <p class="text-base text-slate-500 font-medium">Manage and monitor all system alerts</p>
    </div>
    <button (click)="handleMarkAllAsRead()" class="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none hover:bg-primary-700 bg-primary-600 text-white h-11 px-6 shadow-md shadow-primary-500/20 active:scale-[0.98]">
      <app-icon-check customClass="h-4 w-4 mr-2"></app-icon-check> Mark All Read
    </button>
  </div>

  <div class="bg-white rounded-[2rem] shadow-card border border-slate-100 overflow-hidden">
    <!-- Filters Header -->
    <div class="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Status</label>
          <select [(ngModel)]="filter.isRead" (ngModelChange)="onFilterChange()" class="w-full h-11 border border-slate-200 rounded-xl px-4 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium">
            <option value="">All Statuses</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Type</label>
          <select [(ngModel)]="filter.type" (ngModelChange)="onFilterChange()" class="w-full h-11 border border-slate-200 rounded-xl px-4 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium">
            <option value="">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Model</label>
          <select [(ngModel)]="filter.relatedModel" (ngModelChange)="onFilterChange()" class="w-full h-11 border border-slate-200 rounded-xl px-4 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium">
            <option value="">All Models</option>
            <option value="User">User</option><option value="Vehicle">Vehicle</option>
            <option value="Complaint">Complaint</option><option value="Notice">Notice</option>
            <option value="Payment">Payment</option><option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <div class="flex items-end">
          <button (click)="clearFilters()" class="w-full h-11 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-bold transition-colors active:scale-[0.98]">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6 md:p-8">
      <div *ngIf="loading" class="flex flex-col justify-center items-center py-20">
        <div class="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="mt-4 text-sm font-medium text-slate-500">Loading notifications...</p>
      </div>

      <div *ngIf="!loading && notifications.length === 0" class="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl mx-auto max-w-2xl">
        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
           <app-icon-alert-circle customClass="h-8 w-8 text-slate-300"></app-icon-alert-circle>
        </div>
        <h3 class="text-lg font-bold text-slate-800">No notifications found</h3>
        <p class="text-slate-500 mt-1 font-medium text-sm">You've caught up on everything in this view.</p>
      </div>

      <div *ngIf="!loading && notifications.length > 0" class="space-y-4">
        <div *ngFor="let notification of notifications; let i = index" 
             class="group relative p-5 md:p-6 bg-white border rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-0.5 cursor-pointer"
             [ngClass]="[!notification.isRead ? 'border-l-4 border-l-primary-500 border-t-slate-100 border-r-slate-100 border-b-slate-100 shadow-sm' : 'border-slate-200']"
             (click)="!notification.isRead && handleMarkAsRead(notification._id)">
          
          <div class="flex items-start gap-4 md:gap-5">
            <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm border" 
                 [ngClass]="{
                   'bg-green-50 border-green-100 text-green-600': notification.type === 'success',
                   'bg-amber-50 border-amber-100 text-amber-600': notification.type === 'warning',
                   'bg-red-50 border-red-100 text-red-600': notification.type === 'error',
                   'bg-primary-50 border-primary-100 text-primary-600': notification.type !== 'success' && notification.type !== 'warning' && notification.type !== 'error'
                 }">
               <span class="font-bold">{{ getNotificationIcon(notification.type) === '✅' ? '✓' : getNotificationIcon(notification.type) === '⚠️' ? '!' : getNotificationIcon(notification.type) === '❌' ? '✕' : 'i' }}</span>
            </div>
            
            <div class="flex-1 min-w-0">
               <div class="flex flex-col md:flex-row justify-between md:items-start gap-2 mb-2">
                  <div class="pr-8 md:pr-0">
                     <h3 class="font-bold text-slate-900 text-base leading-tight mb-1" [ngClass]="{'text-primary-900': !notification.isRead}">{{ notification.title }}</h3>
                     <!-- Full message shown, wrapped -->
                     <p class="text-slate-600 text-sm leading-relaxed">{{ notification.message }}</p>
                  </div>
                  <div class="flex items-center space-x-2 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity absolute md:static top-5 right-5">
                     <button *ngIf="!notification.isRead" (click)="$event.stopPropagation(); handleMarkAsRead(notification._id)" class="p-2 text-primary-600 hover:bg-primary-50 bg-white border border-slate-100 shadow-sm rounded-lg transition-colors" title="Mark as read">
                        <app-icon-check customClass="h-4 w-4"></app-icon-check>
                     </button>
                     <button (click)="$event.stopPropagation(); handleDeleteNotification(notification._id)" class="p-2 text-red-600 hover:bg-red-50 bg-white border border-slate-100 shadow-sm rounded-lg transition-colors" title="Delete">
                        <app-icon-trash customClass="h-4 w-4"></app-icon-trash>
                     </button>
                  </div>
               </div>
               
               <!-- Metadata Footer -->
               <div class="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                  <span class="flex items-center gap-1.5 text-slate-400">
                     <app-icon-alert-circle customClass="h-3.5 w-3.5"></app-icon-alert-circle>
                     {{ formatDate(notification.createdAt) }}
                  </span>
                  <div class="w-1 h-1 rounded-full bg-slate-200"></div>
                  <span *ngIf="notification.relatedModel" class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
                     <app-icon-user *ngIf="notification.relatedModel === 'User'" customClass="h-3.5 w-3.5"></app-icon-user>
                     <svg *ngIf="notification.relatedModel !== 'User'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                     {{ notification.relatedModel }}
                  </span>
                  <span *ngIf="notification.userId?.email" class="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100 hidden sm:inline-block">User: {{ notification.userId.email }}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
        <div class="text-sm text-slate-500 font-bold tracking-wide">PAGE {{ page }} OF {{ totalPages }}</div>
        <div class="flex items-center space-x-2">
          <button (click)="setPage(page - 1)" [disabled]="page === 1" class="flex items-center px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 transition-all">
            <app-icon-chevron-left customClass="h-4 w-4 mr-1.5"></app-icon-chevron-left> Prev
          </button>
          <div class="hidden sm:flex items-center space-x-1 p-1 bg-slate-50 rounded-xl border border-slate-200">
            <button *ngFor="let p of getPages()" (click)="setPage(p)" class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all" [ngClass]="page === p ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-900'">
              {{ p }}
            </button>
          </div>
          <button (click)="setPage(page + 1)" [disabled]="page === totalPages" class="flex items-center px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 transition-all">
            Next <app-icon-chevron-right customClass="h-4 w-4 ml-1.5"></app-icon-chevron-right>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`;
fs.writeFileSync(adminPagePath, adminPageHTML);

// 3. UPDATE RESIDENT NOTIFICATION PAGE
const resPageHTML = `<div class="space-y-6 max-w-4xl mx-auto py-8 lg:py-12 px-4 sm:px-6 animate-fade-in-up">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 mb-8">
    <div>
      <h1 class="text-3xl font-display font-bold tracking-tight text-slate-900 mb-2">Your Notifications</h1>
      <p class="text-base text-slate-500 font-medium">Stay updated with your latest alerts</p>
    </div>
    <button (click)="handleMarkAllAsRead()" class="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 h-11 px-6 shadow-sm active:scale-[0.98]">
      <app-icon-check customClass="h-4 w-4 mr-2 text-primary-600"></app-icon-check> Mark All Read
    </button>
  </div>

  <div class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden relative">
    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-indigo-500"></div>
    <div class="p-6 md:p-8 lg:p-10">
      
      <div *ngIf="loading" class="flex flex-col justify-center items-center py-16">
        <div class="w-10 h-10 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="mt-4 text-sm font-medium text-slate-500">Refreshing...</p>
      </div>

      <div *ngIf="!loading && notifications.length === 0" class="text-center py-24 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-sm">
           <app-icon-check customClass="h-8 w-8 text-green-500"></app-icon-check>
        </div>
        <h3 class="text-xl font-bold text-slate-800">You're all caught up!</h3>
        <p class="text-slate-500 mt-2 font-medium">There are no new notifications for you right now.</p>
      </div>

      <div *ngIf="!loading && notifications.length > 0" class="space-y-5">
        <div *ngFor="let notification of notifications" 
             class="group block relative p-6 bg-white border rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary-200 cursor-pointer"
             [ngClass]="[!notification.isRead ? 'border-2 border-primary-100 bg-primary-50/10' : 'border border-slate-200']"
             (click)="!notification.isRead && handleMarkAsRead(notification._id)">
          
          <div class="flex items-start gap-5">
            <div class="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border" 
                 [ngClass]="{
                   'bg-green-50 border-green-100 text-green-600': notification.type === 'success',
                   'bg-amber-50 border-amber-100 text-amber-600': notification.type === 'warning',
                   'bg-red-50 border-red-100 text-red-600': notification.type === 'error',
                   'bg-primary-50 border-primary-100 text-primary-600': notification.type !== 'success' && notification.type !== 'warning' && notification.type !== 'error'
                 }">
               <span class="font-bold">{{ getNotificationIcon(notification.type) === '✅' ? '✓' : getNotificationIcon(notification.type) === '⚠️' ? '!' : getNotificationIcon(notification.type) === '❌' ? '✕' : 'i' }}</span>
            </div>
            
            <div class="flex-1 min-w-0">
               <div class="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                  <h3 class="font-bold text-slate-900 text-[1.05rem] leading-tight" [ngClass]="{'text-primary-800': !notification.isRead}">
                     {{ notification.title }}
                     <span *ngIf="!notification.isRead" class="inline-block w-2 h-2 ml-1 mb-1 bg-primary-500 rounded-full"></span>
                  </h3>
                  <!-- Desktop actions -->
                  <div class="hidden sm:flex items-center space-x-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button *ngIf="!notification.isRead" (click)="$event.stopPropagation(); handleMarkAsRead(notification._id)" class="px-2.5 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors" title="Mark as read">
                        Mark read
                     </button>
                     <button (click)="$event.stopPropagation(); handleDeleteNotification(notification._id)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <app-icon-trash customClass="h-4 w-4"></app-icon-trash>
                     </button>
                  </div>
               </div>
               
               <!-- Full message, completely visible on page -->
               <p class="text-slate-600 text-[15px] leading-relaxed pr-0 sm:pr-8">{{ notification.message }}</p>
               
               <div class="flex items-center justify-between mt-4">
                  <p class="text-[13px] text-slate-400 font-semibold flex items-center gap-1.5">
                     <svg class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     {{ formatDate(notification.createdAt) }}
                  </p>
                  
                  <!-- Mobile actions -->
                  <div class="flex sm:hidden items-center space-x-3">
                     <button (click)="$event.stopPropagation(); handleDeleteNotification(notification._id)" class="text-sm font-bold text-slate-500 hover:text-red-600">
                        Delete
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
        <div class="text-sm text-slate-500 font-bold tracking-wide">PAGE {{ page }} OF {{ totalPages }}</div>
        <div class="flex items-center space-x-2">
          <button (click)="setPage(page - 1)" [disabled]="page === 1" class="p-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-40 transition-all">
            <app-icon-chevron-left customClass="h-5 w-5"></app-icon-chevron-left>
          </button>
          <div class="flex items-center space-x-1 p-1 bg-slate-50 rounded-xl border border-slate-200">
            <button *ngFor="let p of getPages()" (click)="setPage(p)" class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all" [ngClass]="page === p ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-white'">
              {{ p }}
            </button>
          </div>
          <button (click)="setPage(page + 1)" [disabled]="page === totalPages" class="p-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-40 transition-all">
            <app-icon-chevron-right customClass="h-5 w-5"></app-icon-chevron-right>
          </button>
        </div>
      </div>
      
    </div>
  </div>
</div>`;
fs.writeFileSync(resPagePath, resPageHTML);

console.log('Successfully updated notification components!');
