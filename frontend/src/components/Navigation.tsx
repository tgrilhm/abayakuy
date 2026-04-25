/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, User, ShoppingBag, Menu, LayoutDashboard, List, Package, Settings, LogOut } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
}

interface AdminSidebarProps extends NavigationProps {
  onLogout: () => void;
}

export const StorefrontHeader: React.FC<NavigationProps> = ({ setView }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface-lowest/90 backdrop-blur-md border-b border-surface-high">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-6 flex justify-between items-center">
        <nav className="hidden lg:flex gap-8">
          {['New Arrivals', 'All Abayas', 'Collections', 'About'].map((item) => (
            <button
              key={item}
              className="uppercase-label text-on-surface-variant hover:text-primary transition-colors"
            >
              {item}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setView('storefront')}
          className="text-2xl font-bold tracking-[0.3em] font-lexend text-primary"
        >
          ABAYAKUY
        </button>

        <div className="flex gap-6 items-center">
          <button className="text-on-surface hover:text-accent transition-colors">
            <Search size={20} />
          </button>
          <button
            onClick={() => setView('login')}
            className="text-on-surface hover:text-accent transition-colors"
          >
            <User size={20} />
          </button>
          <button className="text-on-surface hover:text-accent transition-colors">
            <ShoppingBag size={20} />
          </button>
          <button className="lg:hidden text-on-surface">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, setView, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, view: 'admin' as View },
    { id: 'productList', label: 'Product List', icon: <List size={20} />, view: 'admin' as View },
    { id: 'inventory', label: 'Inventory', icon: <Package size={20} />, view: 'admin' as View },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, view: 'admin' as View },
  ];

  return (
    <nav className="h-screen w-64 border-r border-surface-high bg-surface-lowest flex flex-col py-8 px-4 sticky top-0 flex-shrink-0">
      <div className="mb-12 px-4">
        <h1 className="font-bold text-primary uppercase font-lexend text-xl tracking-tight">Admin Panel</h1>
        <p className="text-xs text-on-surface-variant mt-1">Management Console</p>
      </div>

      <ul className="space-y-2 flex-grow">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setView(item.view)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-lexend text-sm transition-all ${
                item.id === 'productList'
                  ? 'bg-surface-low text-primary font-medium border-l-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-low'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-auto px-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-4 py-3 text-on-surface-variant hover:text-primary transition-colors uppercase-label"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </nav>
  );
};
