import { ReactNode, useEffect } from "react"

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div
        className="bottom-sheet-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="bottom-sheet-handle-area">
          <div className="bottom-sheet-handle" />
        </div>

        {title && (
          <h2 className="text-center text-lg font-bold text-white mb-4">
            {title}
          </h2>
        )}

        <div className="bottom-sheet-body">{children}</div>
      </div>
    </div>
  )
}
