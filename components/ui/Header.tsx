"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter(); 

  return (
    <header className="border-b border-gray-100/20 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="cursor-pointer text-2xl font-bold text-[#163300]" onClick={() => router.push('/')}>プロイー</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-[#163300] hover:text-[#9fe870] transition-colors font-medium">
              ログイン
            </button>
            <button className="bg-[#9fe870] text-[#163300] px-6 py-2 rounded-full font-medium hover:bg-[#8fd960] transition-colors">
              無料で始める
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;