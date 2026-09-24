import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only knows Tailwind's stock scales. Moti's shadow and radius
// tokens in theme.css must be registered here, or a wrapper's shadow-card-sm
// would never override the shadow-sm a generated shadcn component ships with.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ["card-sm", "card-md", "card-lg"],
      radius: ["pill"],
    },
  },
});

// Merges conditional class names and resolves conflicting Tailwind utilities.
// Used by every generated component in src/components/ui/.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
