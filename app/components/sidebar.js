'use client'
import { FaBars, FaEnvelope, FaFileAlt, FaHome } from "react-icons/fa";
import Link from "next/link";
import { IoIosSettings } from "react-icons/io";
import { IoChatbubblesOutline } from "react-icons/io5";
import { GrTemplate } from "react-icons/gr";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { TbDoorExit } from "react-icons/tb";

export function Sidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname();

  const topNavItems = [
    { href: '/dashboard', icon: <FaHome size={20} />, label: 'Dashboard' },
    { href: '/resume', icon: <GrTemplate size={20} />, label: 'Resume' },
    { href: '/cover-letter', icon: <FaEnvelope size={20} />, label: 'Cover Letter' },
    { href: '/resignation-letter', icon: <TbDoorExit size={25} />, label: 'Resignation Letter' },
  ];

  const bottomNavItems = [
    { href: '/settings', icon: <IoIosSettings size={22} />, label: 'Settings' },
    { href: '/help', icon: <IoChatbubblesOutline size={22} />, label: 'Help & Support' },
  ];

  return (
    <div className={`fixed flex flex-col bg-gray-50 text-gray-700 h-screen border-r border-gray-200 shadow-sm
      ${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out z-50`}>
      
      {/* Top Section */}
      <div className="flex-shrink-0">
        <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} px-8 py-5`}>
          {isOpen && (
            <div className="flex items-center">
              <Image src={'/llama_logo.png'} width={50} height={50} alt="Llama logo" className="rounded-md" />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <FaBars className="text-lg text-gray-600" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="mt-2 px-2">
          {topNavItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <div className={`flex items-center mx-2 my-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
                ${pathname === item.href 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}
                ${isOpen ? '' : 'justify-center'}`}
                title={isOpen ? '' : item.label}>
                <span className="flex items-center justify-center w-6 h-6">
                  {item.icon}
                </span>
                {isOpen && (
                  <span className="ml-3 text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto p-4">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <div className={`flex items-center mx-2 my-1 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
                ${pathname === item.href 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}
                ${isOpen ? '' : 'justify-center'}`}
                title={isOpen ? '' : item.label}>
                <span className="flex items-center justify-center w-6 h-6">
                  {item.icon}
                </span>
                {isOpen && (
                  <span className="ml-3 text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className={`mt-4 pt-4 border-t border-gray-200 
          ${isOpen ? 'flex items-center' : 'flex justify-center'} px-2 py-2`}>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-white">JD</span>
          </div>
          {isOpen && (
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}