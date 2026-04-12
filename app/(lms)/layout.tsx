import { LmsAppShell } from "@/components/layout/LmsAppShell";

export default function LmsLayout({ children }: { children: React.ReactNode }) {
  return <LmsAppShell>{children}</LmsAppShell>;
}
