import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home } from "lucide-react";
import type { ReactNode } from "react";
import { settingsQuery } from "@/lib/store-data";

export const Route = createFileRoute("/termos-de-uso")({
  head: () => ({
    meta: [
      { title: "Termos de uso | Drogaria Franco" },
      {
        name: "description",
        content:
          "Termos e condições de uso do site da Drogaria Franco: cadastro, pedidos, preços, pagamento, entrega, trocas e devoluções.",
      },
      { property: "og:title", content: "Termos de uso | Drogaria Franco" },
      {
        property: "og:description",
        content: "Regras de uso do site e de compra na Drogaria Franco.",
      },
    ],
  }),
  component: Terms,
});

const UPDATED = "17 de novembro de 2026";

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-extrabold text-secondary">
        {n}. {title}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

function Terms() {
  const { data: s } = useQuery(settingsQuery);
  const legalName = s?.legal_name ?? "G. M. Franco Drogaria";
  const cnpj = s?.cnpj ?? "04.574.777/0001-10";
  const address = s?.address ?? "Avenida Brasil, 5 - Centro, Feira Nova do Maranhão - MA, 65.995-000";
  return (
    <article className="mx-auto max-w-3xl px-4 pb-8 pt-6 md:pt-8">
      <nav aria-label="Você está em" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" aria-label="Página inicial" className="text-primary-strong hover:text-primary">
          <Home className="h-4 w-4" />
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-secondary">
          Termos de uso
        </span>
      </nav>
      <h1 className="mt-4 text-4xl font-extrabold text-secondary md:text-5xl">Termos de uso</h1>
      <span aria-hidden="true" className="mt-3 block h-1 w-16 rounded-full bg-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Última atualização: {UPDATED}</p>

      <div className="mt-6 space-y-3 leading-relaxed">
        <p>
          Estes Termos de uso regulam o acesso e as compras realizadas no site da{" "}
          <strong className="font-bold">Drogaria Franco</strong>, mantido por {legalName}, inscrita no
          CNPJ sob o nº {cnpj}, com sede em {address}.
        </p>
        <p>
          Ao navegar no site, criar uma conta ou fazer um pedido, você declara que leu e concorda com
          estes Termos. Se não concordar, pedimos que não utilize o site.
        </p>
      </div>

      <Section n={1} title="Cadastro e conta">
        <p>
          Para comprar é necessário criar uma conta com dados verdadeiros, completos e atualizados. O
          cadastro é permitido a pessoas maiores de 18 anos e com capacidade civil.
        </p>
        <p>
          A senha é pessoal e intransferível. Você é responsável por mantê-la em sigilo e por todas as
          atividades realizadas na sua conta. Em caso de uso indevido, avise-nos imediatamente pelos
          canais de atendimento.
        </p>
        <p>
          Podemos suspender ou cancelar cadastros com informações falsas, indícios de fraude ou uso
          em desacordo com estes Termos.
        </p>
      </Section>

      <Section n={2} title="Produtos e informações">
        <p>
          Comercializamos produtos de beleza, cosméticos, dermocosméticos, higiene e cuidados
          pessoais, de marcas regularizadas junto aos órgãos competentes.
        </p>
        <p>
          As imagens são meramente ilustrativas e podem apresentar pequenas variações de cor,
          embalagem ou apresentação em relação ao produto entregue. Descrições, composição e modo de
          uso são fornecidos pelos fabricantes.
        </p>
        <p>
          As informações do site têm caráter informativo e não substituem a orientação de médico,
          dermatologista ou farmacêutico. Leia sempre o rótulo antes de usar e, em caso de irritação
          ou reação alérgica, suspenda o uso e procure um profissional de saúde.
        </p>
      </Section>

      <Section n={3} title="Medicamentos">
        <p>
          Quando houver venda de medicamentos pelo site, ela seguirá as normas sanitárias aplicáveis.
          Medicamentos sujeitos a prescrição só são dispensados mediante apresentação e conferência
          da receita válida, e medicamentos sujeitos a controle especial não são vendidos pela
          internet.
        </p>
        <p>
          Não se automedique. Em caso de dúvida sobre o uso de qualquer produto, consulte um
          profissional de saúde.
        </p>
      </Section>

      <Section n={4} title="Preços, ofertas e disponibilidade">
        <p>
          Os preços e condições exibidos valem exclusivamente para compras feitas no site e podem ser
          diferentes dos praticados na loja física. Promoções valem pelo período anunciado ou
          enquanto durarem os estoques.
        </p>
        <p>
          Todos os pedidos estão sujeitos à confirmação de estoque. Se um item ficar indisponível
          depois da compra, entraremos em contato para oferecer a substituição, a espera pela
          reposição ou o reembolso integral do valor pago.
        </p>
        <p>
          Em caso de erro evidente de preço ou de descrição, o pedido poderá ser cancelado, com a
          devolução integral dos valores pagos.
        </p>
      </Section>

      <Section n={5} title="Pedidos e pagamento">
        <p>
          O pedido só é considerado confirmado após a aprovação do pagamento. As formas de pagamento
          disponíveis são informadas no fechamento da compra.
        </p>
        <p>
          Os pagamentos são processados por empresas intermediadoras especializadas. A Drogaria
          Franco não armazena os dados completos do seu cartão.
        </p>
        <p>
          Pedidos podem passar por análise de segurança e ser cancelados se houver divergência de
          dados ou suspeita de fraude, com estorno do valor eventualmente pago.
        </p>
      </Section>

      <Section n={6} title="Entrega e retirada">
        <p>
          Os prazos e valores de frete são informados antes da conclusão do pedido e passam a contar
          a partir da confirmação do pagamento. Quando disponível, você também pode optar por retirar
          o pedido na loja.
        </p>
        <p>
          É sua responsabilidade informar o endereço correto e garantir que haja alguém para receber
          a entrega. Confira o pedido no recebimento e recuse a entrega se a embalagem estiver
          violada ou avariada, avisando-nos em seguida.
        </p>
      </Section>

      <Section n={7} title="Arrependimento, trocas e devoluções">
        <p>
          Nas compras feitas pelo site, você pode desistir da compra em até 7 (sete) dias corridos a
          contar do recebimento do produto, conforme o art. 49 do Código de Defesa do Consumidor. O
          produto deve ser devolvido sem sinais de uso, com o lacre intacto e na embalagem original,
          e o valor pago, incluindo o frete, será restituído.
        </p>
        <p>
          Produtos com defeito ou vício têm a garantia legal prevista no Código de Defesa do
          Consumidor. Se o produto chegar avariado, vencido ou diferente do que foi pedido, entre em
          contato para providenciarmos a troca ou o reembolso, sem custo para você.
        </p>
        <p>
          Por questões sanitárias, produtos de uso pessoal que tenham sido abertos ou utilizados não
          são aceitos para troca por simples arrependimento ou preferência, ressalvados os casos de
          defeito.
        </p>
      </Section>

      <Section n={8} title="Uso do site">
        <p>Ao utilizar o site, você se compromete a não:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>fornecer dados falsos ou usar dados de terceiros sem autorização;</li>
          <li>comprar produtos para revenda sem a nossa autorização prévia;</li>
          <li>tentar acessar áreas restritas, burlar mecanismos de segurança ou prejudicar o funcionamento do site;</li>
          <li>utilizar robôs ou outros meios automatizados para coletar dados do site.</li>
        </ul>
        <p>
          Podemos limitar a quantidade de unidades por pedido ou por cliente para garantir o
          atendimento ao consumidor final.
        </p>
      </Section>

      <Section n={9} title="Propriedade intelectual">
        <p>
          A marca Drogaria Franco, o layout, os textos e os demais conteúdos do site pertencem à
          Drogaria Franco ou aos seus licenciantes. As marcas e imagens dos produtos pertencem aos
          respectivos fabricantes. É proibida a reprodução sem autorização.
        </p>
      </Section>

      <Section n={10} title="Privacidade e proteção de dados">
        <p>
          Tratamos os seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (Lei nº
          13.709/2018), para as finalidades de cadastro, processamento dos pedidos, entrega,
          atendimento e cumprimento de obrigações legais. Você pode solicitar o acesso, a correção ou
          a exclusão dos seus dados pelos nossos canais de atendimento.
        </p>
      </Section>

      <Section n={11} title="Disponibilidade do site">
        <p>
          Trabalhamos para manter o site disponível e seguro, mas ele pode ficar temporariamente fora
          do ar para manutenção ou por motivos alheios ao nosso controle. Nessas situações, os
          direitos relativos a pedidos já confirmados ficam preservados.
        </p>
      </Section>

      <Section n={12} title="Alterações destes Termos">
        <p>
          Estes Termos podem ser atualizados a qualquer momento. A versão vigente é sempre a
          publicada nesta página, e as compras são regidas pela versão em vigor na data do pedido.
        </p>
      </Section>

      <Section n={13} title="Atendimento, legislação e foro">
        <p>
          Dúvidas, solicitações e reclamações podem ser enviadas pelos canais de atendimento
          informados no rodapé do site ou feitas diretamente na loja, em {address}.
        </p>
        <p>
          Estes Termos são regidos pelas leis brasileiras, em especial o Código de Defesa do
          Consumidor (Lei nº 8.078/1990), o Decreto nº 7.962/2013 e o Marco Civil da Internet (Lei nº
          12.965/2014). Fica eleito o foro do domicílio do consumidor para resolver qualquer
          controvérsia.
        </p>
      </Section>
    </article>
  );
}
