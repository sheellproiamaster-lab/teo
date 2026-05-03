"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm"
    >
      <span className="text-2xl font-black text-blue-600 tracking-tight select-none">
        Teo
      </span>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => router.push("/auth")}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-semibold px-5 md:px-7 py-2.5 rounded-full shadow-md transition-colors duration-200 cursor-pointer"
      >
        Acesse o Teo agora
      </motion.button>
    </motion.header>
  );
}
