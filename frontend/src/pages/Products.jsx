import { useState, useEffect } from "react";
import { Plus, Search, Package, AlertTriangle } from "lucide-react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { PRODUCT_CATEGORIES } from "../constants";

const CATEGORIES = PRODUCT_CATEGORIES;
const isMobile = () => window.innerWidth < 768;

function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      sku: "",
      price: "",
      stock: "",
      category: CATEGORIES[0],
      description: "",
      image: "",
    },
  );
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFileChange(selected) {
    setFile(selected);
    setDuplicate(null);
    if (!selected) return;
    setCheckingDuplicate(true);
    try {
      const fd = new FormData();
      fd.append("photo", selected);
      const { best_match } = await api.post("/products/identify", fd);
      if (best_match && best_match.id !== initial?.id) setDuplicate(best_match);
    } catch {
      // identificação é um auxílio, não deve bloquear o cadastro se falhar
    } finally {
      setCheckingDuplicate(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("image", file);
      const saved = initial
        ? await fetch(`/api/products/${initial.id}`, {
            method: "PUT",
            body: fd,
          }).then((r) => r.json())
        : await fetch("/api/products", { method: "POST", body: fd }).then((r) =>
            r.json(),
          );
      onSave(saved);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Nome do Produto *
          </label>
          <input
            className={input}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            SKU *
          </label>
          <input
            className={`${input} font-mono`}
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Categoria
          </label>
          <select
            className={input}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Preço (R$) *
          </label>
          <input
            className={input}
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Estoque *
          </label>
          <input
            className={input}
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Descrição
          </label>
          <textarea
            className={`${input} resize-none`}
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Foto (URL ou upload)
          </label>
          <input
            className={input}
            placeholder="https://..."
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
          />
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-slate-400">ou</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="text-xs text-slate-500"
            />
            {checkingDuplicate && (
              <span className="text-xs text-slate-400">
                verificando duplicidade...
              </span>
            )}
          </div>
          {duplicate && (
            <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle
                size={14}
                className="text-amber-500 flex-shrink-0"
              />
              <p className="text-xs text-amber-700">
                Produto parecido já cadastrado:{" "}
                <span className="font-semibold">{duplicate.name}</span> (
                {duplicate.similarity}% de similaridade)
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {loading ? "Salvando..." : initial ? "Atualizar" : "Criar Produto"}
        </button>
      </div>
    </form>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [modal, setModal] = useState(null); // null | 'create' | product
  const [mobile] = useState(isMobile);

  async function load() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const data = await api.get(`/products?${params}`);
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, [search, category]);

  async function handleDelete(id) {
    if (!confirm("Excluir produto?")) return;
    await api.delete(`/products/${id}`);
    setProducts((p) => p.filter((x) => x.id !== id));
  }

  function handleSaved(product) {
    setProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.map((p) => (p.id === product.id ? product : p));
      return [product, ...prev];
    });
    setModal(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Produtos"
        subtitle={`${products.length} produtos cadastrados`}
        action={
          !mobile && (
            <button
              onClick={() => setModal("create")}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              <Plus size={16} /> Novo Produto
            </button>
          )
        }
      />

      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          placeholder="Buscar produto, código, marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {["Todos", ...CATEGORIES].map((c) => {
          const active = c === "Todos" ? !category : category === c;
          return (
            <button
              key={c}
              onClick={() => setCategory(c === "Todos" ? "" : c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Package size={40} className="mb-3 opacity-40" />
          <p className="text-sm">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              readonly={mobile}
              onEdit={(prod) => setModal(prod)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!mobile && (
        <button
          onClick={() => setModal("create")}
          className="md:hidden fixed bottom-20 right-4 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus size={20} />
        </button>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "create" ? "Novo Produto" : "Editar Produto"}
        size="md"
      >
        <ProductForm
          initial={modal !== "create" ? modal : undefined}
          onSave={handleSaved}
          onClose={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}
