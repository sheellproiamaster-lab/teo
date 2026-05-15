"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat, type Conversation } from "@/context/ChatContext";
import SubscriptionModal from "./SubscriptionModal";
import UsageModal from "./UsageModal";
import MemoriaModal from "./MemoriaModal";
import ExcluirContaModal from "./ExcluirContaModal";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ open, onClose }: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { conversations, activeId, setActiveId, newConversation, deleteConversation, renameConversation, toggleFavorite, userMemory, saveMemory } = useChat();
  const [subOpen, setSubOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);
  const [memoriaOpen, setMemoriaOpen] = useState(false);
  const [excluirOpen, setExcluirOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const isPro = user?.plan === "pro";

  const handleSelect = (id: string) => setActiveId(id);
  const handleNew = () => newConversation();

  const startRename = (conv: Conversation) => {
    setRenameId(conv.id);
    setRenameVal(conv.title);
    setOpenMenuId(null);
  };

  const confirmRename = () => {
    if (renameId && renameVal.trim()) renameConversation(renameId, renameVal.trim());
    setRenameId(null);
  };

  const handleLogout = () => {
    logout();
    router.replace("/auth");
  };

  const handleDeleteAccount = async () => {
    await fetch("/api/account/delete", { method: "DELETE" });
    logout();
    router.replace("/auth");
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-white border-r border-blue-100 shadow-2xl transition-transform duration-300 w-80 md:w-96 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 pt-6 pb-4 border-b border-blue-100">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-0.5">Olá,</p>
          <p className="font-bold text-xl text-blue-800 leading-tight truncate">{user?.name}</p>
          {isPro && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mt-1">
              ⭐ VIP
            </span>
          )}
        </div>

        <div className="px-4 pt-4 pb-2">
          <button onClick={handleNew} className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors shadow-sm">
            <span className="text-lg leading-none">+</span>
            Nova conversa
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
          {conversations.length === 0 && (
            <p className="text-slate-400 text-xs text-center py-6 px-4">Nenhuma conversa ainda. Comece uma nova!</p>
          )}
          {conversations.map(conv => (
            <div key={conv.id} className="relative group">
              {renameId === conv.id ? (
                <div className="flex gap-1 px-1">
                  <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") confirmRename(); if (e.key === "Escape") setRenameId(null); }} className="flex-1 bg-slate-100 text-slate-800 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-300" />
                  <button onClick={confirmRename} className="text-green-600 text-xs px-2 hover:text-green-700">✓</button>
                </div>
              ) : (
                <div onClick={() => handleSelect(conv.id)} className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors group ${activeId === conv.id ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-100"}`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {conv.isFavorite && <span className="text-yellow-500 text-xs flex-shrink-0">★</span>}
                    <span className={`text-sm truncate ${activeId === conv.id ? "text-blue-800 font-medium" : "text-slate-600"}`}>{conv.title}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === conv.id ? null : conv.id); }} className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100 text-base leading-none">›</button>
                </div>
              )}

              {openMenuId === conv.id && (
                <div className="absolute right-1 top-8 z-10 bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-40" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { toggleFavorite(conv.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"><span className="text-yellow-500">★</span>{conv.isFavorite ? "Desfavoritar" : "Favoritar"}</button>
                  <button onClick={() => startRename(conv)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"><span>✏️</span> Renomear</button>
                  <button onClick={() => { setDeleteConfirmId(conv.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"><span>🗑</span> Excluir</button>
                </div>
              )}

              {deleteConfirmId === conv.id && (
                <div className="absolute left-1 right-1 top-0 z-10 bg-white border border-red-200 rounded-xl shadow-xl p-4">
                  <p className="text-sm text-slate-700 mb-3 leading-snug">Tem certeza que deseja excluir essa conversa?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-1.5 rounded-lg text-sm border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
                    <button onClick={() => { deleteConversation(conv.id); setDeleteConfirmId(null); }} className="flex-1 py-1.5 rounded-lg text-sm bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">Excluir</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-blue-100 px-4 py-4 flex flex-col gap-1">
          <button onClick={() => setSubOpen(true)} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-yellow-600 hover:bg-yellow-50 transition-colors flex items-center gap-2">
            <span>✦</span> Assinatura VIP
          </button>
          <button onClick={() => setUsageOpen(true)} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2">
            <span>📊</span> Uso
          </button>
          <button onClick={() => setMemoriaOpen(true)} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-2">
            <span>🧠</span> Memória do Teo
            {userMemory && <span className="ml-auto w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />}
          </button>
          <Link href="/aprender" onClick={onClose} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-cyan-600 hover:bg-cyan-50 transition-colors flex items-center gap-2">
            <span>📚</span> Aprenda com o Teo
          </Link>
          <Link href="/parceiros" onClick={onClose} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 shadow-sm">
            <span>🤝</span> Parceiros do Teo
          </Link>
          <div className="h-px bg-slate-100 my-1" />
          <p className="text-xs text-slate-400 px-3 truncate">{user?.email}</p>
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">Sair</button>
          <button onClick={() => setExcluirOpen(true)} className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">Excluir minha conta</button>
        </div>
      </aside>

      <SubscriptionModal open={subOpen} onClose={() => setSubOpen(false)} />
      <UsageModal open={usageOpen} onClose={() => setUsageOpen(false)} />
      <ExcluirContaModal
        open={excluirOpen}
        onClose={() => setExcluirOpen(false)}
        onConfirm={handleDeleteAccount}
      />
      <MemoriaModal
        open={memoriaOpen}
        onClose={() => setMemoriaOpen(false)}
        initialMemory={userMemory}
        onSave={saveMemory}
      />
    </>
  );
}