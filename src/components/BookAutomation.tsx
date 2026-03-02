"use client";

import { useState, useRef, useEffect } from "react";
import {
    Barcode,
    Search,
    Book as BookIcon,
    Plus,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Image as ImageIcon,
    Camera,
    CameraOff
} from "lucide-react";
import { toast } from "sonner";
import { addAutoBook } from "@/app/api/books/actions";
import { Html5QrcodeScanner } from "html5-qrcode";

interface BookData {
    title: string;
    authors: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    imageLinks?: {
        thumbnail: string;
    };
    isbn: string;
    categoryId?: string;
    supplierId?: string;
}

export default function BookAutomation({ stores, categories, suppliers }: { stores: any[], categories: any[], suppliers: any[] }) {
    const [isbn, setIsbn] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [book, setBook] = useState<BookData | null>(null);
    const [costPrice, setCostPrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [stock, setStock] = useState("1");
    const [selectedStore, setSelectedStore] = useState(stores[0]?.id || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isScannerActive, setIsScannerActive] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Camera Scanner Effect
    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;

        if (isScannerActive) {
            scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 },
                    aspectRatio: 1.777778
                },
                /* verbose= */ false
            );

            scanner.render(
                (decodedText) => {
                    const cleanCode = decodedText.replace(/[^0-9]/g, "");
                    if (cleanCode.length >= 10) {
                        setIsbn(cleanCode);
                        fetchBookData(cleanCode, true);
                        setIsScannerActive(false);
                    }
                },
                (error) => {
                    // console.warn(error);
                }
            );
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            }
        };
    }, [isScannerActive]);

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const emptyBook = (code: string): BookData => ({
        title: "",
        authors: [""],
        publisher: "",
        publishedDate: "",
        description: "",
        imageLinks: { thumbnail: "" },
        isbn: code,
        categoryId: "",
        supplierId: ""
    });

    const fetchBookData = async (code: string, silent = false) => {
        if (!code || code.length < 10) return;

        setIsLoading(true);
        if (!silent) setBook(null); // Keep previous book if silent for a smoother feel
        try {
            const res = await fetch(`/api/books/isbn/${code}`);
            const data = await res.json();

            if (data.error) {
                if (!silent) toast.error("No se encontró el libro. Ingresa los datos manualmente.");
                setBook(emptyBook(code));
            } else {
                setBook({ ...data, categoryId: "", supplierId: "" });
                toast.success("¡Libro encontrado! Verifica los datos.");
            }
        } catch (error) {
            if (!silent) toast.error("Error al buscar el libro, ingresa manual.");
            setBook(emptyBook(code));
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce timer for auto-fetch
    const autoFetchTimer = useRef<NodeJS.Timeout | null>(null);

    const handleIsbnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, "");
        setIsbn(val);

        if (autoFetchTimer.current) clearTimeout(autoFetchTimer.current);

        // Auto-fetch if it looks like a full ISBN-10 or ISBN-13
        if (val.length === 10 || val.length === 13) {
            autoFetchTimer.current = setTimeout(() => {
                fetchBookData(val, true); // Silent auto-fetch
            }, 600); // 600ms debounce
        }
    };

    const handleBookChange = (field: keyof BookData, value: any) => {
        if (book) {
            setBook({ ...book, [field]: value });
        }
    };

    const handleSave = async () => {
        if (!book || !salePrice || !selectedStore || !book.title) {
            toast.error("Completa el título, los precios y selecciona una sucursal");
            return;
        }

        setIsSaving(true);
        try {
            const result = await addAutoBook({
                name: book.title,
                description: book.description || `Libro por ${book.authors.join(", ")}`,
                barcode: book.isbn,
                imageUrl: book.imageLinks?.thumbnail || "",
                metadata: JSON.stringify({
                    authors: book.authors,
                    publisher: book.publisher,
                    publishedDate: book.publishedDate
                }),
                costPrice: parseFloat(costPrice) || 0,
                price: parseFloat(salePrice),
                initialStock: parseFloat(stock) || 0,
                storeId: parseInt(selectedStore),
                categoryId: book.categoryId ? parseInt(book.categoryId) : undefined,
                supplierId: book.supplierId ? parseInt(book.supplierId) : undefined
            });

            if (result.success) {
                toast.success("Libro agregado al inventario");
                setBook(null);
                setIsbn("");
                setCostPrice("");
                setSalePrice("");
                setStock("1");
                inputRef.current?.focus();
            }
        } catch (error) {
            toast.error("Error al guardar en la base de datos");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Search Section */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 space-y-3">
                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Barcode className="w-4 h-4" /> Escanear ISBN
                        </label>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={isbn}
                                onChange={handleIsbnChange}
                                placeholder="Escribe o escanea el código..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white text-xl font-bold tracking-tight focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                            />
                            {isLoading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => fetchBookData(isbn)}
                        disabled={isLoading || isbn.length < 10}
                        className="h-16 px-8 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        <Search className="w-5 h-5" /> Buscar
                    </button>
                    <button
                        onClick={() => setIsScannerActive(!isScannerActive)}
                        className={`h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${isScannerActive
                            ? "bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20"
                            : "bg-slate-800 text-slate-200 hover:bg-slate-700 shadow-slate-900/40"
                            }`}
                    >
                        {isScannerActive ? (
                            <>
                                <CameraOff className="w-5 h-5" /> Cerrar Cámara
                            </>
                        ) : (
                            <>
                                <Camera className="w-5 h-5" /> Usar Cámara
                            </>
                        )}
                    </button>
                </div>

                {isScannerActive && (
                    <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div id="reader" className="w-full"></div>
                        <div className="p-4 bg-indigo-600/10 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                                Centra el código de barras en el recuadro para escanear
                            </p>
                        </div>
                    </div>
                )}
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">
                    Soporta escáners de hardware y entrada manual (ISBN-10 / ISBN-13). Si no se encuentra, podrás llenarlo.
                </p>
            </div>

            {/* Results & Form Section */}
            {book && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom duration-500">
                    {/* Editable Book Preview */}
                    <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] -z-10" />

                        <div className="flex flex-col md:flex-row gap-10">
                            <div className="w-full md:w-56 shrink-0 aspect-[2/3] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
                                {book.imageLinks?.thumbnail ? (
                                    <img
                                        src={book.imageLinks.thumbnail.replace("http://", "https://")}
                                        alt={book.title || "Portada"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Handle broken images gracefully if manual URL is bad
                                            (e.target as HTMLImageElement).src = "";
                                        }}
                                    />
                                ) : (
                                    <ImageIcon className="w-16 h-16 text-slate-800" />
                                )}
                            </div>

                            <div className="space-y-4 flex-1 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Título</label>
                                    <input type="text" value={book.title} onChange={e => handleBookChange("title", e.target.value)} placeholder="Título del libro" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-4 text-white font-playfair font-black text-2xl italic outline-none focus:border-indigo-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Autor(es)</label>
                                        <input type="text" value={book.authors.join(", ")} onChange={e => handleBookChange("authors", e.target.value.split(",").map(a => a.trimLeft()))} placeholder="Autores (separados por coma)" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Editorial</label>
                                        <input type="text" value={book.publisher || ""} onChange={e => handleBookChange("publisher", e.target.value)} placeholder="Editorial" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Descripción</label>
                                    <textarea value={book.description || ""} onChange={e => handleBookChange("description", e.target.value)} placeholder="Descripción corta..." className="w-full h-24 bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-4 text-white text-xs outline-none focus:border-indigo-500 resize-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Categoría</label>
                                        <select value={book.categoryId || ""} onChange={e => handleBookChange("categoryId", e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-indigo-500 appearance-none">
                                            <option value="">(Solo Libros)</option>
                                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Proveedor</label>
                                        <select value={book.supplierId || ""} onChange={e => handleBookChange("supplierId", e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-indigo-500 appearance-none">
                                            <option value="">Selecciona Proveedor</option>
                                            {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Año Pub.</label>
                                        <input type="text" value={book.publishedDate || ""} onChange={e => handleBookChange("publishedDate", e.target.value)} placeholder="Ej. 2023" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">URL Portada</label>
                                        <input type="text" value={book.imageLinks?.thumbnail || ""} onChange={e => handleBookChange("imageLinks", { thumbnail: e.target.value })} placeholder="https://..." className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Form */}
                    <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                        <div className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Precio de Costo ($)</label>
                                <input
                                    type="number"
                                    value={costPrice}
                                    onChange={(e) => setCostPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-2">Precio de Venta ($)</label>
                                <input
                                    type="number"
                                    value={salePrice}
                                    onChange={(e) => setSalePrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl py-3 px-4 text-white font-bold focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Inventario</label>
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Sucursal</label>
                                    <select
                                        value={selectedStore}
                                        onChange={(e) => setSelectedStore(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:border-indigo-500 outline-none transition-all"
                                    >
                                        {stores.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !salePrice}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-emerald-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-30"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Confirmar y Guardar <CheckCircle2 className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                                <ArrowRight className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-[10px] text-emerald-400/80 leading-relaxed font-bold uppercase tracking-widest text-left">
                                Al guardar, el libro aparecerá automáticamente en la tienda y el catálogo.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!book && !isLoading && !isbn && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                    <BookIcon className="w-24 h-24 mb-6 text-slate-500" />
                    <p className="text-lg font-black uppercase tracking-[0.3em] text-white">Listo para procesar tesoros literarios</p>
                </div>
            )}
        </div>
    );
}
