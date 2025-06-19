'use client'

import { Button } from "@/components/ui/button";
import { useTransition, useState } from "react";
import { processDaysAfterPurchaseAutomations } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export function ProcessAutomationsClient() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean, message: string } | null>(null);

    const handleProcess = () => {
        startTransition(async () => {
            const res = await processDaysAfterPurchaseAutomations();
            if (res.success) {
                setResult({ success: true, message: res.message! });
            } else {
                setResult({ success: false, message: res.error! });
            }
        });
    };

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle>Gatilho Manual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Clique no botão abaixo para iniciar a verificação de todas as automações do tipo "dias após a compra".
                </p>
                <Button onClick={handleProcess} disabled={isPending}>
                    {isPending ? "A processar..." : "Processar Automações Agora"}
                </Button>
                {result && (
                    <Alert variant={result.success ? "default" : "destructive"}>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>{result.success ? "Sucesso!" : "Erro"}</AlertTitle>
                        <AlertDescription>{result.message}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}