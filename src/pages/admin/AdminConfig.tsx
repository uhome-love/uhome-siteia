import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminConfig() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("site_config")
      .select("key,value")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data || []).forEach((row: any) => {
          map[row.key] = row.value || "";
        });
        setConfigs(map);
        setLoading(false);
      });
  }, []);

  function updateConfig(key: string, value: string) {
    setConfigs((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(configs)) {
        await supabase
          .from("site_config")
          .upsert({ key, value, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
      }
      toast.success("Configurações salvas");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar tudo
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>WhatsApp de contato</Label>
              <Input
                value={configs.whatsapp || ""}
                onChange={(e) => updateConfig("whatsapp", e.target.value)}
                placeholder="5551999999999"
              />
              <p className="mt-1 text-xs text-muted-foreground">Formato: 55 + DDD + número (sem espaços)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Textos da Home</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Headline principal</Label>
              <Input
                value={configs.headline || ""}
                onChange={(e) => updateConfig("headline", e.target.value)}
                placeholder="Encontre o imóvel perfeito para você"
              />
            </div>
            <div>
              <Label>Subheadline</Label>
              <Textarea
                value={configs.subheadline || ""}
                onChange={(e) => updateConfig("subheadline", e.target.value)}
                placeholder="Texto secundário da home"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
