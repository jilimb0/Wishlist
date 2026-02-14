import { useRef, useState, useEffect } from "react"

interface Option {
  id: string
  label: string
  value: string
  icon?: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function CustomSelect({
  options,
  value,
  onChange,
  disabled,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value) || options[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/30 rounded-xl px-3 h-10 text-sm text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-between group ${
          isOpen ? "border-brand-500/50 bg-zinc-800" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          {selectedOption.icon && <span>{selectedOption.icon}</span>}
          <span>{selectedOption.label}</span>
        </div>
        <span
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-400" : "text-zinc-500"
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                  option.value === value
                    ? "bg-brand-500/10 text-brand-400 font-medium"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {option.icon && (
                  <span className="text-base w-5 text-center">
                    {option.icon}
                  </span>
                )}
                <span className="flex-1">{option.label}</span>
                {option.value === value && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
