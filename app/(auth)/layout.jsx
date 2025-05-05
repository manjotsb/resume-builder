'use client'

import { useState } from 'react'
import { Sidebar } from '../components/sidebar'

export default function AuthLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`flex-1 flex flex-col overflow-auto ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {children}
      </div>
    </div>
  )
} 