import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function Toast({ show, message = "Sesión iniciada con éxito" }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 bg-primary-700 text-white px-5 py-3 rounded-lg shadow-xl"
        >
          <CheckCircle2 size={18} className="text-white shrink-0" />
          <span className="text-sm font-medium tracking-tight">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
