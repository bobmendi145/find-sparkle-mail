import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background rounded-full hover:opacity-90",
        destructive: "bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90",
        outline: "border border-border bg-background text-foreground rounded-full hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80",
        ghost: "hover:bg-muted text-foreground rounded-md",
        link: "text-primary underline-offset-4 hover:underline",
        frappe: "bg-foreground text-background rounded-full hover:opacity-90 font-medium",
        "frappe-outline": "border border-border text-foreground rounded-full hover:bg-muted font-medium",
        "frappe-primary": "bg-primary text-primary-foreground rounded-full hover:opacity-90 font-medium",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-10 px-7",
        xl: "h-11 px-8 text-base",
        icon: "h-9 w-9",
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
