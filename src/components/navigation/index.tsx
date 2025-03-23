import { JSX } from "react";
import { cn } from "@/lib/utils";
import { SiRiscv } from "react-icons/si"
import { alfaSlabOne } from "@/lib/fonts/alfaSlabOne";
const Navigation = (): JSX.Element => {
    return (
        <header>
            <div className={cn(
                `bg-gray-200 text-gray-700 py-4 px-8 sm:px-24 h-[48px]`,
                `flex items-center justify-start w-full text-xl gap-4`,
                alfaSlabOne.className
            )}>
                <SiRiscv size={32} className="rounded-sm" />
                <p>Skill Rank</p>
            </div>
        </header>
    )
}
export default Navigation;