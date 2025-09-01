import { PanelRight, Bell, Settings, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Topbar() {
  return (
    <header className="bg-cisco-navy backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40 w-full shadow-sm">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-white grid place-items-center shadow-lg border border-blue-100">
              <Image 
                src="/cisco_logo.png" 
                alt="Cisco Logo" 
                width={36} 
                height={36}
                className="rounded-xl"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-white bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Cisco
              </h1>
              <p className="text-sm font-medium text-gray-500">Enterprise Solutions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 group">
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
              </button>
              <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 group">
                <Settings className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
              </button>
              <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 group">
                <User className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
              </button>
            </div>
           
            
          </div>
        </div>
      </div>
    </header>
  );
}
