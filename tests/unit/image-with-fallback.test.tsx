import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    className,
    onError,
  }: {
    alt: string;
    src: string;
    className?: string;
    onError?: React.ReactEventHandler<HTMLImageElement>;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} className={className} onError={onError} />
  ),
}));

describe("ImageWithFallback", () => {
  it("shows an accessible placeholder when the image fails", () => {
    render(
      <ImageWithFallback
        src="/uploads/missing.jpg"
        alt="Missing article image"
        width={100}
        height={100}
      />
    );

    fireEvent.error(screen.getByAltText("Missing article image"));

    expect(screen.getByRole("img", { name: "Missing article image unavailable" })).toBeInTheDocument();
  });
});
