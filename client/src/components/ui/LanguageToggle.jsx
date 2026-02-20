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

    const getLabel = (lang) => {
        switch (lang) {
            case 'en': return 'English';
            case 'hi': return 'हिंदी';
            case 'mr': return 'मराठी';
            default: return 'English';
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
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
