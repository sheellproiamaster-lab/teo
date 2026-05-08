export default function Termos() {
  return (
    <div className="min-h-screen bg-white px-6 py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Teo</span>
        <h1 className="text-3xl font-black text-blue-900 mt-2 mb-1">Termos de Uso</h1>
        <p className="text-slate-400 text-sm">Última atualização: maio de 2026</p>
      </div>

      <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed flex flex-col gap-6">

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">1. Sobre o Teo</h2>
          <p>O Teo é uma plataforma de inteligência artificial desenvolvida para apoiar famílias de pessoas com Transtorno do Espectro Autista (TEA). O serviço é operado por Michel Macedo Holding — Michel José de Souza Macedo, CNPJ 54.760.141/0001-31.</p>
          <p className="mt-2">O Teo não substitui profissionais de saúde, psicólogos, terapeutas ou qualquer outro especialista. As informações fornecidas têm caráter informativo e de suporte emocional.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">2. Aceitação dos Termos</h2>
          <p>Ao acessar ou utilizar o Teo, você concorda com estes Termos de Uso. Caso não concorde, não utilize a plataforma.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">3. Planos e Pagamento</h2>
          <p>O Teo oferece um plano gratuito com limite de mensagens e um plano VIP por R$ 47,00 mensais, com acesso ilimitado a todas as funcionalidades.</p>
          <p className="mt-2">O pagamento é processado de forma segura. A cobrança é recorrente mensal e ocorre automaticamente na data de renovação.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">4. Cancelamento e Reembolso</h2>
          <p>Você pode cancelar sua assinatura a qualquer momento diretamente na plataforma. Após o cancelamento, o acesso VIP permanece ativo até o fim do período já pago.</p>
          <p className="mt-2">Solicitações de reembolso devem ser feitas em até 7 dias corridos após a contratação, conforme o Código de Defesa do Consumidor (art. 49), pelos canais de suporte:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>E-mail: <a href="mailto:sheellproiamaster@gmail.com" className="text-blue-600 hover:underline">sheellproiamaster@gmail.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/5561993090708" className="text-blue-600 hover:underline">(61) 9 9309-0708</a></li>
          </ul>
          <p className="mt-2">Após análise, o reembolso será processado diretamente. Após 7 dias da contratação, não há reembolso, mas o acesso continua ativo até o fim do período pago.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">5. Uso Responsável</h2>
          <p>O usuário compromete-se a utilizar o Teo de forma ética e responsável, não utilizando a plataforma para fins ilegais, ofensivos ou prejudiciais a terceiros.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">6. Limitação de Responsabilidade</h2>
          <p>O Teo é fornecido "como está". Michel Macedo Holding não se responsabiliza por decisões tomadas com base nas informações fornecidas pela plataforma, nem por danos indiretos decorrentes do uso ou incapacidade de uso do serviço.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">7. Alterações nos Termos</h2>
          <p>Estes termos podem ser atualizados a qualquer momento. Notificaremos os usuários sobre mudanças significativas. O uso contínuo da plataforma após as alterações implica aceitação dos novos termos.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">8. Contato</h2>
          <p>Para dúvidas, sugestões ou suporte:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>E-mail: <a href="mailto:sheellproiamaster@gmail.com" className="text-blue-600 hover:underline">sheellproiamaster@gmail.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/5561993090708" className="text-blue-600 hover:underline">(61) 9 9309-0708</a></li>
          </ul>
        </section>

      </div>

      <div className="mt-12 pt-6 border-t border-slate-100 text-xs text-slate-400 text-center">
        © 2026 Michel Macedo Holding — Michel José de Souza Macedo · CNPJ 54.760.141/0001-31
      </div>
    </div>
  );
}