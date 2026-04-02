export default function Layout({
  children,
  about,
  concerts,
  joinus,
  support,
}: {
  children: React.ReactNode;
  about: React.ReactNode;
  concerts: React.ReactNode;
  joinus: React.ReactNode;
  support: React.ReactNode;
}) {
  return (
    <>
      {children}
      <div>{about}</div>
      <div>{concerts}</div>
      <div>{joinus}</div>
      <div>{support}</div>
    </>
  );
}
