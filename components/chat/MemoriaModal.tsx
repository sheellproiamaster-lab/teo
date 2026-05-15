"use client";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  initialMemory: string;
  onSave: (memory: string) => Promise<void>;
}

export default function MemoriaModal({ open, onClose, initialMemory, onSave }: Props) {
  const [text, setText] = useState(initialMemory);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setText(initialMemory);
      setSaved(false);
    }
  }, [open, initialMemory]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(text);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <h2 className="text-white font-black text-lg leading-tight">Memória do Teo</h2>
                <p className="text-white/70 text-xs">O Teo nunca vai esquecer o que você salvar aqui</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white text-3xl leading-none transition-colors w-8 h-8 flex items-center justify-center">×</button>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
            <p className="text-blue-800 text-sm leading-relaxed">
              Tudo que você escrever aqui o Teo vai guardar com carinho e lembrar em cada conversa, para sempre.
              Conta sobre sua criança — nome, idade, diagnóstico, terapias, dificuldades, conquistas, rotina, preocupações.
              Quanto mais você compartilhar, mais próximo e humano o Teo vai ser com você.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 px-1">Exemplos do que você pode adicionar:</p>
            <div className="flex flex-wrap gap-2">
              {["Nome e idade do filho", "Diagnóstico (TEA, TDAH...)", "Terapias que faz", "Dificuldades do dia a dia", "O que mais gosta", "Escola e turma", "Medicações", "Suas maiores preocupações"].map(hint => (
                <span key={hint} className="text-xs bg-slate-100 text-slate-600 rounded-full px-3 py-1 border border-slate-200">{hint}</span>
              ))}
            </div>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Ex: Meu filho se chama Pedro, tem 7 anos, foi diagnosticado com TEA nível 2 aos 4 anos. Tem hipersensibilidade a sons e dificuldade com transições de rotina. Adora dinossauros e música. Faz terapia ABA 3x por semana e fonoaudiologia 1x. Está no 2º ano e temos dificuldades com inclusão escolar. Minha maior preocupação é a socialização dele..."
            rows={7}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none leading-relaxed"
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold shadow transition-all disabled:opacity-60 ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
              }`}
            >
              {saving ? "Salvando..." : saved ? "✓ Memória salva!" : "Salvar memória"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
