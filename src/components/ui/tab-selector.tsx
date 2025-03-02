"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabSelectorProps {
  options: TabOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: "default" | "outline" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  disabledTabClassName?: string;
}

export const TabSelector = ({
  options,
  defaultValue,
  value: controlledValue,
  onChange,
  variant = "default",
  size = "md",
  fullWidth = false,
  className,
  tabClassName,
  activeTabClassName,
  inactiveTabClassName,
  disabledTabClassName,
}: TabSelectorProps) => {
  const [selectedTab, setSelectedTab] = useState<string>(
    defaultValue || (options.length > 0 ? options[0].id : "")
  );

  // Handle controlled component behavior
  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedTab(controlledValue);
    }
  }, [controlledValue]);

  const handleTabClick = (tabId: string) => {
    if (controlledValue === undefined) {
      setSelectedTab(tabId);
    }
    onChange?.(tabId);
  };

  // Determine container styles based on variant and size
  const containerStyles = cn(
    "flex",
    {
      // Variant styles
      "bg-gray-100 p-1 rounded-lg": variant === "default",
      "border rounded-lg p-1": variant === "outline",
      "gap-2": variant === "pills" || variant === "underline",
      
      // Size styles
      "text-sm": size === "sm",
      "text-base": size === "md",
      "text-lg": size === "lg",
      
      // Width styles
      "w-full": fullWidth,
      "inline-flex": !fullWidth,
    },
    className
  );

  // Get tab styles based on state and variant
  const getTabStyles = (tabId: string, disabled?: boolean) => {
    const isActive = selectedTab === tabId;
    
    return cn(
      "flex items-center justify-center transition-all duration-200 ease-in-out",
      {
        // Common styles
        "px-4 py-2 rounded-md font-medium": true,
        "cursor-pointer": !disabled,
        "cursor-not-allowed opacity-50": disabled,
        
        // Size-specific padding
        "px-3 py-1": size === "sm",
        "px-4 py-2": size === "md",
        "px-5 py-3": size === "lg",
        
        // Width styles
        "flex-1": fullWidth,
        
        // Variant-specific active styles
        "bg-white text-blue-600 shadow-sm": isActive && variant === "default",
        "bg-blue-600 text-white": isActive && variant === "pills",
        "border-b-2 border-blue-600 text-blue-600": isActive && variant === "underline",
        "bg-white border-blue-600 text-blue-600 border": isActive && variant === "outline",
        
        // Variant-specific inactive styles
        "text-gray-600 hover:bg-gray-200 hover:text-gray-900": !isActive && !disabled && variant === "pills",
        "text-gray-600 hover:text-gray-900": !isActive && !disabled && (variant === "underline" || variant === "default" || variant === "outline"),
      },
      tabClassName,
      isActive ? activeTabClassName : inactiveTabClassName,
      disabled && disabledTabClassName
    );
  };

  return (
    <div className={containerStyles}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={option.disabled}
          className={getTabStyles(option.id, option.disabled)}
          onClick={() => !option.disabled && handleTabClick(option.id)}
        >
          {option.icon && (
            <span className={cn("mr-2", size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5")}>
              {option.icon}
            </span>
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}; 