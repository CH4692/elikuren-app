import Image from "next/image";

export default function SupportLogo({
  src,
  width,
  height,
  testId,
  alt = "",
}: {
  src: string;
  width?: number;
  height?: number;
  testId: string;
  alt?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      data-testid={testId}
      width={width}
      height={height}
      priority
    />
  );
}
