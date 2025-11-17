import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cx } from "../../../utils/ui-helpers.js";

export function Dialog({ children, open, onOpenChange }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogTrigger({ children, asChild = true }) {
  return <DialogPrimitive.Trigger asChild={asChild}>{children}</DialogPrimitive.Trigger>;
}

export function DialogContent({ children, className }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-[var(--overlay-dark)]" />
      <DialogPrimitive.Content className={cx(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-(--color-border) bg-white p-5 shadow-2xl",
        className
      )}>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ title, description }) {
  return (
    <div className="mb-3">
      {title && <h3 className="text-lg font-semibold text-[var(--color-primary1)]">{title}</h3>}
      {description && <p className="text-sm text-[var(--color-secondary2)]">{description}</p>}
    </div>
  );
}

export function DialogClose({ children, asChild = true }) {
  return <DialogPrimitive.Close asChild={asChild}>{children}</DialogPrimitive.Close>;
}
