'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, Edit, X, Check, Sparkles, Plus, AlertCircle, EyeOff } from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';

export default function AdminNewCollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Edit Modal State (matches original saree edit fields)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColorSwatchHex, setEditColorSwatchHex] = useState('#D4AF37');
  const [editColorSwatchName, setEditColorSwatchName] = useState('');
  const [editFabricSpec, setEditFabricSpec] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editDiscountPrice, setEditDiscountPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editIsNewCollection, setEditIsNewCollection] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Add from catalog modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [nonCollectionProducts, setNonCollectionProducts] = useState<Product[]>([]);
  const [loadingNonCollection, setLoadingNonCollection] = useState(false);

  useEffect(() => {
    fetchNewCollectionProducts();
  }, []);

  const fetchNewCollectionProducts = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_explore_collection', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: unknown) {
      console.error('Error fetching new collection products:', err);
      setFetchError('Unable to fetch New Collection products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNonCollectionProducts = async () => {
    setLoadingNonCollection(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or('is_explore_collection.is.null,is_explore_collection.eq.false')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNonCollectionProducts(data || []);
    } catch (err: unknown) {
      console.error('Error fetching catalog products:', err);
    } finally {
      setLoadingNonCollection(false);
    }
  };

  const handleAddAllToNewCollection = async () => {
    if (!confirm('Are you sure you want to add ALL currently uploaded products to the New Collection?')) return;
    setIsAddingAll(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_explore_collection: true })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      await fetchNewCollectionProducts();
      alert('Success! All uploaded products are now added to the New Collection.');
    } catch (err: unknown) {
      console.error('Error updating all products:', err);
      alert('Failed to update all products. Please try again.');
    } finally {
      setIsAddingAll(false);
    }
  };

  const handleRemoveFromNewCollection = async (product: Product) => {
    if (!confirm(`Remove "${product.name}" from New Collection? (This will NOT delete the product from the store, only remove it from the New Collection)`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_explore_collection: false })
        .eq('id', product.id);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err: unknown) {
      console.error('Error removing from collection:', err);
      alert('Failed to remove product from collection.');
    }
  };

  const handlePermanentDelete = async (product: Product) => {
    if (!confirm(`Permanently delete "${product.name}"? This will delete it from the entire store and permanently remove photos from Cloudflare storage.`)) return;

    try {
      const urlsToDelete: string[] = [];
      if (product.image_url) urlsToDelete.push(product.image_url);
      if (product.image_urls && Array.isArray(product.image_urls)) {
        product.image_urls.forEach(url => {
          if (url && !urlsToDelete.includes(url)) urlsToDelete.push(url);
        });
      }

      if (urlsToDelete.length > 0) {
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrls: urlsToDelete }),
        });
      }

      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err: unknown) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    }
  };

  const handleAddSingleToCollection = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_explore_collection: true })
        .eq('id', product.id);

      if (error) throw error;
      setNonCollectionProducts(prev => prev.filter(p => p.id !== product.id));
      setProducts(prev => [{ ...product, is_explore_collection: true }, ...prev]);
    } catch (err: unknown) {
      console.error('Error adding product:', err);
      alert('Failed to add product to New Collection.');
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name || '');

    let parsedDesc = { text: product.description || '', colorName: '', colorHex: '#D4AF37', fabricSpec: '' };
    try {
      if (product.description && product.description.trim().startsWith('{')) {
        parsedDesc = { ...parsedDesc, ...JSON.parse(product.description) };
      }
    } catch (e) {}

    setEditDescription(parsedDesc.text);
    setEditColorSwatchName(parsedDesc.colorName);
    setEditColorSwatchHex(parsedDesc.colorHex || '#D4AF37');
    setEditFabricSpec(parsedDesc.fabricSpec || '');
    setEditOriginalPrice(product.original_price ? String(product.original_price) : '');
    setEditDiscountPrice(product.discount_price ? String(product.discount_price) : '');
    setEditCategory(product.category || '');
    setEditIsNewCollection(product.is_explore_collection !== false);
    setEditError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingEdit(true);
    setEditError('');

    try {
      const descJson = JSON.stringify({
        text: editDescription || '',
        colorName: editColorSwatchName || '',
        colorHex: editColorSwatchHex || '#D4AF37',
        fabricSpec: editFabricSpec || ''
      });

      const updatedFields = {
        name: editName,
        description: descJson,
        original_price: editOriginalPrice ? parseFloat(editOriginalPrice) : null,
        discount_price: editDiscountPrice ? parseFloat(editDiscountPrice) : null,
        category: editCategory || editingProduct.category,
        is_explore_collection: editIsNewCollection,
      };

      const { data, error } = await supabase
        .from('products')
        .update(updatedFields)
        .eq('id', editingProduct.id)
        .select()
        .single();

      if (error) throw error;

      if (!editIsNewCollection) {
        setProducts(prev => prev.filter(p => p.id !== editingProduct.id));
      } else {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? data : p));
      }

      setEditingProduct(null);
    } catch (err: unknown) {
      console.error('Error saving edits:', err);
      const msg = err instanceof Error ? err.message : 'Failed to save edits.';
      setEditError(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const calculateDiscountPercent = (orig?: number | null, disc?: number | null) => {
    if (orig && disc && orig > disc && orig > 0) {
      return Math.round(((orig - disc) / orig) * 100);
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header Banner in original blush styling */}
      <div className="border-b border-[#8A5A19]/20 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#1F3324] tracking-wide">New Collection Manager</h1>
          </div>
          <p className="text-[#1F3324]/70 font-semibold text-xs uppercase tracking-[0.2em] mt-1.5">
            Manage & Edit products in the New Collection ({products.length} active)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setShowAddModal(true);
              fetchNonCollectionProducts();
            }}
            className="px-4 py-2 bg-white/70 hover:bg-white text-[#1F3324] border border-[#8A5A19]/40 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#8A5A19]" /> Add From Catalog
          </button>

          <button
            onClick={handleAddAllToNewCollection}
            disabled={isAddingAll}
            className="px-4 py-2 bg-[#1F3324] hover:bg-[#8A5A19] text-[#EBD4C9] rounded-sm text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-60"
          >
            {isAddingAll ? (
              <div className="w-4 h-4 border-2 border-[#EBD4C9] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            )}
            Add All Uploaded Sarees
          </button>
        </div>
      </div>

      {/* Product List */}
      <section>
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="w-8 h-8 border-2 border-[#8A5A19] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : fetchError ? (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{fetchError}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-16 border border-[#8A5A19]/20 border-dashed rounded-sm bg-white/40">
            <Sparkles className="w-10 h-10 text-[#8A5A19]/50 mx-auto mb-3" />
            <p className="text-[#1F3324] text-base font-serif mb-2">No products in New Collection yet</p>
            <p className="text-[#1F3324]/70 text-xs uppercase tracking-wider mb-5 max-w-md mx-auto">
              Click &quot;Add All Uploaded Sarees&quot; to include everything immediately, or &quot;Add From Catalog&quot; to select specific weaves.
            </p>
            <button
              onClick={handleAddAllToNewCollection}
              className="px-6 py-2.5 bg-[#1F3324] text-[#EBD4C9] text-xs uppercase tracking-widest font-bold rounded-sm shadow-md hover:bg-[#8A5A19] transition-all cursor-pointer"
            >
              Add All Uploaded Sarees Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const discount = calculateDiscountPercent(product.original_price, product.discount_price);
              const totalPhotos = (product.image_urls && product.image_urls.length > 0) ? product.image_urls.length : 1;

              return (
                <div 
                  key={product.id} 
                  className="group border border-[#8A5A19] shadow-[0_4px_15px_rgba(138,90,25,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] rounded-md overflow-hidden bg-[#EAE3D9]/60 transition-all duration-300 flex flex-col"
                >
                  {/* Photo container */}
                  <div className="relative aspect-[3/4] w-full border-b border-[#8A5A19]/20 bg-white/30">
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      fill 
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                    />

                    {/* New Collection Badge */}
                    <span className="absolute top-2 left-2 bg-[#1F3324] text-[#EBD4C9] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-md flex items-center gap-1 border border-[#8A5A19]/40">
                      ✨ New Collection
                    </span>

                    {/* Multiple photos count */}
                    {totalPhotos > 1 && (
                      <span className="absolute bottom-2 left-2 bg-[#EAE3D9]/80 backdrop-blur-sm text-[#1F3324] text-[10px] px-2 py-0.5 rounded-sm border border-[#8A5A19]/30">
                        📷 {totalPhotos} photos
                      </span>
                    )}

                    {/* Quick Action Overlay Buttons */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(product)}
                        className="bg-[#1F3324]/90 hover:bg-[#1F3324] text-[#EBD4C9] p-2 rounded-full shadow-md transition-all cursor-pointer"
                        title="Edit product content"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromNewCollection(product)}
                        className="bg-amber-800/90 hover:bg-amber-700 text-white p-2 rounded-full shadow-md transition-all cursor-pointer"
                        title="Remove from New Collection"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(product)}
                        className="bg-red-900/90 hover:bg-red-700 text-red-100 p-2 rounded-full shadow-md transition-all cursor-pointer"
                        title="Permanently Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#8A5A19] font-bold block mb-1">
                        {product.category}
                      </span>
                      <h3 className="text-[#1F3324] font-serif text-sm font-semibold line-clamp-2 leading-snug" title={product.name}>
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-[#1F3324]/70 text-xs line-clamp-1 italic mt-1 font-light">
                          {product.description.startsWith('{') ? 'Custom craft specs' : product.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mt-2.5 pt-2 border-t border-[#8A5A19]/15">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        {product.original_price || product.discount_price ? (
                          <>
                            <span className="text-[#1F3324] text-sm font-bold">
                              ₹{product.discount_price ? Number(product.discount_price).toLocaleString('en-IN') : Number(product.original_price).toLocaleString('en-IN')}
                            </span>
                            {product.discount_price && product.original_price && Number(product.original_price) > Number(product.discount_price) && (
                              <span className="text-gray-400 line-through text-[10px]">
                                ₹{Number(product.original_price).toLocaleString('en-IN')}
                              </span>
                            )}
                            {discount && (
                              <span className="text-[#E57373] text-[10px] font-bold italic ml-0.5">
                                {discount}% OFF
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[#1F3324]/50 text-xs">Price on request</span>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-3 pt-2 border-t border-[#8A5A19]/10 flex items-center justify-between gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-[10px] uppercase tracking-wider text-[#1F3324] hover:text-[#8A5A19] flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Edit className="w-3 h-3" /> Edit Product
                        </button>
                        <button
                          onClick={() => handleRemoveFromNewCollection(product)}
                          className="text-[10px] uppercase tracking-wider text-amber-800 hover:text-amber-900 font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* EDIT PRODUCT MODAL (Matches original blush modal styling) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#EAE3D9] border border-[#8A5A19] rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#8A5A19]/20 pb-3">
              <h3 className="font-serif text-xl text-[#1F3324] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#8A5A19]" /> Edit New Collection Product
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-[#1F3324] hover:text-[#8A5A19] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded-sm text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1.5">Saree Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/60 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1.5">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/60 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                    placeholder="e.g. 5999"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1.5">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={editDiscountPrice}
                    onChange={(e) => setEditDiscountPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/60 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                    placeholder="e.g. 3999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1.5">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/60 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                  placeholder="e.g. KANCHI PATTU"
                />
              </div>

              {/* Color Swatch & Fabric Spec */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1.5">Color Swatch</label>
                  <div className="flex bg-white/60 border border-[#8A5A19]/30 rounded-sm overflow-hidden h-[38px]">
                    <input 
                      type="color"
                      value={editColorSwatchHex}
                      onChange={(e) => setEditColorSwatchHex(e.target.value)}
                      className="h-full w-12 cursor-pointer border-none p-0 outline-none bg-transparent"
                    />
                    <input 
                      type="text"
                      value={editColorSwatchName}
                      onChange={(e) => setEditColorSwatchName(e.target.value)}
                      placeholder="Color Name"
                      className="flex-1 px-2.5 bg-transparent text-[#1F3324] text-xs outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1.5">Fabric</label>
                  <input 
                    type="text"
                    value={editFabricSpec}
                    onChange={(e) => setEditFabricSpec(e.target.value)}
                    placeholder="e.g. Pure Silk"
                    className="w-full px-3.5 py-2 bg-white/60 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1.5">Craft Story Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/60 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm resize-none"
                  placeholder="Fabric, weave, color details..."
                />
              </div>

              {/* Toggle in New Collection */}
              <div className="p-3 bg-white/70 border border-[#8A5A19]/30 rounded-sm">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsNewCollection}
                    onChange={(e) => setEditIsNewCollection(e.target.checked)}
                    className="w-4 h-4 accent-[#1F3324] cursor-pointer rounded"
                  />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#1F3324] font-bold block">
                      Include in New Collection
                    </span>
                    <span className="text-[10px] text-[#1F3324]/70 block">
                      Uncheck to remove this saree from the New Collection without deleting it from your catalog
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#8A5A19]/20">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-[#8A5A19]/30 text-[#1F3324] text-xs uppercase tracking-wider rounded-sm hover:bg-white/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2 bg-[#1F3324] hover:bg-[#8A5A19] text-[#EBD4C9] text-xs uppercase tracking-wider font-bold rounded-sm shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isSavingEdit ? (
                    <div className="w-4 h-4 border-2 border-[#EBD4C9] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FROM CATALOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#EAE3D9] border border-[#8A5A19] rounded-sm max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#8A5A19]/20 pb-3">
              <div>
                <h3 className="font-serif text-xl text-[#1F3324]">Add Sarees to New Collection</h3>
                <p className="text-[10px] text-[#1F3324]/70 uppercase tracking-widest mt-0.5">
                  Browse catalog products not currently in New Collection
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#1F3324] hover:text-[#8A5A19] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingNonCollection ? (
              <div className="flex justify-center p-12">
                <div className="w-7 h-7 border-2 border-[#8A5A19] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : nonCollectionProducts.length === 0 ? (
              <div className="text-center p-10 border border-[#8A5A19]/20 border-dashed rounded-sm bg-white/40">
                <p className="text-[#1F3324] text-sm">All uploaded products are already featured in the New Collection!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-1">
                {nonCollectionProducts.map((prod) => (
                  <div key={prod.id} className="border border-[#8A5A19]/30 rounded-sm overflow-hidden bg-white/60 flex flex-col justify-between">
                    <div className="relative aspect-[3/4] w-full bg-white/30">
                      <Image src={prod.image_url} alt={prod.name} fill className="object-cover" />
                    </div>
                    <div className="p-2.5">
                      <p className="text-[#1F3324] text-xs font-serif font-semibold truncate">{prod.name}</p>
                      <button
                        onClick={() => handleAddSingleToCollection(prod)}
                        className="mt-2 w-full py-1.5 bg-[#1F3324] hover:bg-[#8A5A19] text-[#EBD4C9] text-[10px] uppercase tracking-wider font-bold rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Add to Collection
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#8A5A19]/20">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 border border-[#8A5A19]/30 text-[#1F3324] text-xs uppercase tracking-wider rounded-sm hover:bg-white/60 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
