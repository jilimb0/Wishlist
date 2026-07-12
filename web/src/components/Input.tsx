import { forwardRef, type InputHTMLAttributes, type ReactNode, useMemo, useState } from "react"

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "ref"> {
  error?: boolean | string
  success?: boolean
  rightElement?: ReactNode
  containerClassName?: string
  disableValidation?: boolean
  showValidationMessage?: boolean
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getValidationMessage(args: {
  value: string
  type?: string
  required?: boolean
  minLength?: number
}) {
  const { value, type, required, minLength } = args

  if (required && !value.trim()) return "This field is required"

  if (type === "email" && value.trim() && !isValidEmail(value.trim())) {
    return "Enter a valid email"
  }

  const effectiveMinLength = type === "password" && !minLength ? 6 : minLength
  if (effectiveMinLength && value && value.length < effectiveMinLength) {
    if (type === "password") return `Password must be at least ${effectiveMinLength} characters`
    return `Must be at least ${effectiveMinLength} characters`
  }

  return null
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, forwardedRef) => {
  const {
    error,
    success,
    rightElement,
    className = "",
    containerClassName = "",
    disableValidation,
    showValidationMessage = true,
    onBlur,
    onChange,
    type,
    required,
    minLength,
    value,
    ...rest
  } = props

  const [touched, setTouched] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const valueStr = typeof value === "string" ? value : ""

  const externalErrorMessage = typeof error === "string" ? error : null
  const effectiveErrorMessage = externalErrorMessage ?? localError

  const hasError = Boolean(error) || Boolean(localError)

  const validationMessage = useMemo(() => {
    if (disableValidation) return null
    return getValidationMessage({
      value: valueStr,
      type,
      required,
      minLength: typeof minLength === "number" ? minLength : undefined,
    })
  }, [disableValidation, minLength, required, type, valueStr])

  return (
    <div className={`w-full ${containerClassName}`}>
      <div className="relative w-full">
        <input
          ref={(node) => {
            if (typeof forwardedRef === "function") forwardedRef(node)
            else if (forwardedRef)
              (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node
          }}
          className={`w-full bg-zinc-900/50 border ${
            hasError
              ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
              : success
                ? "border-brand-500/50 focus:border-brand-500/50 focus:ring-brand-500/20"
                : "border-zinc-800 focus:border-brand-500/50 focus:ring-brand-500/20"
          } rounded-xl px-4 py-2.5 text-white placeholder-zinc-700 focus:outline-none focus:ring-1 transition-all ${
            rightElement ? "pr-12" : ""
          } ${className}`}
          aria-invalid={hasError ? "true" : "false"}
          type={type}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => {
            onChange?.(e)

            if (disableValidation) return
            if (!touched) return

            const msg = getValidationMessage({
              value: e.currentTarget.value,
              type,
              required,
              minLength: typeof minLength === "number" ? minLength : undefined,
            })
            e.currentTarget.setCustomValidity(msg ?? "")
            setLocalError(msg)
          }}
          onBlur={(e) => {
            setTouched(true)
            onBlur?.(e)

            if (disableValidation) return

            const msg = getValidationMessage({
              value: e.currentTarget.value,
              type,
              required,
              minLength: typeof minLength === "number" ? minLength : undefined,
            })

            e.currentTarget.setCustomValidity(msg ?? "")
            setLocalError(msg)
          }}
          {...rest}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {showValidationMessage && touched && effectiveErrorMessage && (
        <p className="text-red-400 text-sm mt-1 ml-1 block animate-in fade-in slide-in-from-top-1">
          {effectiveErrorMessage}
        </p>
      )}

      {showValidationMessage && touched && !effectiveErrorMessage && validationMessage && (
        <p className="text-red-400 text-sm mt-1 ml-1 block animate-in fade-in slide-in-from-top-1">
          {validationMessage}
        </p>
      )}
    </div>
  )
})

Input.displayName = "Input"
