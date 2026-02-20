import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext(null)

const DropdownMenu = ({ children }) => {
    const [open, setOpen] = React.useState(false)
    const dropdownRef = React.useRef(null)

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block text-left" ref={dropdownRef}>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

const DropdownMenuTrigger = ({ children, asChild }) => {
    const { open, setOpen } = React.useContext(DropdownMenuContext)

    const handleClick = () => setOpen(!open)

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: (e) => {
                if (children.props.onClick) children.props.onClick(e)
                handleClick()
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
    const { open } = React.useContext(DropdownMenuContext)
    if (!open) return null

    const alignmentClasses = {
        start: "left-0",
        center: "left-1/2 -translate-x-1/2",
        end: "right-0",
    }

    return (
        <div
            className={cn(
                "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
                alignmentClasses[align],
                className
            )}
        >
            {children}
        </div>
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
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
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
    <div className={cn("-mx-1 my-1 h-px bg-slate-100", className)} />
)

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
}
