"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

type MenuToggleProps = {
  open: boolean;
};

export default function MenuToggle({ open }: MenuToggleProps) {
  return (
    <div className="relative flex size-10 items-center justify-center">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="close"
            initial={{ opacity: 0, rotate: -90, scale: 0.85 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.85 }}
            transition={{ duration: 0.25 }}
            className="absolute"
          >
            <X className="size-6" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0, rotate: -90, scale: 0.85 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.85 }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute"
          >
            <Menu className="size-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
