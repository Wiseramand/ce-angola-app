
import React from 'react';
import { Shield } from 'lucide-react';

const TermsOfService: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-20">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[3rem] shadow-2xl p-12 md:p-20 overflow-hidden relative border border-gray-100">
                    <div className="absolute top-0 left-0 w-full h-2 bg-ministry-gold"></div>

                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-14 h-14 bg-blue-50 text-ministry-blue rounded-2xl flex items-center justify-center">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-display font-black text-ministry-blue uppercase tracking-tighter">Termos de Serviço</h1>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Christ Embassy Angola • Última atualização: Março 2025</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-8 text-gray-600 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">1. Aceitação dos Termos</h2>
                            <p>Ao aceder e utilizar a plataforma da Christ Embassy Angola, concorda em cumprir e estar vinculado aos seguintes Termos de Serviço. Se não concordar com qualquer parte destes termos, por favor, não utilize os nossos serviços online.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">2. Uso do Conteúdo</h2>
                            <p>Todo o conteúdo disponível nesta plataforma, incluindo transmissões ao vivo, vídeos, textos e gráficos, é propriedade da Christ Embassy Angola ou dos seus licenciadores e está protegido por leis de direitos de autor internacionais.</p>
                            <p>É estritamente proibida a reprodução, distribuição ou modificação do conteúdo sem autorização prévia por escrito.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">3. Conduta do Utilizador</h2>
                            <p>Os utilizadores comprometem-se a utilizar a plataforma apenas para fins lícitos e de uma forma que não infrinja os direitos de terceiros ou restrinja o uso e usufruto da plataforma por parte de outros utilizadores.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">4. Doações e Ofertas</h2>
                            <p>Todas as doações e ofertas feitas através da plataforma são voluntárias. A Christ Embassy Angola reserva-se o direito de utilizar os fundos para os seus fins ministeriais e projetos caritativos conforme julgar apropriado.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">5. Modificações dos Termos</h2>
                            <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a sua publicação na plataforma. O seu uso continuado da plataforma após tais alterações constitui a sua aceitação dos novos Termos de Serviço.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
