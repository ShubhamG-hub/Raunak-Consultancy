import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext(null)

const DropdownMenu = ({ children }) => {
    const [open, setOpen] = React.useState(false)
    const triggerRef = React.useRef(null)

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
            <div className="relative inline-block text-left" ref={triggerRef}>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

const DropdownMenuTrigger = ({ children, asChild }) => {
    const { open, setOpen } = React.useContext(DropdownMenuContext)

    const handleClick = (e) => {
        e.stopPropagation()
        setOpen(!open)
    }

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: (e) => {
                if (children.props.onClick) children.props.onClick(e)
                handleClick(e)
            }
        })
    }

    return (
        <div onClick={handleClick} className="cursor-pointer inline-flex">
            {children}
        </div>
    )
}

const DropdownMenuContent = ({ children, align = "end", className }) => {
    const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext)
    const contentRef = React.useRef(null)
    const [position, setPosition] = React.useState({ top: 0, left: 0, right: 0 })

    // Calculate position from trigger element
    React.useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setPosition({
                top: rect.bottom + 8,
                left: rect.left,
                right: window.innerWidth - rect.right,
                centerX: rect.left + rect.width / 2,
            })
        }
    }, [open, triggerRef])

    // Close on click outside
    React.useEffect(() => {
        if (!open) return

        const handleClickOutside = (event) => {
            if (
                triggerRef.current && !triggerRef.current.contains(event.target) &&
                contentRef.current && !contentRef.current.contains(event.target)
            ) {
                setOpen(false)
            }
        }

        // Close on scroll
        const handleScroll = () => setOpen(false)

        // Close on Escape key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false)
        }

        document.addEventListener("mousedown", handleClickOutside)
        window.addEventListener("scroll", handleScroll, { passive: true })
        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            window.removeEventListener("scroll", handleScroll)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [open, setOpen, triggerRef])

    if (!open) return null

    const style = {
        position: 'fixed',
        top: `${position.top}px`,
        zIndex: 9999,
    }

    if (align === "end") {
        style.right = `${position.right}px`
    } else if (align === "start") {
        style.left = `${position.left}px`
    } else {
        style.left = `${position.centerX}px`
        style.transform = 'translateX(-50%)'
    }

    return createPortal(
        <div
            ref={contentRef}
            className={cn(
                "min-w-[8rem] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 text-slate-950 dark:text-slate-100 shadow-xl",
                className
            )}
            style={style}
        >
            {children}
        </div>,
        document.body
    )
}

const DropdownMenuItem = ({ children, onClick, className }) => {
    const { setOpen } = React.useContext(DropdownMenuContext)

    const handleClick = (e) => {
        if (onClick) onClick(e)
        setOpen(false)
    }

    return (
        <div
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            onClick={handleClick}
        >
            {children}
        </div>
    )
}

const DropdownMenuLabel = ({ children, className }) => (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
        {children}
    </div>
)

const DropdownMenuSeparator = ({ className }) => (
    <div className={cn("-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800", className)} />
)

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
}
