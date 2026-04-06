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
    <div className="relative flex justify-around items-center p-2">
      <SheetTitle className="sr-only">Navigation</SheetTitle>
      <Logo setOpen={setOpen} />

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
