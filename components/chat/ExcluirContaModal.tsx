"use client";
import { useState } from "react";
import Image from "next/image";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ExcluirContaModal({ open, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-b from-blue-50 to-white px-6 pt-8 pb-4 flex flex-col items-center text-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg mb-3">
            <Image src="/teo-avatar.jpeg" alt="Teo" fill className="object-cover" />
          </div>
          <span className="text-4xl mb-4">💔</span>
          <h2 className="text-xl font-black text-slate-800 leading-snug mb-2">
            Tem certeza que vai excluir o Teo da sua vida?
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Todas as suas conversas, memórias e dados serão apagados para sempre. Essa ação não pode ser desfeita.
          </p>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-sm shadow-md hover:from-blue-700 hover:to-cyan-600 transition-all"
          >
            Continuar com o Teo
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-3 rounded-2xl border border-red-200 text-red-400 font-semibold text-sm hover:bg-red-50 transition-all disabled:opacity-50"
          >
            {loading ? "Excluindo..." : "Excluir o Teo da minha vida"}
          </button>
          <p className="text-center text-2xl">😢</p>
        </div>
      </div>
    </div>
  );
}
