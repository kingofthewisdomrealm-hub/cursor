import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
}

const variants = {
  primary:
    "bg-leaf text-white shadow-sm shadow-leaf/20 hover:bg-leaf-deep active:scale-[0.98]",
  secondary:
    "bg-sand-deep text-ink hover:bg-mist active:scale-[0.98]",
  ghost: "bg-transparent text-ink-soft hover:bg-sand-deep/60",
  outline:
    "border border-ink/15 bg-white/50 text-ink hover:bg-white active:scale-[0.98]",
};

const sizes = {
  sm: "px-3.5 py-2 text-sm rounded-xl",
  md: "px-5 py-3 text-sm rounded-2xl",
  lg: "px-6 py-3.5 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
