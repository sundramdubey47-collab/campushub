"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

type Option = { value: string; label: string }

export function Autocomplete({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
}) {
  const [inputText, setInputText] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    setInputText(selected ? selected.label : "")
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(inputText.toLowerCase())
  )

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        placeholder={placeholder}
        disabled={disabled}
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value)
          setShowSuggestions(true)
          if (e.target.value === "") onChange("")
        }}
        onFocus={() => setShowSuggestions(true)}
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md">
         {filtered.map((option) => (
  <div
    key={option.value}
    className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
    onMouseDown={(e) => {
      e.preventDefault()
      onChange(option.value)
      setInputText(option.label)
      setShowSuggestions(false)
    }}
  >
    {option.label}
  </div>
))}
        </div>
      )}
    </div>
  )
}