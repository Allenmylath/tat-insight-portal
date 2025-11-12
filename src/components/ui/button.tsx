import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline: "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl font-bold border-2 border-primary/20 hover:scale-[1.02] active:scale-[0.98]",
        government: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-primary/30 shadow-md hover:shadow-lg",
        saffron: "bg-[var(--gradient-saffron)] text-[hsl(var(--saffron-foreground))] hover:opacity-90 shadow-lg hover:shadow-xl font-semibold hover:scale-[1.02] active:scale-[0.98]",
        // NEW - Youth-focused variants for 18-24 males
        action: "bg-[var(--gradient-action-red)] text-[hsl(var(--action-red-foreground))] hover:opacity-90 shadow-[var(--shadow-action)] hover:shadow-xl font-bold hover:scale-[1.05] active:scale-[0.95] transition-all duration-200",
        "military-green": "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-military)] hover:shadow-xl font-bold border-2 border-primary-foreground/10 hover:scale-[1.02] active:scale-[0.98]",
        champion: "bg-[var(--gradient-champion)] text-[hsl(var(--champion-gold-foreground))] hover:opacity-90 shadow-[var(--shadow-champion)] hover:shadow-xl font-bold hover:scale-[1.05] active:scale-[0.95] transition-all duration-200",
      },
      size: {
        default: "h-11 px-5 py-2.5 touch-target", // Mobile-optimized with touch target
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-10 text-base touch-target-lg", // Better for mobile CTAs
        xl: "h-14 rounded-lg px-12 text-lg font-bold touch-target-lg", // Extra large for primary CTAs
        icon: "h-11 w-11 touch-target", // Optimal touch target for icons
        mobile: "h-12 px-6 text-base touch-target-lg", // NEW - Optimized specifically for mobile
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
