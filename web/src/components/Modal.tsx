import { Dialog, DialogClose, DialogTitle } from "@ui-construction-library/core"
import type { ReactNode } from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  centered?: boolean
  fullWidth?: boolean
  mobileFullscreen?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  fullWidth = false,
  mobileFullscreen = false,
}: ModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      className={`relative transform overflow-hidden bg-zinc-950 border border-zinc-800/50 text-left shadow-2xl transition-all backdrop-blur-3xl ring-1 ring-white/10 flex flex-col ${
        mobileFullscreen
          ? "fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:rounded-2xl"
          : fullWidth
            ? "w-full max-h-[calc(100vh-2rem)] sm:h-auto rounded-[32px] sm:rounded-2xl"
            : "rounded-2xl max-h-[90vh] sm:my-8 sm:w-full sm:max-w-lg"
      }`}
    >
      <DialogClose asChild>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
          aria-label="Close"
        >
          ✕
        </button>
      </DialogClose>
      <div className="p-6 overflow-y-auto min-h-0">
        {title ? (
          <DialogTitle className="text-xl font-extrabold text-white mb-4 pr-8">{title}</DialogTitle>
        ) : null}
        <div className="text-zinc-400 text-sm leading-relaxed">{children}</div>
      </div>
      {footer != null ? (
        <div className="bg-zinc-900/50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-zinc-800/50">
          {footer}
        </div>
      ) : null}
    </Dialog>
  )
}
