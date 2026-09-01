"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  CirclePower,
  MegaphoneIcon,
} from "lucide-react";
import Image from "next/image";
import barss from "../../public/icon/bars.png";
import { logoutUser } from "./lib/apiClient";


const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/user-management", icon: Users },
  {
    name: 'All Category',
    href: '/admin/button-categoary',
    icon: CirclePower,
    hasDropdown: true,
    dropdownItems: [
      { name: "Category", href: "/admin/button-categoary/category" },
      { name: "Sub Category", href: "/admin/button-categoary/sub-cetegoary" },
      { name: "All Items", href: "/admin/button-categoary/items" },
    ]
  },
  { name: "Quick Speak", href: "/admin/quick-speak", icon: MegaphoneIcon },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isDropdownItemActive = (item) => {
    if (item.hasDropdown) {
      return item.dropdownItems?.some(dropdownItem => pathname === dropdownItem.href) || pathname === item.href;
    }
    return pathname === item.href;
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full bg-white text-black shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
          }`}
      >
        <div className="flex flex-col h-full justify-between border-r border-[#D6D6D6]">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between  border-[#D6D6D6] pb-7 px-4 py-3">
            <img className="w-32 " src="./chetterBee (1).png" alt="" />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded text-[#494949]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="8"
                viewBox="0 0 21 8"
                fill="none"
              >
                <path
                  d="M1.5 1H19.5"
                  stroke="#494949"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                <path
                  d="M1.5 7H19.5"
                  stroke="#494949"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 space-y-6 flex-grow overflow-y-auto">
            {navItems.map(({ name, href, icon: Icon, hasDropdown, dropdownItems }) => {
              const isActive = isDropdownItemActive({ name, href, icon: Icon, hasDropdown, dropdownItems });

              if (hasDropdown) {
                return (
                  <div key={name}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center justify-between px-4 w-[218px] mx-auto py-2 transition-all rounded ${isActive
                          ? "bg-[#FDD268] text-black"
                          : "hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-normal text-[13px]">{name}</span>
                      </div>
                      {dropdownOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {dropdownOpen && (
                      <div className="ml-8 mt-2 space-y-2">
                        {dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className={`flex items-center px-4 py-2 rounded transition-all ${pathname === dropdownItem.href
                                ? "bg-[#FDD268] text-black"
                                : "hover:bg-gray-100"
                              }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                            <span className="font-normal text-[13px]">{dropdownItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={name}
                  href={href}
                  className={`flex items-center px-4 w-[218px] mx-auto py-2 transition-all rounded ${isActive
                      ? "bg-[#FDD268] text-black"
                      : "hover:bg-gray-100"
                    }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-normal text-[13px]">{name}</span>
                </Link>
              );
            })}

            {/* Logout Button */}
            <div className="border-t border-[#D6D6D6] pt-6 ">
              <button
                onClick={logoutUser}
                className="flex ml-9 gap-2 items-center text-[#FF0000] hover:text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M12.7 18.5583H12.5916C8.89164 18.5583 7.10831 17.1 6.79997 13.8333C6.76664 13.4917 7.01664 13.1833 7.36664 13.15C7.69997 13.1166 8.01664 13.375 8.04997 13.7167C8.29164 16.3333 9.52497 17.3083 12.6 17.3083H12.7083C16.1 17.3083 17.3 16.1083 17.3 12.7167V7.28332C17.3 3.89165 16.1 2.69165 12.7083 2.69165H12.6C9.50831 2.69165 8.27497 3.68332 8.04997 6.34998C8.00831 6.69165 7.71664 6.94998 7.36664 6.91665C7.01664 6.89165 6.76664 6.58332 6.79164 6.24165C7.07497 2.92498 8.86664 1.44165 12.5916 1.44165H12.7C16.7916 1.44165 18.5416 3.19165 18.5416 7.28332V12.7167C18.5416 16.8083 16.7916 18.5583 12.7 18.5583Z"
                    fill="#FF0000"
                  />
                  <path
                    d="M3.01672 9.875H12.5001C12.5302 9.87502 12.5614 9.88746 12.587 9.91309C12.6127 9.93872 12.6251 9.96987 12.6251 10C12.6251 10.0301 12.6127 10.0613 12.587 10.0869C12.5614 10.1125 12.5302 10.125 12.5001 10.125H3.01672C2.98658 10.125 2.95545 10.1126 2.92981 10.0869C2.90417 10.0613 2.89172 10.0301 2.89172 10C2.89172 9.96985 2.90417 9.93873 2.92981 9.91309C2.95545 9.88744 2.98658 9.875 3.01672 9.875Z"
                    fill="#FF0000"
                    stroke="#FF0000"
                  />
                  <path
                    d="M4.92432 7.09521L4.96338 7.12061C4.98473 7.14212 4.99756 7.17281 4.99756 7.2085C4.99754 7.22619 4.99465 7.24262 4.98877 7.25732L4.96338 7.29639L2.61279 9.646L2.25928 10.0005L2.61279 10.354L4.96338 12.7036C4.98479 12.7251 4.99751 12.7558 4.99756 12.7915C4.99756 12.8272 4.98471 12.8579 4.96338 12.8794L4.95752 12.8862L4.95166 12.8921C4.94839 12.8956 4.94108 12.9022 4.92725 12.9077C4.91276 12.9135 4.89424 12.9164 4.87549 12.9165C4.85781 12.9165 4.84194 12.9131 4.82861 12.9077L4.78662 12.8794L1.99561 10.0884C1.97417 10.0669 1.96056 10.0361 1.96045 10.0005C1.96045 9.98253 1.96418 9.96556 1.97021 9.95068L1.99561 9.91162L4.78662 7.12061C4.80815 7.09908 4.83964 7.08545 4.87549 7.08545C4.89325 7.0855 4.90958 7.08925 4.92432 7.09521Z"
                    fill="#FF0000"
                    stroke="#FF0000"
                  />
                </svg>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Open Button (When Sidebar is Closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
        >
          <Image src={barss} alt="menu" width={24} height={24} />
        </button>
      )}
    </>
  );
};

export default Sidebar;