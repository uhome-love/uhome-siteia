import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, GripVertical, Loader2, Save, X, Eye, ArrowUp, ArrowDown, Building2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface Empreendimento {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  localizacao: string | null;
  bairro: string | null;
  cidade: string | null;
  tipologias: any;
  preco_a_partir: number | null;
  preco_ate: number | null;
  diferenciais: string[] | null;
  imagem_principal: string | null;
  imagens: any;
  logo_url: string | null;
  previsao_entrega: string | null;
  construtora: string | null;
  ativo: boolean;
  destaque_home: boolean;
  ordem: number;
  meta_title: string | null;
  meta_description: string | null;
}

const emptyForm: Partial<Empreendimento> = {
  nome: "",
  slug: "",
  descricao: "",
  localizacao: "",
  bairro: "",
  cidade: "Porto Alegre",
  preco_a_partir: null,
  preco_ate: null,
  diferenciais: [],
  imagem_principal: "",
  logo_url: "",
  previsao_entrega: "",
  construtora: "",
  ativo: true,
  destaque_home: false,
  ordem: 0,
  meta_title: "",
  meta_description: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminEmpreendimentos() {
  const [items, setItems] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Empreendimento | null>(null);
  const [form, setForm] = useState<Partial<Empreendimento>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [diferenciaisText, setDiferenciaisText] = useState("");
  const [tipologiasText, setTipologiasText] = useState("");

  async function fetchAll() {
    const { data } = await supabase
      .from("empreendimentos")
      .select("*")
      .order("ordem", { ascending: true });
    if (data) setItems(data as unknown as Empreendimento[]);
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setDiferenciaisText("");
    setTipologiasText("");
    setDialogOpen(true);
  }

  function openEdit(item: Empreendimento) {
    setEditing(item);
    setForm(item);
    setDiferenciaisText((item.diferenciais || []).join("\n"));
    setTipologiasText(
      Array.isArray(item.tipologias)
        ? item.tipologias.map((t: any) => `${t.tipo || ""} - ${t.area || ""}m² - ${t.quartos || ""} quartos`).join("\n")
        : ""
    );
    setDialogOpen(true);
  }

  function updateField(key: string, value: any) {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "nome" && !editing) {
        updated.slug = slugify(value as string);
      }
      return updated;
    });
  }

  async function handleSave() {
    if (!form.nome || !form.slug) {
      toast({ title: "Preencha nome e slug", variant: "destructive" });
      return;
    }
    setSaving(true);

    const diferenciais = diferenciaisText.split("\n").map((s) => s.trim()).filter(Boolean);
    const tipologias = tipologiasText.split("\n").map((line) => {
      const parts = line.split("-").map((s) => s.trim());
      return { tipo: parts[0] || "", area: parts[1]?.replace("m²", "").trim() || "", quartos: parts[2]?.replace("quartos", "").trim() || "" };
    }).filter((t) => t.tipo);

    const payload = {
      nome: form.nome,
      slug: form.slug,
      descricao: form.descricao || null,
      localizacao: form.localizacao || null,
      bairro: form.bairro || null,
      cidade: form.cidade || "Porto Alegre",
      tipologias,
      preco_a_partir: form.preco_a_partir || null,
      preco_ate: form.preco_ate || null,
      diferenciais,
      imagem_principal: form.imagem_principal || null,
      logo_url: form.logo_url || null,
      previsao_entrega: form.previsao_entrega || null,
      construtora: form.construtora || null,
      ativo: form.ativo ?? true,
      destaque_home: form.destaque_home ?? false,
      ordem: form.ordem ?? 0,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("empreendimentos").update(payload as any).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("empreendimentos").insert(payload as any));
    }

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Atualizado!" : "Criado!" });
      setDialogOpen(false);
      fetchAll();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que quer excluir?")) return;
    const { error } = await supabase.from("empreendimentos").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Excluído!" });
      fetchAll();
    }
  }

  async function moveOrder(id: string, direction: "up" | "down") {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const a = items[idx];
    const b = items[swapIdx];
    await Promise.all([
      supabase.from("empreendimentos").update({ ordem: b.ordem } as any).eq("id", a.id),
      supabase.from("empreendimentos").update({ ordem: a.ordem } as any).eq("id", b.id),
    ]);
    fetchAll();
  }

  async function toggleDestaque(id: string, current: boolean) {
    await supabase.from("empreendimentos").update({ destaque_home: !current } as any).eq("id", id);
    fetchAll();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Empreendimentos em Destaque</h1>
          <p className="text-sm text-muted-foreground">Crie landing pages e gerencie os destaques da home</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Empreendimento
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium">Nenhum empreendimento cadastrado</p>
            <p className="text-sm text-muted-foreground">Clique em "Novo Empreendimento" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <Card key={item.id} className={`transition-all ${!item.ativo ? "opacity-50" : ""}`}>
              <CardContent className="flex items-center gap-4 p-4">
                <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground/40" />

                {item.imagem_principal ? (
                  <img
                    src={item.imagem_principal}
                    alt={item.nome}
                    className="h-16 w-24 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{item.nome}</h3>
                    {item.construtora && (
                      <span className="text-xs text-muted-foreground">• {item.construtora}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.bairro}{item.cidade ? `, ${item.cidade}` : ""} · /empreendimentos/{item.slug}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`dest-${item.id}`} className="text-xs text-muted-foreground whitespace-nowrap">
                      Home
                    </Label>
                    <Switch
                      id={`dest-${item.id}`}
                      checked={item.destaque_home}
                      onCheckedChange={() => toggleDestaque(item.id, item.destaque_home)}
                    />
                  </div>

                  <div className="flex flex-col">
                    <button
                      onClick={() => moveOrder(item.id, "up")}
                      disabled={idx === 0}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveOrder(item.id, "down")}
                      disabled={idx === items.length - 1}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`/empreendimentos/${item.slug}`} target="_blank" rel="noopener">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Empreendimento" : "Novo Empreendimento"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input value={form.nome || ""} onChange={(e) => updateField("nome", e.target.value)} placeholder="Mega Cyrela" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug *</Label>
                <Input value={form.slug || ""} onChange={(e) => updateField("slug", e.target.value)} placeholder="mega-cyrela" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Construtora</Label>
                <Input value={form.construtora || ""} onChange={(e) => updateField("construtora", e.target.value)} placeholder="Cyrela" />
              </div>
              <div className="space-y-1.5">
                <Label>Previsão de Entrega</Label>
                <Input value={form.previsao_entrega || ""} onChange={(e) => updateField("previsao_entrega", e.target.value)} placeholder="Dezembro 2027" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={form.descricao || ""} onChange={(e) => updateField("descricao", e.target.value)} rows={4} placeholder="Descrição do empreendimento..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Bairro</Label>
                <Input value={form.bairro || ""} onChange={(e) => updateField("bairro", e.target.value)} placeholder="Moinhos de Vento" />
              </div>
              <div className="space-y-1.5">
                <Label>Localização (endereço)</Label>
                <Input value={form.localizacao || ""} onChange={(e) => updateField("localizacao", e.target.value)} placeholder="Rua..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Preço a partir de</Label>
                <Input type="number" value={form.preco_a_partir ?? ""} onChange={(e) => updateField("preco_a_partir", e.target.value ? Number(e.target.value) : null)} placeholder="500000" />
              </div>
              <div className="space-y-1.5">
                <Label>Preço até</Label>
                <Input type="number" value={form.preco_ate ?? ""} onChange={(e) => updateField("preco_ate", e.target.value ? Number(e.target.value) : null)} placeholder="2000000" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tipologias (uma por linha: Tipo - Área - Quartos)</Label>
              <Textarea
                value={tipologiasText}
                onChange={(e) => setTipologiasText(e.target.value)}
                rows={3}
                placeholder={"Apartamento - 85m² - 2 quartos\nCobertura - 150m² - 3 quartos"}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Diferenciais (um por linha)</Label>
              <Textarea
                value={diferenciaisText}
                onChange={(e) => setDiferenciaisText(e.target.value)}
                rows={3}
                placeholder={"Piscina aquecida\nAcademia completa\nRooftop com churrasqueira"}
              />
            </div>

            <div className="space-y-1.5">
              <Label>URL da Imagem Principal</Label>
              <Input value={form.imagem_principal || ""} onChange={(e) => updateField("imagem_principal", e.target.value)} placeholder="https://..." />
            </div>

            <div className="space-y-1.5">
              <Label>URL do Logo</Label>
              <Input value={form.logo_url || ""} onChange={(e) => updateField("logo_url", e.target.value)} placeholder="https://..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Meta Title (SEO)</Label>
                <Input value={form.meta_title || ""} onChange={(e) => updateField("meta_title", e.target.value)} placeholder="Mega Cyrela - Apartamentos em Porto Alegre" />
              </div>
              <div className="space-y-1.5">
                <Label>Meta Description (SEO)</Label>
                <Input value={form.meta_description || ""} onChange={(e) => updateField("meta_description", e.target.value)} placeholder="Descubra..." />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.ativo ?? true} onCheckedChange={(v) => updateField("ativo", v)} />
                <Label>Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.destaque_home ?? false} onCheckedChange={(v) => updateField("destaque_home", v)} />
                <Label>Destaque na Home</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label>Ordem</Label>
                <Input type="number" className="w-20" value={form.ordem ?? 0} onChange={(e) => updateField("ordem", Number(e.target.value))} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
