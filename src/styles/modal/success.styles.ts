// SuccessModal: a centred check badge above the title and message.
export const successBody = "flex flex-col items-center gap-3 text-center";

// The badge pops in, then its check draws itself (theme.css keyframes).
export const successBadge =
  "flex size-18 items-center justify-center rounded-pill bg-success text-white motion-safe:animate-pop motion-safe:[&_path]:animate-check-draw";

export const successTitle = "text-xl font-bold text-foreground";

export const successText = "text-body leading-relaxed text-muted-foreground";
