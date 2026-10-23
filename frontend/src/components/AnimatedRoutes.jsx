import { useRoutes, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";

//  Aqui Recibe un arreglo 
// y eldesplazamiento.
export default function AnimatedRoutes({ routes }) {
  const location = useLocation();
  const element = useRoutes(routes, location);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
}
