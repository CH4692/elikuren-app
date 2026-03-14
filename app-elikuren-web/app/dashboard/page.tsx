import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col gap-6 min-h-screen w-full justify-center items-center ">
      <h1 className=" text-3xl"> Dashboard</h1>
      <ul className="flex flex-col gap-3">
        <li>
          <Link href="/profile">Profile</Link>
        </li>
        <li>
          <Link href="/">Homepage</Link>
        </li>
        <li>
          <Link href="/admin">Admin</Link>
        </li>
      </ul>
    </main>
  );
}
