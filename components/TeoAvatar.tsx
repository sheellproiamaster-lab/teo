"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function TeoAvatar() {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative mt-4"
    >
      {/* Rotating dashed ring */}
      <div className="absolute -inset-4 rounded-full border-2 border-dashed border-blue-300 spin-slow pointer-events-none" />
      {/* Glow */}
      <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-blue-200/50 to-cyan-300/30 blur-lg pointer-events-none" />

      <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-blue-300 shadow-2xl overflow-hidden">
        <Image
          src="/teo-avatar.jpeg"
          alt="Teo"
          fill
          className="object-cover"
          priority
        />
      </div>
    </motion.div>
  );
}
