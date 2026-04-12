"use client";

import { Play } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type ProgramPhase = {
  id: string;
  title: string;
  lessons: { id: string; title: string; duration: string }[];
};

type Props = {
  phases: ProgramPhase[];
};

export function CourseProgramAccordion({ phases }: Props) {
  const defaultOpen = phases[0]?.id;

  return (
    <Accordion
      multiple
      defaultValue={defaultOpen ? [defaultOpen] : undefined}
      className="divide-y divide-csnb-border/20 rounded-xl border border-csnb-border/25 bg-white"
    >
      {phases.map((phase) => (
        <AccordionItem key={phase.id} value={phase.id} className="border-0 px-0">
          <AccordionTrigger className="px-4 py-3.5 text-left no-underline hover:bg-csnb-panel/60 hover:no-underline focus-visible:no-underline sm:px-5">
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-2">
              <span className="font-sans text-sm font-bold text-csnb-ink">{phase.title}</span>
              <span className="shrink-0 font-sans text-xs text-neutral-500">{phase.lessons.length} bài</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0 [&_a]:no-underline [&_a:hover]:no-underline">
            <ul className="border-t border-csnb-border/15 bg-csnb-panel/40">
              {phase.lessons.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 border-b border-csnb-border/10 px-4 py-2.5 last:border-0 sm:px-5"
                >
                  <Play className="size-3.5 shrink-0 text-csnb-orange-deep" aria-hidden />
                  <span className="min-w-0 flex-1 font-sans text-sm text-csnb-ink">{l.title}</span>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-neutral-500">{l.duration}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
