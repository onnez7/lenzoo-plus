'use client'

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WhatsAppProvider } from "@prisma/client";
import { useTransition, useState } from "react";
import { saveIntegrationSettings, testWhatsAppIntegration, testEmailIntegration } from "../actions";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Send, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";


const formSchema = z.object({
    whatsAppProvider: z.nativeEnum(WhatsAppProvider).optional(),
    whatsAppApiToken: z.string().optional(),     // Twilio: Auth Token | Z-API: Token
    whatsAppInstanceId: z.string().optional(), // Z-API: ID da Instância
    whatsAppApiSecret: z.string().optional(),  // Twilio: Account SID | Z-API: Client Token
    whatsAppFromNumber: z.string().optional(), // Twilio: Número de envio

    emailApiKey: z.string().optional(),
    emailFromAddress: z.string().optional(),
});

interface IntegrationFormProps {
    initialData: z.infer<typeof formSchema> | null;
}

export function IntegrationForm({ initialData }: IntegrationFormProps) {
    const [isSaving, startSaveTransition] = useTransition();
    const [isTesting, startTestTransition] = useTransition();
    const [isTestingEmail, startEmailTest] = useTransition();
    const router = useRouter();
    const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [testPhoneNumber, setTestPhoneNumber] = useState('');
    const [emailTestResult, setEmailTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            whatsAppProvider: initialData?.whatsAppProvider || undefined,
            whatsAppApiToken: initialData?.whatsAppApiToken || "",
            whatsAppInstanceId: initialData?.whatsAppInstanceId || "",
            whatsAppApiSecret: initialData?.whatsAppApiSecret || "",
            whatsAppFromNumber: initialData?.whatsAppFromNumber || "+14155238886",
            emailApiKey: initialData?.emailApiKey || "",
            emailFromAddress: initialData?.emailFromAddress || "",
        },
    });
    
    const provider = form.watch("whatsAppProvider");

    function onSaveSubmit(values: z.infer<typeof formSchema>) {
        startSaveTransition(async () => {
            const result = await saveIntegrationSettings(values);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error);
            }
        });
    }


    function onTestSubmit() {
        if (!testPhoneNumber) {
            setTestResult({ type: 'error', message: 'Por favor, insira um número de telemóvel para o teste.' });
            return;
        }
        startTestTransition(async () => {
            setTestResult(null);
            const result = await testWhatsAppIntegration(testPhoneNumber);
            setTestResult({
                type: result.success ? 'success' : 'error',
                message: result.message,
            });
        });
    }

    function onTestEmailSubmit() {
        startEmailTest(async () => {
            setEmailTestResult(null);
            const result = await testEmailIntegration();
            setEmailTestResult({ type: result.success ? 'success' : 'error', message: result.message });
        });
    }

    return (
          <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-6">
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>WhatsApp API</CardTitle>
                    <CardDescription>Configure o provedor e insira as suas credenciais.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSaveSubmit)} className="space-y-6">
                            <FormField control={form.control} name="whatsAppProvider" render={({ field }) => (
                                <FormItem><FormLabel>Provedor</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Nenhum (desativado)" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value={WhatsAppProvider.TWILIO}>Twilio</SelectItem>
                                            <SelectItem value={WhatsAppProvider.ZAPI}>Z-API</SelectItem>
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )}/>

                        {/* Campos da Z-API */}
                            {provider === "ZAPI" && (
                                <>
                                    <FormField control={form.control} name="whatsAppInstanceId" render={({ field }) => (
                                        <FormItem><FormLabel>ID da Instância (Z-API)</FormLabel><FormControl><Input placeholder="O seu ID da Instância" {...field} value={field.value || ''} /></FormControl></FormItem>
                                    )}/>
                                     <FormField control={form.control} name="whatsAppApiToken" render={({ field }) => (
                                        <FormItem><FormLabel>Token da Instância (Z-API)</FormLabel><FormControl><Input type="password" placeholder="O seu Token da Instância" {...field} value={field.value || ''}/></FormControl></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="whatsAppApiSecret" render={({ field }) => (
                                        <FormItem><FormLabel>Client Token (Z-API)</FormLabel><FormControl><Input type="password" placeholder="O seu Client Token" {...field} value={field.value || ''}/></FormControl></FormItem>
                                    )}/>
                                </>
                            )}

                        {provider === "TWILIO" && (
                                <>
                                    <FormField control={form.control} name="whatsAppApiSecret" render={({ field }) => (
                                        <FormItem><FormLabel>Account SID (Twilio)</FormLabel><FormControl><Input placeholder="AC..." {...field} /></FormControl></FormItem>
                                    )}/>
                                     <FormField control={form.control} name="whatsAppApiToken" render={({ field }) => (
                                        <FormItem><FormLabel>Auth Token (Twilio)</FormLabel><FormControl><Input type="password" {...field} /></FormControl></FormItem>
                                    )}/>
                                    {/* NOVO CAMPO */}
                                     <FormField control={form.control} name="whatsAppFromNumber" render={({ field }) => (
                                        <FormItem><FormLabel>Número da Twilio (Sandbox)</FormLabel><FormControl><Input placeholder="whatsapp:+1415..." {...field} /></FormControl></FormItem>
                                    )}/>
                                </>
                            )}
                        
                        <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isSaving}>{isSaving ? "A guardar..." : "Guardar"}</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

                       <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Testar Integração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="test-phone">Número de WhatsApp (com DDD)</Label>
                        <Input id="test-phone" value={testPhoneNumber} onChange={(e) => setTestPhoneNumber(e.target.value)} />
                    </div>
                     {testResult && (
                        <Alert variant={testResult.type === 'error' ? 'destructive' : 'default'}>
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>{testResult.type === 'success' ? 'Sucesso!' : 'Erro'}</AlertTitle>
                            <AlertDescription>{testResult.message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                     <Button onClick={onTestSubmit} disabled={isTesting || !provider}>
                        <Send className="h-4 w-4 mr-2"/>
                        {isTesting ? "A enviar..." : "Enviar Teste"}
                    </Button>
                </CardFooter>
            </Card>
          </div>
          
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Email Transacional</CardTitle>
                        <CardDescription>Configure o envio de emails via Resend.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSaveSubmit)} className="space-y-6">
                                <FormField control={form.control} name="emailApiKey" render={({ field }) => (
                                    <FormItem><FormLabel>Chave de API (Resend)</FormLabel><FormControl><Input type="password" placeholder="re_..." {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="emailFromAddress" render={({ field }) => (
                                    <FormItem><FormLabel>Email de Envio</FormLabel><FormControl><Input placeholder="contato@suaotica.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "A guardar..." : "Guardar Configurações"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Testar Integração de Email</CardTitle></CardHeader>
                    <CardContent>
                        {emailTestResult && (
                            <Alert variant={emailTestResult.type === 'error' ? 'destructive' : 'default'}>
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>{emailTestResult.type === 'success' ? 'Sucesso!' : 'Erro'}</AlertTitle>
                                <AlertDescription>{emailTestResult.message}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter>
                         <Button onClick={onTestEmailSubmit} disabled={isTestingEmail}>
                            <Mail className="h-4 w-4 mr-2"/>
                            {isTestingEmail ? "A enviar..." : "Enviar Email de Teste"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}