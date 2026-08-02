import Logo from "../logo";
import { SheetTitle } from "../ui/sheet";
import MenuToggle from "./menu-toggle";

export default function ClosMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <div className="relative flex items-center justify-between px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <SheetTitle className="sr-only">Navigation</SheetTitle>
      <Logo setOpen={setOpen} compact />

      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Menü schließen"
        className="flex items-center justify-center"
      >
        <MenuToggle open={open} />
      </button>
    </div>
  );
}
