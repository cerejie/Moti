import { cva } from "class-variance-authority";

// Twelve-column bento grid. Cells declare a BentoSpan and collapse to full
// width on compact screens, which is what makes the dashboard readable on a phone.
export const bentoGrid = "grid grid-cols-1 gap-4 wide:grid-cols-12";

export const bentoCell = cva("min-w-0", {
  variants: {
    span: {
      quarter: "wide:col-span-3",
      third: "wide:col-span-4",
      half: "wide:col-span-6",
      twoThirds: "wide:col-span-8",
      full: "wide:col-span-12",
    },
  },
  defaultVariants: { span: "full" },
});
