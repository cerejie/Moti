import { cva } from "class-variance-authority";

// Twelve-column bento grid. Cells declare a BentoSpan and collapse to full
// width below md, which is what makes the dashboard readable on a phone.
export const bentoGrid = "grid grid-cols-1 gap-4 md:grid-cols-12";

export const bentoCell = cva("min-w-0", {
  variants: {
    span: {
      quarter: "md:col-span-3",
      third: "md:col-span-4",
      half: "md:col-span-6",
      twoThirds: "md:col-span-8",
      full: "md:col-span-12",
    },
  },
  defaultVariants: { span: "full" },
});
