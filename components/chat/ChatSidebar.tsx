"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat, type Conversation } from "@/context/ChatContext";
import SubscriptionModal from "./SubscriptionModal";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ open, onClose }: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { conversations, activeId, setActiveId, newConversation, deleteConversation, renameConversation, toggleFavorite } = useChat();
  const [subOpen, setSubOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const handleSelect = (id: string) => {
    setActiveId(id);
    onClose();
  };

  const handleNew = () => {
    newConversation();
    onClose();
  };

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

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full z-40 md:z-auto flex flex-col bg-blue-950 text-white transition-transform duration-300 w-72
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-white/10">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Olá,</p>
          <p className="font-bold text-lg leading-tight truncate">{user?.name}</p>
        </div>

        {/* New conversation */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={handleNew}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Nova conversa
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
          {conversations.length === 0 && (
            <p className="text-blue-400 text-xs text-center py-6 px-4">Nenhuma conversa ainda. Comece uma nova!</p>
          )}
          {conversations.map(conv => (
            <div key={conv.id} className="relative group">
              {renameId === conv.id ? (
                <div className="flex gap-1 px-1">
                  <input
                    autoFocus
                    value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") confirmRename(); if (e.key === "Escape") setRenameId(null); }}
                    className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20"
                  />
                  <button onClick={confirmRename} className="text-green-400 text-xs px-2 hover:text-green-300">✓</button>
                </div>
              ) : (
                <div
                  onClick={() => handleSelect(conv.id)}
                  className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors group
                    ${activeId === conv.id ? "bg-white/15" : "hover:bg-white/8"}`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {conv.isFavorite && <span className="text-yellow-400 text-xs flex-shrink-0">★</span>}
                    <span className="text-sm truncate text-white/90">{conv.title}</span>
                  </div>

                  {/* Dropdown trigger */}
                  <button
                    onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === conv.id ? null : conv.id); }}
                    className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors opacity-0 group-hover:opacity-100 text-base leading-none"
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Dropdown menu */}
              {openMenuId === conv.id && (
                <div
                  className="absolute right-1 top-8 z-10 bg-blue-900 border border-white/15 rounded-xl shadow-xl py-1 w-40"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => { toggleFavorite(conv.id); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <span className="text-yellow-400">★</span>
                    {conv.isFavorite ? "Desfavoritar" : "Favoritar"}
                  </button>
                  <button
                    onClick={() => startRename(conv)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <span>✏️</span> Renomear
                  </button>
                  <button
                    onClick={() => { setDeleteConfirmId(conv.id); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <span>🗑</span> Excluir
                  </button>
                </div>
              )}

              {/* Delete confirmation */}
              {deleteConfirmId === conv.id && (
                <div className="absolute left-1 right-1 top-0 z-10 bg-blue-900 border border-red-500/30 rounded-xl shadow-xl p-4">
                  <p className="text-sm text-white/90 mb-3 leading-snug">Tem certeza que deseja excluir essa conversa?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-1.5 rounded-lg text-sm border border-white/20 hover:bg-white/10 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => { deleteConversation(conv.id); setDeleteConfirmId(null); }}
                      className="flex-1 py-1.5 rounded-lg text-sm bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 px-4 py-4 flex flex-col gap-1">
          <button
            onClick={() => setSubOpen(true)}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-yellow-300 hover:bg-white/8 transition-colors flex items-center gap-2"
          >
            <span>✦</span> Assinatura VIP
          </button>
          <div className="h-px bg-white/10 my-1" />
          <p className="text-xs text-blue-400 px-3 truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/8 transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      <SubscriptionModal open={subOpen} onClose={() => setSubOpen(false)} />
    </>
  );
}
