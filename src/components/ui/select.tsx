"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export type SelectOption = { value: string; label: string };

type Props = {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
};

const variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeInOut" },
  },
};

export default function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  error,
  className = "",
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Manage keyboard nav
  function openAndFocus(idx: number) {
    setOpen(true);
    setActiveIndex(idx);
    setTimeout(() => listRef.current?.focus(), 0);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        openAndFocus(
          Math.max(
            0,
            selected ? options.findIndex((o) => o.value === value) : 0
          )
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        openAndFocus(
          Math.max(
            0,
            selected ? options.findIndex((o) => o.value === value) : 0
          )
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        openAndFocus(
          selected ? options.findIndex((o) => o.value === value) : 0
        );
        break;
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) =>
          Math.min(options.length - 1, i === -1 ? 0 : i + 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i === -1 ? 0 : i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex > -1) selectOption(options[activeIndex]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  function selectOption(opt: SelectOption) {
    onChange?.(opt.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={`w-full h-10 px-3 pr-9 rounded-md text-left flex items-center justify-between bg-background border transition-colors ${
          error ? "border-red-500" : "border-input focus:border-dhack-orange/30"
        } text-foreground focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0`}
      >
        <span className={selected ? "text-foreground" : "text-slate-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span
          aria-hidden
          className={`absolute right-3 ${
            open ? "text-dhack-teal" : "text-slate-400"
          }`}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            tabIndex={-1}
            role="listbox"
            aria-activedescendant={
              activeIndex > -1 ? `select-option-${activeIndex}` : undefined
            }
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            className="absolute z-50 mt-2 w-full max-h-56 overflow-auto rounded-md border border-dhack-teal/30 bg-popover backdrop-blur-sm shadow-lg focus:outline-none origin-top"
            onKeyDown={onListKeyDown}
          >
            {options.map((opt, idx) => {
              const isActive = idx === activeIndex;
              const isSelected = value === opt.value;
              return (
                <li
                  id={`select-option-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  key={opt.value + idx}
                  className={`px-3 py-2 flex items-center justify-between cursor-pointer select-none transition-colors ${
                    isActive ? "bg-dhack-teal/20" : "hover:bg-dhack-teal/10"
                  } ${isSelected ? "text-dhack-teal" : "text-foreground"}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => selectOption(opt)}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
