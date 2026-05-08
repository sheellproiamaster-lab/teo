export default function Privacidade() {
  return (
    <div className="min-h-screen bg-white px-6 py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Teo</span>
        <h1 className="text-3xl font-black text-blue-900 mt-2 mb-1">Política de Privacidade</h1>
        <p className="text-slate-400 text-sm">Última atualização: maio de 2026</p>
      </div>

      <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed flex flex-col gap-6">

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">1. Quem somos</h2>
          <p>O Teo é operado por Michel Macedo Holding — Michel José de Souza Macedo, CNPJ 54.760.141/0001-31. Esta política descreve como coletamos, usamos e protegemos seus dados pessoais.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">2. Dados que coletamos</h2>
          <ul className="list-disc list-inside flex flex-col gap-1">
            <li>Nome e e-mail fornecidos via login com Google</li>
            <li>Foto de perfil (quando disponibilizada pelo Google)</li>
            <li>Histórico de conversas com o Teo</li>
            <li>Dados de pagamento (processados pelo Stripe — não armazenamos dados de cartão)</li>
            <li>Dados de uso da plataforma</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">3. Como usamos seus dados</h2>
          <ul className="list-disc list-inside flex flex-col gap-1">
            <li>Fornecer e melhorar os serviços do Teo</li>
            <li>Personalizar sua experiência na plataforma</li>
            <li>Processar pagamentos e gerenciar assinaturas</li>
            <li>Enviar comunicações relacionadas ao serviço</li>
            <li>Cumprir obrigações legais</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">4. Compartilhamento de dados</h2>
          <p>Não vendemos seus dados pessoais. Compartilhamos apenas com:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li><strong>Supabase:</strong> armazenamento seguro de dados</li>
            <li><strong>Stripe:</strong> processamento de pagamentos</li>
            <li><strong>Google:</strong> autenticação via OAuth</li>
          </ul>
          <p className="mt-2">Todos os parceiros seguem rigorosos padrões de segurança e privacidade.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">5. Segurança</h2>
          <p>Seus dados são protegidos com criptografia e armazenados em servidores seguros. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">6. Seus direitos (LGPD)</h2>
          <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou incorretos</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
          <p className="mt-2">Para exercer seus direitos, entre em contato pelos canais de suporte abaixo.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">7. Cookies</h2>
          <p>Utilizamos cookies essenciais para o funcionamento da plataforma, como manutenção de sessão de login. Não utilizamos cookies para rastreamento publicitário.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800 mb-2">8. Contato</h2>
          <p>Para dúvidas sobre privacidade ou exercício de direitos:</p>
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