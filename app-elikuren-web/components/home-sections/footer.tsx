import Link from "next/link";
import Logo from "../logo";
import { Separator } from "../ui/separator";
import { FaYoutube, FaFacebookF, FaInstagram } from "react-icons/fa";

export default function FooterPage() {
  return (
    <footer
      id="footer"
      className="w-screen flex flex-col gap-8 justify-center py-8 lg:px-24 px-8 items-center"
    >
      <div className="w-full flex items-center flex-col lg:flex-row lg:justify-between gap-4">
        <Logo />
        <div className="flex gap-4">
          <Link href="https://www.youtube.com/@elikuren7330">
            <FaYoutube className="h-6 w-6" />
          </Link>
          <Link href="https://www.facebook.com/Elikuren/">
            <FaFacebookF className="h-6 w-6" />
          </Link>
          <Link href="https://www.instagram.com/kammerchor.elikuren/">
            <FaInstagram className="h-6 w-6" />
          </Link>
        </div>
      </div>
      <Separator />
      <div className="w-full flex lg:justify-between flex-col lg:flex-row gap-4 ">
        <p>Copyright © 2026 Kammerchor Elikuren e.V. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
        </div>
      </div>
    </footer>
  );
}
