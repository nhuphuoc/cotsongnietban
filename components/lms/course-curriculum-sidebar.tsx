"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Lock, Clock } from "lucide-react";
import type { DemoCourse } from "@/lib/demo-courses";
import { getCoursePhases, getLessonsForPhase } from "@/lib/demo-courses";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type Props = {
  course: DemoCourse;
  courseId: string;
  activeLessonId: string;
  /** Mặc định: `/courses/{courseId}/lessons/{lessonId}` (LMS) */
  getLessonHref?: (lessonId: string) => string;
  /** `brand` = cam CSNB (trang học demo công khai); mặc định giữ tím LMS */
  accent?: "brand" | "violet";
};

export function CourseCurriculumSidebar({
  course,
  courseId,
  activeLessonId,
  getLessonHref,
  accent = "violet",
}: Props) {
  const lessonHref =
    getLessonHref ?? ((lessonId: string) => `/courses/${courseId}/lessons/${lessonId}`);
  const doneIcon = accent === "brand" ? "text-csnb-orange-deep" : "text-violet-600";
  const spinIcon = accent === "brand" ? "border-csnb-orange-deep" : "border-violet-600";
  const phases = getCoursePhases(course);
  const done = course.lessons.filter((l) => l.completed).length;
  const total = course.lessons.length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="shrink-0 border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-bold text-neutral-900">Nội dung khóa học</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          {done}/{total} bài đã hoàn thành
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Accordion
          multiple
          defaultValue={phases.map((p) => p.id)}
          className="divide-y divide-neutral-100"
        >
          {phases.map((phase) => {
            const lessons = getLessonsForPhase(course, phase);
            const completedInPhase = lessons.filter((l) => l.completed).length;
            return (
              <AccordionItem key={phase.id} value={phase.id} className="border-0">
                <AccordionTrigger className="px-4 py-3 text-left no-underline hover:bg-neutral-50 hover:no-underline focus-visible:no-underline **:data-[slot=accordion-trigger-icon]:text-neutral-400">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="block text-xs font-semibold text-neutral-900">{phase.title}</span>
                    <span className="mt-0.5 block text-[11px] text-neutral-500">
                      {completedInPhase}/{lessons.length} ·{" "}
                      {lessons.reduce((s, l) => s + l.durationSeconds, 0) >= 3600
                        ? `${Math.round(lessons.reduce((s, l) => s + l.durationSeconds, 0) / 3600)} giờ`
                        : `${Math.round(lessons.reduce((s, l) => s + l.durationSeconds, 0) / 60)} phút`}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0 pt-0 [&_a]:no-underline [&_a:hover]:no-underline">
                  <ul className="border-t border-neutral-100 bg-neutral-50/80">
                    {lessons.map((l) => {
                      const active = l.id === activeLessonId;
                      if (l.locked) {
                        return (
                          <li
                            key={l.id}
                            className="flex min-h-11 items-center gap-3 border-b border-neutral-100/80 px-4 py-2.5 opacity-50"
                          >
                            <Lock className="size-3.5 shrink-0 text-neutral-400" />
                            <span className="min-w-0 flex-1 text-xs text-neutral-500 line-clamp-2">{l.title}</span>
                            <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-neutral-400">
                              <Clock className="size-3" />
                              {l.duration}
                            </span>
                          </li>
                        );
                      }
                      return (
                        <li key={l.id} className="border-b border-neutral-100/80 last:border-0">
                          <Link
                            href={lessonHref(l.id)}
                            className={cn(
                              "flex min-h-11 items-center gap-3 px-4 py-2.5 text-xs no-underline transition-colors hover:bg-white hover:no-underline",
                              active &&
                                (accent === "brand"
                                  ? "border-l-[3px] border-l-csnb-orange-deep bg-csnb-orange/10"
                                  : "border-l-[3px] border-l-violet-600 bg-violet-50/90")
                            )}
                          >
                            {l.completed ? (
                              <CheckCircle2 className={cn("size-3.5 shrink-0", doneIcon)} />
                            ) : active ? (
                              <div className={cn("size-3.5 shrink-0 rounded-full border-2 border-t-transparent", spinIcon)} />
                            ) : (
                              <Circle className="size-3.5 shrink-0 text-neutral-300" />
                            )}
                            <span
                              className={cn(
                                "min-w-0 flex-1 line-clamp-2",
                                active ? "font-semibold text-neutral-900" : "text-neutral-700"
                              )}
                            >
                              {l.title}
                            </span>
                            <span className="flex shrink-0 items-center gap-0.5 tabular-nums text-[10px] text-neutral-500">
                              <Clock className="size-3" />
                              {l.duration}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
