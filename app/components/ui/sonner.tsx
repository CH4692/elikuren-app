"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-center"
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#1E3A2F",
          "--normal-text": "#F4F1EB",
          "--normal-border": "rgba(200, 162, 77, 0.35)",
          "--success-bg": "#1E3A2F",
          "--success-text": "#F4F1EB",
          "--success-border": "rgba(200, 162, 77, 0.35)",
          "--error-bg": "#7F1D1D",
          "--error-text": "#FEF2F2",
          "--error-border": "rgba(248, 113, 113, 0.45)",
          "--warning-bg": "#78350F",
          "--warning-text": "#FFFBEB",
          "--warning-border": "rgba(251, 191, 36, 0.45)",
          "--info-bg": "#1E3A5F",
          "--info-text": "#F4F1EB",
          "--info-border": "rgba(147, 197, 253, 0.35)",
          "--border-radius": "16px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
