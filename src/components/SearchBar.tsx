"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; category: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, description')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(8);

        if (!error && data) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (product: { id: string; category: string }) => {
    setIsOpen(false);
    setQuery('');
      
    router.push(`/product/${product.id}`);
  };

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder="Search collections..."
          className="bg-transparent border border-[#1F3324]/30 text-[#1F3324] placeholder-[#1F3324]/60 rounded-full pl-8 pr-4 py-1.5 text-xs outline-none focus:border-[#D4AF37] transition-all w-32 focus:w-48 lg:w-48 lg:focus:w-64"
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1F3324]/60" />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 w-full min-w-[250px] bg-[#EBD4C9] border border-[#1F3324]/10 shadow-lg rounded-md overflow-hidden z-50">
          <ul className="max-h-80 overflow-y-auto py-1">
            {results.map((product) => {
              let descText = product.description || '';
              let colorName = '';
              let fabricSpec = '';
              try {
                if (descText.trim().startsWith('{')) {
                  const parsed = JSON.parse(descText);
                  descText = parsed.text;
                  colorName = parsed.colorName;
                  fabricSpec = parsed.fabricSpec;
                }
              } catch(e) {}
              
              const q = query.toLowerCase();
              let matchedSnippet = '';
              if (colorName && colorName.toLowerCase().includes(q)) {
                matchedSnippet = `Color: ${colorName}`;
              } else if (fabricSpec && fabricSpec.toLowerCase().includes(q)) {
                matchedSnippet = `Fabric: ${fabricSpec}`;
              } else if (descText.toLowerCase().includes(q)) {
                const idx = descText.toLowerCase().indexOf(q);
                const start = Math.max(0, idx - 15);
                const end = Math.min(descText.length, idx + q.length + 15);
                matchedSnippet = `"...${descText.substring(start, end).trim()}..."`;
              }
              
              return (
                <li key={product.id}>
                  <button
                    onClick={() => handleSelect(product)}
                    className="w-full text-left px-4 py-2 hover:bg-[#D4AF37]/10 flex flex-col gap-0.5 group border-b border-[#1F3324]/5 last:border-0"
                  >
                    <span className="text-sm font-serif text-[#1F3324] group-hover:text-[#8A5A19] transition-colors line-clamp-1">{product.name}</span>
                    {matchedSnippet && (
                      <span className="text-[10px] text-[#1F3324]/60 italic line-clamp-1">{matchedSnippet}</span>
                    )}
                    <span className="text-[9px] text-[#8A5A19]/60 uppercase tracking-wider mt-0.5">{product.category}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {isOpen && query.trim() && results.length === 0 && !isSearching && (
        <div className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-[#EBD4C9] border border-[#1F3324]/10 shadow-lg rounded-md p-3 z-50">
          <p className="text-xs text-[#1F3324]/60 text-center">No products found</p>
        </div>
      )}
    </div>
  );
}
