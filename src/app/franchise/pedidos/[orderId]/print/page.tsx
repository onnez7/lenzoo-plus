import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import PrintLayout from "./_components/print-layout"; // Importamos o nosso novo componente

export default async function PrintOrderPage({ params }: { params: { orderId: string } }) {
  const session = await getServerSession(authOptions);
  const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
  if (!franchiseId) redirect("/login");

  const orderId = parseInt(params.orderId, 10);
  const order = await prisma.order.findUnique({
    where: { id: orderId, franchiseId: franchiseId },
    include: {
      client: true,
      items: true,
      user: true,
      payments: true,
      franchise: true,
    },
  });

  if (!order) notFound();

  const totalPaid = order.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const balanceDue = Number(order.totalAmount) - totalPaid;

  return (
    <PrintLayout>
      {/* Todo o conteúdo visual da impressão fica aqui dentro */}
      <style>
        {`
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
          @page { size: A4; margin: 20mm; }
        `}
      </style>
      <div className="max-w-4xl mx-auto bg-white p-8 font-sans">
        <header className="flex justify-between items-start mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">{order.franchise?.name || 'Sua Ótica'}</h1>
            {/* Adicionar endereço e contacto da franquia aqui no futuro */}
            <p className="text-sm text-gray-500">{order.franchise?.email}</p>
            <p className="text-sm text-gray-500">{order.franchise?.phone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">Ordem de Serviço #{order.id}</h2>
            <p className="text-sm text-gray-500">Data: {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </header>

        <section className="mb-8">
          <h3 className="font-semibold mb-2">Cliente:</h3>
          <p>{order.client.name}</p>
          <p className="text-gray-600">{order.client.email}</p>
          <p className="text-gray-600">{order.client.phone}</p>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Itens do Pedido:</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Descrição</th>
                <th className="p-2 text-center">Qtd.</th>
                <th className="p-2 text-right">Preço Unit.</th>
                <th className="p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.description}</td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(item.unitPrice))}</td>
                  <td className="p-2 text-right">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.quantity * Number(item.unitPrice))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8 flex justify-end">
          <div className="w-1/2 space-y-2">
            <div className="flex justify-between">
              <span>Total Pago:</span>
              <span className="font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPaid)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>TOTAL A PAGAR:</span>
              <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(balanceDue)}</span>
            </div>
          </div>
        </section>

        {order.notes && (
          <section className="mt-8 border-t pt-4">
             <h3 className="font-semibold mb-2">Observações:</h3>
             <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.notes}</p>
          </section>
        )}

        <footer className="mt-16 text-center text-xs text-gray-400">
            <p>Obrigado pela sua preferência!</p>
        </footer>
      </div>
    </PrintLayout>
  );
}