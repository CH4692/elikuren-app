import SupportLogo from "../support-logo";

export default function SupportPage() {
  return (
    <section
      id="support"
      className="w-screen flex bg-second-background justify-center items-center"
    >
      <div className="w-full flex justify-around lg:flex-row flex-col items-center px-4 py-2">
        <SupportLogo src="/goethe-institut.svg" width={284} height={88} />
        <SupportLogo src="/sparkasse-wunstorf.png" width={284} height={88} />
        <SupportLogo src="/musik-schule-logo.png" width={284} height={88} />
      </div>
    </section>
  );
}
