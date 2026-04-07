import Image from "next/image";

export default function SupportLogo({
  src,
  width,
  height,
}: {
  src: string;
  width?: number;
  height?: number;
}) {
  return <Image src={src} alt="Logo" width={width} height={height} priority />;
}
