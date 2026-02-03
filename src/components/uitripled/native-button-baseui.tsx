"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

type NativeButtonProps = React.ComponentProps<typeof Button> & {
  href?: string;
};

export const NativeButton = React.forwardRef<
  HTMLButtonElement,
  NativeButtonProps
>(({ href, children, onClick, ...props }, ref) => {
  if (href) {
    return (
      <Button asChild {...props}>
        <a
          href={href}
          onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        >
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button ref={ref} onClick={onClick} {...props}>
      {children}
    </Button>
  );
});

NativeButton.displayName = "NativeButton";
