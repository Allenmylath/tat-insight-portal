import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-yellow)] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline: "border-3 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground shadow-[var(--shadow-yellow)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-yellow)] hover:shadow-2xl font-bold border-2 border-primary/20 hover:scale-[1.02] active:scale-[0.98]",
        government: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-primary/30 shadow-md hover:shadow-lg",
        saffron: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-yellow)] hover:shadow-xl font-semibold hover:scale-[1.02] active:scale-[0.98]",
        action: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-yellow)] hover:shadow-xl font-bold hover:scale-[1.05] active:scale-[0.95] transition-all duration-200",
        "military-green": "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-yellow)] hover:shadow-xl font-bold border-2 border-primary-foreground/10 hover:scale-[1.02] active:scale-[0.98]",
        champion: "bg-[var(--gradient-champion)] text-[hsl(var(--champion-gold-foreground))] hover:opacity-90 shadow-[var(--shadow-champion)] hover:shadow-xl font-bold hover:scale-[1.05] active:scale-[0.95] transition-all duration-200",
        // NEW - Snapchat-style variants
        snap: "bg-primary text-black font-bold rounded-full shadow-[var(--shadow-yellow)] hover:scale-105 transition-transform",
        "snap-outline": "border-3 border-primary text-primary bg-black rounded-full hover:bg-primary hover:text-black shadow-[var(--shadow-yellow)]",
      },
      size: {
        default: "h-12 px-6 py-3 text-base font-bold rounded-full touch-target",
        sm: "h-9 rounded-full px-4 text-sm font-semibold",
        lg: "h-14 rounded-full px-8 text-lg font-bold touch-target-lg",
        xl: "h-16 rounded-full px-10 text-xl font-bold touch-target-lg",
        icon: "h-12 w-12 rounded-full touch-target",
        mobile: "h-14 px-6 py-4 text-base font-bold rounded-full w-full touch-target-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
