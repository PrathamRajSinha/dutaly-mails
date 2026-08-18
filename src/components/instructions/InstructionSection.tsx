import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface InstructionSectionProps {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function InstructionSection({ id, title, description, icon, children, className }: InstructionSectionProps) {
  return (
    <AccordionItem value={id} className={cn("border rounded-xl px-4 bg-white shadow-sm mb-4 overflow-hidden", className)}>
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-3 text-left">
          {icon && <div className="text-primary p-2 bg-primary/5 rounded-lg">{icon}</div>}
          <div>
            <h3 className="text-base font-semibold text-[#1A1730]">{title}</h3>
            {description && <p className="text-sm font-normal text-[#9490B8]">{description}</p>}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-6">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
