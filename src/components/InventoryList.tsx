"use client";

import { useEffect, useState, useMemo } from "react";
import { pusherClient } from "@/lib/pusher/client";
import {
    Package,
    BookOpen,
    RefreshCcw,
    Camera,
    Plus,
    Search,
    Store,
    X,
    Loader2,
    ScanBarcode,
    Trash2,
    Edit3,
    ArrowLeftRight,
    Filter,
    Gamepad2,
    Coffee,
    Beer,
    MoreVertical,
    ChevronDown,
    Settings2,
    Tags,
    MapPin
} from "lucide-react";
import { addInventoryItem, deleteInventoryItem, updateInventoryItem, transferStock } from "@/app/api/inventory/actions";
import { createCategory, deleteCategory } from "@/app/api/categories/actions";
import { createStore } from "@/app/api/stores/actions";
import { getStoreAnalytics } from "@/app/api/stores/analytics";
import StoreIntelligence from "./StoreIntelligence";

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface StoreType {
    id: number;
    name: string;
    type: string;
}

interface InventoryItem {
    id: number;
    uId: string; // Unique composite ID
    name: string;
    barcode: string;
    quantity: number;
    type: string;
    categoryId: number | null;
    storeId: number;
    minStock: number;
}

export default function InventoryList({
    initialItems = [],
    initialCategories = [],
    initialStores = []
}: {
    initialItems: InventoryItem[],
    initialCategories: Category[],
    initialStores: StoreType[]
}) {
    const [items, setItems] = useState(initialItems);
    const [categories, setCategories] = useState(initialCategories);
    const [stores, setStores] = useState(initialStores);

    // Sync state with server-side props when they change (e.g. after revalidatePath)
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    useEffect(() => {
        setStores(initialStores);
    }, [initialStores]);

    const [activeCategory, setActiveCategory] = useState('all');
    const [activeStore, setActiveStore] = useState('all');
    const [searchQuery, setSearchQuery] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'item' | 'category' | 'store' | 'transfer'>('item');

    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Store Intelligence State
    const [viewingStoreInfo, setViewingStoreInfo] = useState<any | null>(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    useEffect(() => {
        const channel = pusherClient.subscribe("inventory-updates");
        channel.bind("stock-changed", (data: { itemId: number; newQuantity: number }) => {
            setItems((prev) =>
                prev.map((item) =>
                    item.id === data.itemId ? { ...item, quantity: data.newQuantity } : item
                )
            );
        });
        return () => pusherClient.unsubscribe("inventory-updates");
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.barcode.includes(searchQuery);
            const matchesCategory = activeCategory === 'all' || item.categoryId === parseInt(activeCategory);
            const matchesStore = activeStore === 'all' || item.storeId === parseInt(activeStore);
            return matchesSearch && matchesCategory && matchesStore;
        });
    }, [items, searchQuery, activeCategory, activeStore]);

    const handleDelete = async (id: number) => {
        if (confirm("¿Borrar este ítem de la red neuronal?")) {
            const res = await deleteInventoryItem(id);
            if (res.success) setItems(prev => prev.filter(i => i.id !== id));
        }
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'BookOpen': return <BookOpen className="w-4 h-4" />;
            case 'Gamepad2': return <Gamepad2 className="w-4 h-4" />;
            case 'Beer': return <Beer className="w-4 h-4" />;
            case 'Coffee': return <Coffee className="w-4 h-4" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    const handleViewStore = async (storeId: number) => {
        setIsLoadingAnalytics(true);
        const res = await getStoreAnalytics(storeId);
        if (res.success) {
            setViewingStoreInfo(res.data);
            setIsModalOpen(false);
        }
        setIsLoadingAnalytics(false);
    };

    if (viewingStoreInfo) {
        return <StoreIntelligence
            initialData={viewingStoreInfo}
            onBack={() => setViewingStoreInfo(null)}
        />;
    }

    return (
        <div className="w-full space-y-8 animate-fade-in p-2">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="text-left">
                    <h2 className="text-4xl font-outfit font-black tracking-tighter text-white">
                        ORQUESTADOR <span className="text-indigo-500 italic">NEURAL</span>
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sincronicidad Activa</span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">V.2.0 | Multi-Sucursal</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative group flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Escanear o buscar producto..."
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-3xl text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all text-white backdrop-blur-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => { setModalType('item'); setIsEditMode(false); setIsModalOpen(true); }}
                        className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Producto
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => { setModalType('category'); setIsModalOpen(true); }}
                            className="p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all"
                            title="Gestionar Categorías"
                        >
                            <Tags className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => { setModalType('store'); setIsModalOpen(true); }}
                            className="p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all"
                            title="Gestionar Sucursales"
                        >
                            <MapPin className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Categories Toolbar */}
            <div className="flex items-center gap-4 border-b border-slate-900 pb-4 overflow-x-auto scrollbar-hide">
                <Filter className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shrink-0
            ${activeCategory === 'all' ? "bg-white text-slate-950 border-white shadow-lg" : "bg-transparent text-slate-500 border-slate-800 hover:text-slate-300"}
          `}
                >
                    Todo
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id.toString())}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shrink-0 flex items-center gap-2
              ${activeCategory === cat.id.toString() ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20" : "bg-transparent text-slate-500 border-slate-800 hover:text-slate-300"}
            `}
                    >
                        {getIcon(cat.icon)}
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Main Grid Table */}
            <div className="grid grid-cols-1 gap-6">
                <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 backdrop-blur-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/30 border-b border-slate-800">
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Segmento / Nodo</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Categoría</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Cuantos</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Módulos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/50">
                            {filteredItems.map((item) => (
                                <tr key={item.uId} className="hover:bg-slate-900/40 transition-all group/row">
                                    <td className="p-6">
                                        <div className="flex items-center gap-5 text-left">
                                            <div className="relative">
                                                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 group-hover/row:border-indigo-500/30 transition-all group-hover/row:translate-y-[-2px] shadow-lg">
                                                    {categories.find(c => c.id === item.categoryId)?.icon ? getIcon(categories.find(c => c.id === item.categoryId)!.icon) : <Package className="w-5 h-5 text-slate-500" />}
                                                </div>
                                                {item.quantity <= item.minStock && (
                                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-4 border-slate-950 shadow-lg animate-pulse" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-outfit font-bold text-lg text-slate-100 group-hover/row:text-white transition-colors tracking-tight">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] text-zinc-600 font-mono tracking-tighter">REF_{item.barcode}</p>
                                                    <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                                        <Store className="w-2 h-2" />
                                                        {stores.find(s => s.id === item.storeId)?.name || 'Sucursal Desconocida'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-xl border border-slate-800">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {categories.find(c => c.id === item.categoryId)?.name || 'Sin red'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className={`text-3xl font-outfit font-black tracking-tighter ${item.quantity <= item.minStock ? 'text-rose-500' : 'text-white'}`}>
                                                {item.quantity}
                                            </span>
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className={`h-1 w-3 rounded-full ${i <= (item.quantity / item.minStock) * 1.5 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center justify-end gap-3 opacity-40 group-hover/row:opacity-100 transition-all">
                                            <button
                                                onClick={() => { setSelectedItem(item); setIsEditMode(true); setModalType('item'); setIsModalOpen(true); }}
                                                className="p-3 bg-slate-900 hover:bg-indigo-600/20 text-slate-500 hover:text-indigo-400 rounded-xl border border-slate-800 transition-all"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedItem(item); setModalType('transfer'); setIsModalOpen(true); }}
                                                className="p-3 bg-slate-900 hover:bg-purple-600/20 text-slate-500 hover:text-purple-400 rounded-xl border border-slate-800 transition-all"
                                            >
                                                <ArrowLeftRight className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-3 bg-slate-900 hover:bg-rose-600/20 text-slate-500 hover:text-rose-400 rounded-xl border border-slate-800 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Unified Modal System */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/80 animate-fade-in text-left">
                    <div className="relative bg-slate-950 border border-white/5 rounded-[3.5rem] w-full max-w-2xl p-12 shadow-[0_0_100px_rgba(79,70,229,0.1)] overflow-hidden">
                        {/* Glow decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -z-10" />

                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-4xl font-outfit font-black tracking-tighter text-white uppercase italic">
                                    {modalType === 'item' ? (isEditMode ? "Modificar" : "Inyectar") :
                                        modalType === 'category' ? "Maestro de Red" :
                                            modalType === 'store' ? "Expansión de Sucursales" : "Tele-Transporte"}
                                </h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
                                    {modalType} control nexus
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-900 rounded-full border border-slate-800 transition-all group">
                                <X className="w-6 h-6 text-slate-500 group-hover:text-white" />
                            </button>
                        </div>

                        {/* ITEM MODAL */}
                        {modalType === 'item' && (
                            <form action={async (formData) => {
                                if (isEditMode && selectedItem) {
                                    let sid = parseInt(formData.get("storeId") as string) || selectedItem.storeId;
                                    const res = await updateInventoryItem(selectedItem.id, sid, {
                                        name: formData.get("name") as string,
                                        quantity: parseFloat(formData.get("quantity") as string),
                                        categoryId: formData.get("categoryId") ? parseInt(formData.get("categoryId") as string) : null
                                    });
                                    if (res.success && res.data) {
                                        setItems(prev => prev.map(i => i.uId === res.data.uId ? { ...i, ...res.data } : i));
                                    }
                                } else {
                                    const res = await addInventoryItem(formData);
                                    if (res.success && res.data) {
                                        setItems(prev => [...prev, res.data as any]);
                                    }
                                }
                                setIsModalOpen(false);
                            }} className="grid grid-cols-2 gap-8">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Descriptivo</label>
                                    <input name="name" defaultValue={isEditMode ? selectedItem?.name : ""} required className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium shadow-inner" placeholder="P Ej. Specialty Beans / Catan" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Barcode Sincro</label>
                                    <input name="barcode" defaultValue={isEditMode ? selectedItem?.barcode : ""} readOnly={isEditMode} className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white font-mono focus:outline-none placeholder:text-slate-700" placeholder="000-000-000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Clasificación</label>
                                    <select name="categoryId" className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none appearance-none">
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Inicial</label>
                                    <input name="quantity" type="number" defaultValue={isEditMode ? selectedItem?.quantity : "0"} required className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nodo Destino</label>
                                    <select name="storeId" className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none appearance-none">
                                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <input type="hidden" name="type" value="product" />
                                <button type="submit" className="col-span-2 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95">
                                    {isEditMode ? "Actualizar Memoria" : "Sincronizar a la Red"}
                                </button>
                            </form>
                        )}

                        {/* TRANSFER MODAL */}
                        {modalType === 'transfer' && selectedItem && (
                            <form action={async (formData) => {
                                await transferStock(
                                    selectedItem.id,
                                    parseInt(formData.get("from") as string),
                                    parseInt(formData.get("to") as string),
                                    parseFloat(formData.get("qty") as string)
                                );
                                setIsModalOpen(false);
                            }} className="space-y-8">
                                <div className="p-6 bg-slate-900/50 border border-indigo-500/20 rounded-3xl flex items-center gap-6">
                                    <div className="p-4 bg-indigo-600 rounded-2xl">
                                        <Package className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">{selectedItem.name}</h4>
                                        <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">En red: {selectedItem.quantity} unidades</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 items-end">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Origen</label>
                                        <select name="from" className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none appearance-none">
                                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Destino</label>
                                        <select name="to" className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none appearance-none">
                                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Cantidad a Mover</label>
                                        <input name="qty" type="number" required className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none text-2xl font-black text-center" placeholder="0.00" />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20">
                                    Ejecutar Tele-Transporte
                                </button>
                            </form>
                        )}

                        {/* CATEGORY MANAGEMENT */}
                        {modalType === 'category' && (
                            <div className="space-y-10">
                                <form action={async (formData) => {
                                    await createCategory(formData.get("name") as string, formData.get("icon") as string);
                                    setIsModalOpen(false);
                                }} className="flex gap-4">
                                    <input name="name" required className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none" placeholder="Nueva Categoría... (Ej. Galletas)" />
                                    <select name="icon" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none">
                                        <option value="Package">Genérico</option>
                                        <option value="BookOpen">Libro</option>
                                        <option value="Coffee">Grano</option>
                                        <option value="Beer">Frío</option>
                                    </select>
                                    <button type="submit" className="px-8 bg-indigo-600 rounded-2xl font-bold">Crear</button>
                                </form>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Existentes en Red</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {categories.map(c => (
                                            <div key={c.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-indigo-400">{getIcon(c.icon)}</div>
                                                    <span className="text-white font-bold">{c.name}</span>
                                                </div>
                                                <button onClick={async () => { await deleteCategory(c.id); setIsModalOpen(false); }} className="text-slate-600 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STORE MANAGEMENT */}
                        {modalType === 'store' && (
                            <div className="space-y-10">
                                <form action={async (formData) => {
                                    await createStore(formData.get("name") as string, formData.get("type") as any, formData.get("address") as string);
                                    setIsModalOpen(false);
                                }} className="grid grid-cols-2 gap-4">
                                    <input name="name" required className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none" placeholder="Nombre Sucursal..." />
                                    <select name="type" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none">
                                        <option value="stable">Fija</option>
                                        <option value="informal">Punto Informal</option>
                                    </select>
                                    <input name="address" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none" placeholder="Dirección..." />
                                    <button type="submit" className="col-span-2 py-4 bg-indigo-600 rounded-2xl font-bold">Añadir Sucursal</button>
                                </form>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mapa de Sucursales</h4>
                                    <div className="space-y-2">
                                        {stores.map(s => (
                                            <div
                                                key={s.id}
                                                onClick={() => handleViewStore(s.id)}
                                                className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex justify-between items-center group cursor-pointer hover:border-indigo-500/50 transition-all active:scale-[0.98]"
                                            >
                                                <div>
                                                    <p className="text-white font-black uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{s.name}</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{s.type} | ID_{s.id}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {isLoadingAnalytics ? (
                                                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                                                    ) : (
                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:scale-150 transition-transform" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
