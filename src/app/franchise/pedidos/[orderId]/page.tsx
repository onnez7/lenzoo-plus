import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Status } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, Banknote, Printer, FlaskConical } from "lucide-react"; // Importar ícone de impressora
import AddPaymentForm from "./_components/add-payment-form"; // Novo formulário
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SendToLab } from "./_components/send-to-lab";

const statusMap: Record<Status, { label: string; className: string }> = {
    // ... (seu statusMap existente)
    IN_PRODUCTION: { label: 'Em Produção', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
    DRAFT: { label: 'Rascunho', className: 'bg-gray-200 text-gray-800 hover:bg-gray-200' },
    PENDING: { label: 'Aguardando Pgto.', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    COMPLETED: { label: 'Finalizado', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    SHIPPED: { label: 'Enviado', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
    CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    ACTIVE: { label: 'Ativo', className: '' }, INACTIVE: { label: 'Inativo', className: '' },
};

export default async function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const orderId = parseInt(params.orderId, 10);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true, items: true, user: true, payments: true, lab: true }, // Incluímos os pagamentos
  });

  if (!order) notFound();
  
  const statusInfo = statusMap[order.status] || { label: order.status, className: '' };
  const totalPaid = order.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const balanceDue = Number(order.totalAmount) - totalPaid;
  const labs = await prisma.lab.findMany({ where: { isActive: true } });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detalhes da OS #{order.id}</h1>
            <p className="text-muted-foreground">
              Criado em {new Date(order.createdAt).toLocaleDateString('pt-BR')} por {order.user?.name || 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-4">
              <Badge className={`text-sm px-4 py-2 ${statusInfo.className}`}>{statusInfo.label}</Badge>
              {/* --- NOVO BOTÃO DE IMPRIMIR --- */}
              <Button asChild variant="outline">
                  {/* O 'target="_blank"' abre a página de impressão numa nova aba */}
                  <a href={`/franchise/pedidos/${order.id}/print`} target="_blank" rel="noopener noreferrer">
                      <Printer className="h-4 w-4 mr-2"/>
                      Imprimir
                  </a>
              </Button>
              <Button asChild>
                  <Link href={`/franchise/pedidos/${order.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2"/>
                      Alterar OS
                  </Link>
              </Button>
          </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Itens do Pedido</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {order.items.map(item => (
                            <li key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.quantity} x {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(item.unitPrice))}
                                    </p>
                                </div>
                                <p className="font-semibold">
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(item.unitPrice) * item.quantity)}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <Separator className="my-6" />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(order.totalAmount))}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Histórico de Pagamentos</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.payments.length > 0 ? (
                                order.payments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{new Date(payment.createdAt).toLocaleString('pt-BR')}</TableCell>
                                        <TableCell><Badge variant="outline">{payment.method}</Badge></TableCell>
                                        <TableCell className="text-right font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(payment.amount))}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum pagamento registado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-end bg-muted/50 p-4 font-semibold">
                    <div className="flex flex-col items-end gap-2">
                        <span>Total Pago: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPaid)}</span>
                        <span className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                            Saldo Devedor: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(balanceDue)}
                        </span>
                    </div>
                </CardFooter>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                 <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p className="font-semibold">{order.client.name}</p>
                    <p className="text-muted-foreground">{order.client.email}</p>
                    <p className="text-muted-foreground">{order.client.phone}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FlaskConical className="h-5 w-5"/> Laboratório</CardTitle>
                </CardHeader>
                <CardContent>
                    {order.lab ? (
                        <div className="space-y-1">
                            <p className="font-semibold">{order.lab.name}</p>
                            <p className="text-sm text-muted-foreground">OS enviada e em produção.</p>
                        </div>
                    ) : (
                        <SendToLab orderId={order.id} labs={labs} />
                    )}
                </CardContent>
            </Card>
            
            {balanceDue > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5"/> Registar Novo Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddPaymentForm orderId={order.id} maxValue={balanceDue} />
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}