import * as React from "react";

export type ToastActionElement = React.ReactElement;

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    { className, variant = "default", title, description, action, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={[
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
          variant === "destructive"
            ? "border-destructive bg-destructive text-destructive-foreground"
            : "bg-background text-foreground",
          className || "",
        ].join(" ")}
        {...props}
      >
        <div className="grid gap-1">
          {title ? <div className="font-semibold">{title}</div> : null}
          {description ? (
            <div className="text-muted-foreground text-sm">{description}</div>
          ) : null}
        </div>
        {action}
      </div>
    );
  }
);
Toast.displayName = "Toast";

export function ToastAction({
  altText,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { altText: string }) {
  return (
    <button
      className="ring-offset-background focus:ring-ring hover:bg-secondary inline-flex h-8 items-center justify-center rounded-md bg-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
      {...props}
    />
  );
}

export function ToastViewport({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className || "",
      ].join(" ")}
      {...props}
    />
  );
}
