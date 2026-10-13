'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, Edit, X, Check, Sparkles, Plus, AlertCircle, EyeOff, Upload, Search } from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';

interface UploadItem {
  file: File;
  preview: string;
}

export default function AdminNewCollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editUploadItems, setEditUploadItems] = useState<UploadItem[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Add from catalog modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [nonCollectionProducts, setNonCollectionProducts] = useState<Product[]>([]);
  const [loadingNonCollection, setLoadingNonCollection] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Quick Upload New Saree Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newDiscountPrice, setNewDiscountPrice] = useState('');
  const [newCategory, setNewCategory] = useState('KANCHI PATTU');
  const [newColorSwatchHex, setNewColorSwatchHex] = useState('#D4AF37');
  const [newColorSwatchName, setNewColorSwatchName] = useState('');
  const [newFabricSpec, setNewFabricSpec] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUploadItems, setNewUploadItems] = useState<UploadItem[]>([]);
  const [isUploadingNew, setIsUploadingNew] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  const uploadSingleImageToR2 = async (file: File): Promise<string> => {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    if (!res.ok) throw new Error('Failed to get upload URL');
    const { uploadUrl, publicUrl } = await res.json();

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error('Failed to upload image');

    return publicUrl;
  };

  const handleAddAllToNewCollection = async () => {
    if (!confirm('Add ALL currently uploaded products in the catalog to the New Collection?')) return;
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
    if (!confirm(`Remove "${product.name}" from New Collection? (This will NOT delete the product from the store)`)) return;

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
    if (!confirm(`Permanently delete "${product.name}"? This removes it from the store and permanently deletes photos from storage.`)) return;

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
    setExistingImages(product.image_urls && product.image_urls.length > 0 ? product.image_urls : [product.image_url]);
    setEditUploadItems([]);
    setEditError('');
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    editUploadItems.forEach(i => URL.revokeObjectURL(i.preview));
    setEditUploadItems([]);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: UploadItem[] = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setEditUploadItems(prev => [...prev, ...newItems]);
    }
  };

  const removeExistingImage = async (index: number) => {
    if (!editingProduct) return;
    if (existingImages.length === 1 && editUploadItems.length === 0) {
      alert("A product must have at least one photo.");
      return;
    }
    if (!confirm('This photo will be permanently deleted from Cloudflare storage. Proceed?')) return;

    const urlToDelete = existingImages[index];
    const newImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newImages);

    try {
      await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: [urlToDelete] }),
      });
      await supabase.from('products').update({
        image_url: newImages[0] || '',
        image_urls: newImages
      }).eq('id', editingProduct.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingEdit(true);
    setEditError('');

    try {
      let newlyUploadedUrls: string[] = [];
      if (editUploadItems.length > 0) {
        newlyUploadedUrls = await Promise.all(
          editUploadItems.map(item => uploadSingleImageToR2(item.file))
        );
      }

      const allImages = [...existingImages, ...newlyUploadedUrls];
      if (allImages.length === 0) {
        throw new Error('Product must have at least one image.');
      }

      const descJson = JSON.stringify({
        text: editDescription || '',
        colorName: editColorSwatchName || '',
        colorHex: editColorSwatchHex || '#D4AF37',
        fabricSpec: editFabricSpec || ''
      });

      const updatedFields = {
        name: editName,
        description: descJson,
        image_url: allImages[0],
        image_urls: allImages,
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

      closeEditModal();
    } catch (err: unknown) {
      console.error('Error saving edits:', err);
      const msg = err instanceof Error ? err.message : 'Failed to save edits.';
      setEditError(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleUploadNewSaree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newUploadItems.length === 0) {
      setUploadError('Please provide a saree name and at least one image.');
      return;
    }
    setIsUploadingNew(true);
    setUploadError('');

    try {
      const uploadedUrls = await Promise.all(
        newUploadItems.map(item => uploadSingleImageToR2(item.file))
      );

      const descJson = JSON.stringify({
        text: newDescription || '',
        colorName: newColorSwatchName || '',
        colorHex: newColorSwatchHex || '#D4AF37',
        fabricSpec: newFabricSpec || ''
      });

      const newProductPayload = {
        name: newName,
        description: descJson,
        image_url: uploadedUrls[0],
        image_urls: uploadedUrls,
        original_price: newOriginalPrice ? parseFloat(newOriginalPrice) : null,
        discount_price: newDiscountPrice ? parseFloat(newDiscountPrice) : null,
        category: newCategory || 'KANCHI PATTU',
        is_explore_collection: true,
      };

      const { data, error } = await supabase
        .from('products')
        .insert(newProductPayload)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data, ...prev]);
      setShowUploadModal(false);
      setNewName('');
      setNewOriginalPrice('');
      setNewDiscountPrice('');
      setNewDescription('');
      setNewFabricSpec('');
      newUploadItems.forEach(i => URL.revokeObjectURL(i.preview));
      setNewUploadItems([]);
      alert('Saree uploaded and added to New Collection successfully!');
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to upload saree.';
      setUploadError(msg);
    } finally {
      setIsUploadingNew(false);
    }
  };

  const calculateDiscountPercent = (orig?: number | null, disc?: number | null) => {
    if (orig && disc && orig > disc && orig > 0) {
      return Math.round(((orig - disc) / orig) * 100);
    }
    return null;
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner matching Admin theme */}
      <div className="border-b border-[#8A5A19]/20 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#1F3324] tracking-wide">
            New Collection Management
          </h1>
          <p className="text-[#1F3324]/70 font-semibold text-xs uppercase tracking-[0.2em] mt-1.5">
            Active New Collection Sarees ({products.length} products total)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#1F3324] hover:bg-[#8A5A19] text-[#EBD4C9] rounded-sm text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Upload className="w-3.5 h-3.5" /> Upload New
          </button>

          <button
            onClick={() => {
              setShowAddModal(true);
              fetchNonCollectionProducts();
            }}
            className="px-4 py-2 bg-white/70 hover:bg-white text-[#1F3324] border border-[#8A5A19]/40 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#8A5A19]" /> Add From Catalog
          </button>

          <button
            onClick={handleAddAllToNewCollection}
            disabled={isAddingAll}
            className="px-4 py-2 bg-white/70 hover:bg-white text-[#1F3324] border border-[#8A5A19]/40 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-60"
          >
            {isAddingAll ? (
              <div className="w-3.5 h-3.5 border-2 border-[#8A5A19] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#8A5A19]" />
            )}
            Add All Catalog
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white/50 border border-[#8A5A19]/20 p-2.5 rounded-sm">
        <Search className="w-4 h-4 text-[#8A5A19]/70 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by saree name or category..."
          className="bg-transparent border-none outline-none text-xs text-[#1F3324] w-full placeholder-[#1F3324]/40"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-[#1F3324]/50 hover:text-[#1F3324] text-xs px-2">
            Clear
          </button>
        )}
      </div>

      {/* Product List Grid */}
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-16 border border-[#8A5A19]/20 border-dashed rounded-sm bg-white/40">
            <Sparkles className="w-10 h-10 text-[#8A5A19]/50 mx-auto mb-3" />
            <p className="text-[#1F3324] text-base font-serif mb-2">
              {searchQuery ? 'No matching products found.' : 'No products in New Collection yet'}
            </p>
            <p className="text-[#1F3324]/70 text-xs uppercase tracking-wider mb-5 max-w-md mx-auto">
              Click &quot;Add All Catalog&quot; to include everything immediately, or &quot;Upload New&quot; to add an exclusive weave.
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddAllToNewCollection}
                className="px-6 py-2.5 bg-[#1F3324] text-[#EBD4C9] text-xs uppercase tracking-widest font-bold rounded-sm shadow-md hover:bg-[#8A5A19] transition-all cursor-pointer"
              >
                Add All Catalog Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const discount = calculateDiscountPercent(product.original_price, product.discount_price);
              const totalPhotos = (product.image_urls && product.image_urls.length > 0) ? product.image_urls.length : 1;

              return (
                <div 
                  key={product.id} 
                  className="group border border-[#8A5A19]/40 shadow-[0_4px_15px_rgba(138,90,25,0.1)] hover:border-[#8A5A19] hover:shadow-[0_4px_20px_rgba(138,90,25,0.2)] rounded-sm overflow-hidden bg-white/60 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Photo container */}
                    <div className="relative aspect-[3/4] w-full border-b border-[#8A5A19]/20 bg-[#EAE3D9]/40">
                      <Image 
                        src={product.image_url} 
                        alt={product.name} 
                        fill 
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover opacity-95 group-hover:opacity-100 transition-opacity" 
                      />

                      {/* Multiple photos count */}
                      {totalPhotos > 1 && (
                        <span className="absolute bottom-2 left-2 bg-[#EAE3D9]/90 backdrop-blur-sm text-[#1F3324] text-[10px] px-2 py-0.5 rounded-xs border border-[#8A5A19]/30 font-medium">
                          📷 {totalPhotos}
                        </span>
                      )}

                      {/* Quick Edit button hover */}
                      <button
                        onClick={() => openEditModal(product)}
                        className="absolute top-2 right-2 bg-[#1F3324]/90 hover:bg-[#1F3324] text-[#EBD4C9] p-1.5 rounded-sm shadow-md transition-all cursor-pointer"
                        title="Edit saree details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content metadata */}
                    <div className="p-3 text-left">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#8A5A19] font-bold block mb-1 truncate">
                        {product.category}
                      </span>
                      <h3 className="text-[#1F3324] font-serif text-sm font-semibold line-clamp-2 leading-snug" title={product.name}>
                        {product.name}
                      </h3>

                      {/* Pricing */}
                      <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                        {product.original_price || product.discount_price ? (
                          <>
                            <span className="text-[#1F3324] text-sm font-bold">
                              ₹{product.discount_price ? Number(product.discount_price).toLocaleString('en-IN') : Number(product.original_price).toLocaleString('en-IN')}
                            </span>
                            {product.discount_price && product.original_price && Number(product.original_price) > Number(product.discount_price) && (
                              <span className="text-[#1F3324]/40 line-through text-[10px]">
                                ₹{Number(product.original_price).toLocaleString('en-IN')}
                              </span>
                            )}
                            {discount && (
                              <span className="text-[#8A5A19] text-[10px] font-bold ml-0.5">
                                {discount}% OFF
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[#1F3324]/50 text-xs">Price on request</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-3 pt-0 border-t border-[#8A5A19]/10 mt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-[11px] uppercase tracking-wider text-[#1F3324] hover:text-[#8A5A19] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveFromNewCollection(product)}
                        className="text-[10px] uppercase tracking-wider text-amber-900 hover:underline cursor-pointer"
                        title="Remove from New Collection"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(product)}
                        className="text-[10px] uppercase tracking-wider text-red-600 hover:text-red-800 cursor-pointer"
                        title="Permanently Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* EDIT MODAL with full field & photo management */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#EAE3D9] border border-[#8A5A19] rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#8A5A19]/20 pb-3">
              <h3 className="font-serif text-xl text-[#1F3324] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#8A5A19]" /> Edit Product Details
              </h3>
              <button onClick={closeEditModal} className="text-[#1F3324] hover:text-[#8A5A19] p-1 cursor-pointer">
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
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Saree Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                    placeholder="e.g. 5999"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={editDiscountPrice}
                    onChange={(e) => setEditDiscountPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                    placeholder="e.g. 3999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                />
              </div>

              {/* Color Swatch & Fabric Spec */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Color Swatch</label>
                  <div className="flex bg-white/70 border border-[#8A5A19]/30 rounded-sm overflow-hidden h-[38px]">
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
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Fabric Spec</label>
                  <input 
                    type="text"
                    value={editFabricSpec}
                    onChange={(e) => setEditFabricSpec(e.target.value)}
                    placeholder="e.g. Pure Silk"
                    className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Craft Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm resize-none"
                  placeholder="Fabric, weave, border and pallu details..."
                />
              </div>

              {/* Photo Management Section */}
              <div className="p-3 bg-white/40 border border-[#8A5A19]/20 rounded-sm space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold">Product Photos</label>
                
                {/* Existing Photos */}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-[#8A5A19]/30 group">
                        <Image src={url} alt={`Photo ${idx}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1 right-1 bg-white/80 hover:bg-red-600 hover:text-white text-[#1F3324] p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-[#1F3324] text-[#EBD4C9] text-[8px] px-1 rounded-xs">Cover</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload New Additional Photos */}
                <label className="cursor-pointer w-full py-2 flex items-center justify-center gap-2 border border-[#8A5A19]/30 border-dashed rounded-sm hover:border-[#8A5A19] bg-white/50 text-[#1F3324] text-xs font-semibold">
                  <Plus className="w-4 h-4 text-[#8A5A19]" /> Add Photos
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={handleEditImageSelect} />
                </label>

                {editUploadItems.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {editUploadItems.map((item, idx) => (
                      <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-[#8A5A19]/40">
                        <Image src={item.preview} alt={`Upload ${idx}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(item.preview);
                            setEditUploadItems(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Include in New Collection Toggle */}
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
                      Uncheck to remove from New Collection without deleting from store
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#8A5A19]/20">
                <button
                  type="button"
                  onClick={closeEditModal}
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

      {/* UPLOAD BRAND NEW SAREE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#EAE3D9] border border-[#8A5A19] rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#8A5A19]/20 pb-3">
              <h3 className="font-serif text-xl text-[#1F3324] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#8A5A19]" /> Upload New Saree
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#1F3324] hover:text-[#8A5A19] p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded-sm text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadNewSaree} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Saree Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Kanchipuram Pure Silk Gold Zari"
                  className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    placeholder="e.g. 5999"
                    className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={newDiscountPrice}
                    onChange={(e) => setNewDiscountPrice(e.target.value)}
                    placeholder="e.g. 3999"
                    className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Color Swatch</label>
                  <div className="flex bg-white/70 border border-[#8A5A19]/30 rounded-sm overflow-hidden h-[38px]">
                    <input 
                      type="color"
                      value={newColorSwatchHex}
                      onChange={(e) => setNewColorSwatchHex(e.target.value)}
                      className="h-full w-12 cursor-pointer border-none p-0 outline-none bg-transparent"
                    />
                    <input 
                      type="text"
                      value={newColorSwatchName}
                      onChange={(e) => setNewColorSwatchName(e.target.value)}
                      placeholder="Color"
                      className="flex-1 px-2.5 bg-transparent text-[#1F3324] text-xs outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Fabric</label>
                  <input 
                    type="text"
                    value={newFabricSpec}
                    onChange={(e) => setNewFabricSpec(e.target.value)}
                    placeholder="e.g. Pure Silk"
                    className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Craft story, weave details..."
                  className="w-full px-3.5 py-2 bg-white/70 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm text-sm resize-none"
                />
              </div>

              {/* Photos upload input */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Saree Photos *</label>
                <label className="cursor-pointer w-full py-4 flex flex-col items-center justify-center border border-[#8A5A19]/40 border-dashed rounded-sm bg-white/50 hover:bg-white/80 transition-all">
                  <Upload className="w-5 h-5 text-[#8A5A19] mb-1" />
                  <span className="text-xs text-[#1F3324] font-semibold">Click to select photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const items: UploadItem[] = Array.from(e.target.files).map(file => ({
                          file,
                          preview: URL.createObjectURL(file),
                        }));
                        setNewUploadItems(prev => [...prev, ...items]);
                      }
                    }}
                  />
                </label>

                {newUploadItems.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {newUploadItems.map((item, idx) => (
                      <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-[#8A5A19]/30">
                        <Image src={item.preview} alt={`Upload ${idx}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(item.preview);
                            setNewUploadItems(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#8A5A19]/20">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-[#8A5A19]/30 text-[#1F3324] text-xs uppercase tracking-wider rounded-sm hover:bg-white/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingNew}
                  className="px-6 py-2 bg-[#1F3324] hover:bg-[#8A5A19] text-[#EBD4C9] text-xs uppercase tracking-wider font-bold rounded-sm shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isUploadingNew ? (
                    <div className="w-4 h-4 border-2 border-[#EBD4C9] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Upload & Add
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
                <h3 className="font-serif text-xl text-[#1F3324]">Add Products From Catalog</h3>
                <p className="text-[10px] text-[#1F3324]/70 uppercase tracking-widest mt-0.5">
                  Browse products currently not in New Collection
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#1F3324] hover:text-[#8A5A19] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Catalog search filter */}
            <div className="bg-white/50 border border-[#8A5A19]/20 p-2 rounded-sm flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#8A5A19]/60 ml-1" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search catalog..."
                className="bg-transparent border-none outline-none text-xs text-[#1F3324] w-full"
              />
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
                {nonCollectionProducts
                  .filter(prod => !catalogSearch.trim() || (prod.name && prod.name.toLowerCase().includes(catalogSearch.toLowerCase())))
                  .map((prod) => (
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
