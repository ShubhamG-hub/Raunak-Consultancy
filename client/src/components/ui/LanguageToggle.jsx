import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useLanguage } from "@/context/useLanguage"

const LanguageToggle = () => {
    const { language, setLanguage } = useLanguage();

    const requestLanguageChange = (lang) => {
        // Prevent default behavior to keep scroll position
        setLanguage(lang);
    };



    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-primary-theme/20 hover:text-primary-theme transition-all duration-300">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => requestLanguageChange('en')} className={language === 'en' ? 'bg-accent' : ''}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestLanguageChange('hi')} className={language === 'hi' ? 'bg-accent' : ''}>
                    हिंदी (Hindi)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestLanguageChange('mr')} className={language === 'mr' ? 'bg-accent' : ''}>
                    मराठी (Marathi)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default LanguageToggle;
