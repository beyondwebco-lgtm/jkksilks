'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, Edit3, X, Check, Sparkles, Plus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';

export default function AdminNewCollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Add all existing products modal / trigger
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editDiscountPrice, setEditDiscountPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editIsNewCollection, setEditIsNewCollection] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Add Existing Products Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [nonCollectionProducts, setNonCollectionProducts] = useState<Product[]>([]);
  const [loadingNonCollection, setLoadingNonCollection] = useState(false);

  useEffect(() => {
    fetchNewCollectionProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('name');
      if (data) {
        setAvailableCategories(data.map(c => c.name));
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

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
    } catch (err: any) {
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
    } catch (err: any) {
      console.error('Error fetching catalog products:', err);
    } finally {
      setLoadingNonCollection(false);
    }
  };

  // Add all sarees/products to New Collection in bulk
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
    } catch (err: any) {
      console.error('Error updating all products:', err);
      alert('Failed to update all products. Please try again.');
    } finally {
      setIsAddingAll(false);
    }
  };

  // Remove single product from New Collection (unfeature, does NOT delete from store)
  const handleRemoveFromNewCollection = async (product: Product) => {
    if (!confirm(`Remove "${product.name}" from New Collection? (This will NOT delete the product from the store, only remove it from the New Collection)`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_explore_collection: false })
        .eq('id', product.id);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err: any) {
      console.error('Error removing from collection:', err);
      alert('Failed to remove product from collection.');
    }
  };

  // Permanently delete product and Cloudflare storage
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
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    }
  };

  // Add individual product from catalog to New Collection
  const handleAddSingleToCollection = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_explore_collection: true })
        .eq('id', product.id);

      if (error) throw error;
      setNonCollectionProducts(prev => prev.filter(p => p.id !== product.id));
      setProducts(prev => [{ ...product, is_explore_collection: true }, ...prev]);
    } catch (err: any) {
      console.error('Error adding product:', err);
      alert('Failed to add product to New Collection.');
    }
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name || '');
    setEditDescription(product.description || '');
    setEditOriginalPrice(product.original_price ? String(product.original_price) : '');
    setEditDiscountPrice(product.discount_price ? String(product.discount_price) : '');
    setEditCategory(product.category || '');
    setEditIsNewCollection(product.is_explore_collection !== false);
    setEditError('');
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingEdit(true);
    setEditError('');

    try {
      const updatedFields = {
        name: editName,
        description: editDescription || null,
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

      // Update state
      if (!editIsNewCollection) {
        setProducts(prev => prev.filter(p => p.id !== editingProduct.id));
      } else {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? data : p));
      }

      setEditingProduct(null);
    } catch (err: any) {
      console.error('Error saving edits:', err);
      setEditError(err.message || 'Failed to save edits.');
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
      {/* Header Banner */}
      <div className="border-b border-[#D4AF37]/20 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#D4AF37] tracking-wide">New Collection Manager</h1>
          </div>
          <p className="text-[#D4AF37]/60 text-xs uppercase tracking-[0.2em] mt-1.5">
            Manage products featured on the public New Collection showcase ({products.length} active)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setShowAddModal(true);
              fetchNonCollectionProducts();
            }}
            className="px-4 py-2 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/40 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add From Catalog
          </button>

          <button
            onClick={handleAddAllToNewCollection}
            disabled={isAddingAll}
            className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] hover:from-[#c59f2f] hover:to-[#d4af37] text-[#210209] rounded-sm text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-60"
          >
            {isAddingAll ? (
              <div className="w-4 h-4 border-2 border-[#210209] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Add All Uploaded Sarees
          </button>
        </div>
      </div>

      {/* Product List */}
      <section>
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : fetchError ? (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{fetchError}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-16 border border-[#D4AF37]/20 border-dashed rounded-sm bg-[#120104]">
            <Sparkles className="w-10 h-10 text-[#D4AF37]/40 mx-auto mb-3" />
            <p className="text-[#D4AF37] text-base font-serif mb-2">No products in New Collection yet</p>
            <p className="text-[#D4AF37]/60 text-xs uppercase tracking-wider mb-5 max-w-md mx-auto">
              Click &quot;Add All Uploaded Sarees&quot; to include everything immediately, or &quot;Add From Catalog&quot; to pick specific weaves.
            </p>
            <button
              onClick={handleAddAllToNewCollection}
              className="px-6 py-2.5 bg-[#D4AF37] text-[#210209] text-xs uppercase tracking-widest font-bold rounded-sm shadow-md hover:bg-[#b5952f] transition-all cursor-pointer"
            >
              Add All Uploaded Sarees Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => {
              const discount = calculateDiscountPercent(product.original_price, product.discount_price);
              const totalPhotos = (product.image_urls && product.image_urls.length > 0) ? product.image_urls.length : 1;

              return (
                <div 
                  key={product.id} 
                  className="group border border-[#D4AF37]/25 hover:border-[#D4AF37]/70 rounded-sm overflow-hidden bg-[#1A0106] transition-all duration-300 flex flex-col shadow-sm"
                >
                  {/* Photo container */}
                  <div className="relative aspect-[3/4] w-full border-b border-[#D4AF37]/20 bg-black/40">
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      fill 
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover opacity-95 group-hover:opacity-100 transition-opacity" 
                    />

                    {/* New Collection Badge */}
                    <span className="absolute top-2 left-2 bg-[#D4AF37] text-[#210209] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Featured
                    </span>

                    {/* Multiple photos count */}
                    {totalPhotos > 1 && (
                      <span className="absolute bottom-2 left-2 bg-[#210209]/85 backdrop-blur-sm text-[#D4AF37] text-[10px] px-2 py-0.5 rounded-sm border border-[#D4AF37]/30">
                        📷 {totalPhotos} photos
                      </span>
                    )}

                    {/* Quick Action Overlay Buttons */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(product)}
                        className="bg-[#210209]/90 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#210209] p-2 rounded-full border border-[#D4AF37]/40 shadow-md transition-all cursor-pointer"
                        title="Edit product content"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromNewCollection(product)}
                        className="bg-[#210209]/90 hover:bg-amber-600 text-amber-200 p-2 rounded-full border border-amber-500/40 shadow-md transition-all cursor-pointer"
                        title="Remove from New Collection"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(product)}
                        className="bg-red-950/90 hover:bg-red-700 text-red-100 p-2 rounded-full border border-red-500/40 shadow-md transition-all cursor-pointer"
                        title="Permanently Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37]/60 block mb-1">
                        {product.category}
                      </span>
                      <h3 className="text-[#FFF8E7] font-serif text-sm line-clamp-2 leading-snug" title={product.name}>
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-[#D4AF37]/60 text-xs line-clamp-1 italic mt-1 font-light">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mt-2.5 pt-2 border-t border-[#D4AF37]/15">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        {product.original_price || product.discount_price ? (
                          <>
                            <span className="text-white text-sm font-bold">
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
                          <span className="text-[#D4AF37]/50 text-xs">Price on request</span>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-3 pt-2 border-t border-[#D4AF37]/10 flex items-center justify-between gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-[10px] uppercase tracking-wider text-[#D4AF37] hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleRemoveFromNewCollection(product)}
                          className="text-[10px] uppercase tracking-wider text-amber-300/80 hover:text-amber-200 cursor-pointer"
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

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A0106] border border-[#D4AF37]/40 rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <h3 className="font-serif text-xl text-[#D4AF37] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#D4AF37]" /> Edit Product
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-[#D4AF37]/70 hover:text-white p-1 cursor-pointer"
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
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-transparent border border-[#D4AF37]/30 text-[#FFF8E7] focus:border-[#D4AF37] outline-none rounded-sm text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-1.5">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-transparent border border-[#D4AF37]/30 text-[#FFF8E7] focus:border-[#D4AF37] outline-none rounded-sm text-sm"
                    placeholder="e.g. 5999"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-1.5">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={editDiscountPrice}
                    onChange={(e) => setEditDiscountPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-transparent border border-[#D4AF37]/30 text-[#FFF8E7] focus:border-[#D4AF37] outline-none rounded-sm text-sm"
                    placeholder="e.g. 3999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-1.5">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-transparent border border-[#D4AF37]/30 text-[#FFF8E7] focus:border-[#D4AF37] outline-none rounded-sm text-sm"
                  placeholder="e.g. KANCHI PATTU"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-transparent border border-[#D4AF37]/30 text-[#FFF8E7] focus:border-[#D4AF37] outline-none rounded-sm text-sm resize-none"
                  placeholder="Fabric, weave, color details..."
                />
              </div>

              {/* Toggle in New Collection */}
              <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-sm">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsNewCollection}
                    onChange={(e) => setEditIsNewCollection(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37] cursor-pointer rounded"
                  />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold block">
                      Include in New Collection
                    </span>
                    <span className="text-[10px] text-[#D4AF37]/60 block">
                      Uncheck to remove this product from the New Collection showcase without deleting it
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase tracking-wider rounded-sm hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2 bg-[#D4AF37] hover:bg-[#b5952f] text-[#210209] text-xs uppercase tracking-wider font-bold rounded-sm shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isSavingEdit ? (
                    <div className="w-4 h-4 border-2 border-[#210209] border-t-transparent rounded-full animate-spin"></div>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A0106] border border-[#D4AF37]/40 rounded-sm max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div>
                <h3 className="font-serif text-xl text-[#D4AF37]">Add Products to New Collection</h3>
                <p className="text-[10px] text-[#D4AF37]/60 uppercase tracking-widest mt-1">
                  Browse products currently not in the New Collection
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#D4AF37]/70 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingNonCollection ? (
              <div className="flex justify-center p-12">
                <div className="w-7 h-7 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : nonCollectionProducts.length === 0 ? (
              <div className="text-center p-10 border border-[#D4AF37]/20 border-dashed rounded-sm">
                <p className="text-[#D4AF37]/80 text-sm">All uploaded products are already in the New Collection!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-1">
                {nonCollectionProducts.map((prod) => (
                  <div key={prod.id} className="border border-[#D4AF37]/20 rounded-sm overflow-hidden bg-[#210209] flex flex-col justify-between">
                    <div className="relative aspect-[3/4] w-full bg-black/40">
                      <Image src={prod.image_url} alt={prod.name} fill className="object-cover" />
                    </div>
                    <div className="p-2.5">
                      <p className="text-[#FFF8E7] text-xs font-serif truncate">{prod.name}</p>
                      <button
                        onClick={() => handleAddSingleToCollection(prod)}
                        className="mt-2 w-full py-1.5 bg-[#D4AF37] hover:bg-[#b5952f] text-[#210209] text-[10px] uppercase tracking-wider font-bold rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Add to Collection
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#D4AF37]/20">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase tracking-wider rounded-sm hover:bg-white/5 cursor-pointer"
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
