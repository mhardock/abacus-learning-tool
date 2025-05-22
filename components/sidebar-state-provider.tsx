"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface SidebarStateContextType {
  isAddSubtractExpanded: boolean
  setIsAddSubtractExpanded: (expanded: boolean) => void
  isMultiplyExpanded: boolean
  setIsMultiplyExpanded: (expanded: boolean) => void
  isDivideExpanded: boolean
  setIsDivideExpanded: (expanded: boolean) => void
}

const SidebarStateContext = createContext<SidebarStateContextType | undefined>(undefined)

export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const [isAddSubtractExpanded, setIsAddSubtractExpanded] = useState(false)
  const [isMultiplyExpanded, setIsMultiplyExpanded] = useState(false)
  const [isDivideExpanded, setIsDivideExpanded] = useState(false)

  return (
    <SidebarStateContext.Provider
      value={{
        isAddSubtractExpanded,
        setIsAddSubtractExpanded,
        isMultiplyExpanded,
        setIsMultiplyExpanded,
        isDivideExpanded,
        setIsDivideExpanded,
      }}
    >
      {children}
    </SidebarStateContext.Provider>
  )
}

export function useSidebarState() {
  const context = useContext(SidebarStateContext)
  if (context === undefined) {
    throw new Error("useSidebarState must be used within a SidebarStateProvider")
  }
  return context
}