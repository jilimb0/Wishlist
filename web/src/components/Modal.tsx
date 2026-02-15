import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import { Fragment, type ReactNode } from "react"

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
  centered = false,
  fullWidth = false,
  mobileFullscreen = false,
}: ModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div
            className={`flex min-h-full justify-center text-center ${
              centered ? "items-center" : "items-end sm:items-center"
            } ${fullWidth ? "p-4" : "p-4 sm:p-0"}`}
          >
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel as={Fragment}>
                <div
                  className={`relative transform overflow-hidden bg-zinc-950 border border-zinc-800/50 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg backdrop-blur-3xl ring-1 ring-white/10 flex flex-col ${
                    mobileFullscreen
                      ? "fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:rounded-2xl"
                      : fullWidth
                        ? "w-full max-h-[calc(100vh-2rem)] sm:h-auto rounded-[32px] sm:rounded-2xl"
                        : "rounded-2xl max-h-[90vh]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                  <div className="p-6 overflow-y-auto min-h-0">
                    {title && (
                      <Dialog.Title as="h3" className="text-xl font-extrabold text-white mb-4 pr-8">
                        {title}
                      </Dialog.Title>
                    )}
                    <div className="text-zinc-400 text-sm leading-relaxed">{children}</div>
                  </div>
                  {footer && (
                    <div className="bg-zinc-900/50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-zinc-800/50">
                      {footer}
                    </div>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
