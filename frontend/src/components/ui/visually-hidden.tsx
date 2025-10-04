import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const visuallyHiddenVariants = cva(
  "absolute w-px h-px p-0 -m-px overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0",
  {
    variants: {
      variant: {
        default: "",
        screenReader: "sr-only",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface VisuallyHiddenProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof visuallyHiddenVariants> {
  asChild?: boolean;
}

const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        className={cn(visuallyHiddenVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
