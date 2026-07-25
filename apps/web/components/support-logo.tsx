import Image from "next/image";

export default function SupportLogo({
  src,
  width,
  height,
  testId,
}: {
  src: string;
  width?: number;
  height?: number;
  testId: string;
}) {
  return (
    <Image
      src={src}
      alt="Logo"
      data-testid={testId}
      width={width}
      height={height}
      priority
    />
  );
}
