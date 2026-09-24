import { cn } from "../../utils/cn.utils";
import { fieldHint } from "../common/typography.styles";

// Full-screen frame outside the shell: sign-in and the session gate's loading
// and locked-out states. It scrolls on its own when the phone keyboard opens.
export const authScreen =
  "flex h-dvh-safe items-center justify-center overflow-y-auto bg-background px-4 pt-safe pb-safe";

export const authColumn = "flex w-full max-w-sm flex-col gap-6 py-8";

export const authBrand = "flex items-center justify-center gap-2";

export const authBrandLogo = "size-8 shrink-0";

export const authBrandName = "text-3xl font-semibold tracking-tight text-foreground";

export const authForm = "flex flex-col gap-4";

// Full width so the primary action is one easy thumb target on a phone.
export const authSubmit = "w-full";

export const authHint = cn(fieldHint, "text-center");
