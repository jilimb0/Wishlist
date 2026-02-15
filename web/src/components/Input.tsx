import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string
  success?: boolean
  rightElement?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, success, rightElement, className = "", containerClassName = "", ...props }, ref) => {
    return (
      <div className={`relative w-full ${containerClassName}`}>
        <input
          ref={ref}
          className={`w-full bg-zinc-900/50 border ${
            error
              ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
              : success
                ? "border-brand-500/50 focus:border-brand-500/50 focus:ring-brand-500/20"
                : "border-zinc-800 focus:border-brand-500/50 focus:ring-brand-500/20"
          } rounded-xl px-4 py-2.5 text-white placeholder-zinc-700 focus:outline-none focus:ring-1 transition-all ${
            rightElement ? "pr-12" : ""
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    )
  },
)

Input.displayName = "Input"
