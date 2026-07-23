"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type ReactNode } from "react";

type ImageWithFallbackProps = ImageProps & {
  fallback?: ReactNode;
  fallbackClassName?: string;
};

function DefaultImageFallback() {
  return (
    <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

export function ImageWithFallback({
  alt,
  fallback,
  fallbackClassName,
  onError,
  fill,
  ...props
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} unavailable`}
        className={
          fallbackClassName ??
          `${fill ? "absolute inset-0" : "h-full w-full"} flex items-center justify-center bg-surface-alt`
        }
      >
        {fallback ?? <DefaultImageFallback />}
      </div>
    );
  }

  return (
    <Image
      {...props}
      fill={fill}
      alt={alt}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
