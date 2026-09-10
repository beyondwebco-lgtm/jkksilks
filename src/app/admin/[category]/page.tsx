'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Upload, X, Trash2, Star, Sparkles, Plus, Edit } from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';

interface UploadItem {
  file: File;
  preview: string;
}

export default function AdminCategoryPage() {
  const params = useParams();
  const category = (params?.category as string) || '';
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Form state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [isExploreCollection, setIsExploreCollection] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editDiscountPrice, setEditDiscountPrice] = useState('');
  const [editIsExplore, setEditIsExplore] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editUploadItems, setEditUploadItems] = useState<UploadItem[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const uploadSingleImageToR2 = async (file: File): Promise<string> => {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    if (!res.ok) throw new Error('Failed to get upload URL from server');
    const { uploadUrl, publicUrl } = await res.json();

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error('Failed to upload image to Cloudflare storage');

    return publicUrl;
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadSingleImageToR2(file));
    return await Promise.all(uploadPromises);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditDescription(product.description || '');
    setEditOriginalPrice(product.original_price ? product.original_price.toString() : '');
    setEditDiscountPrice(product.discount_price ? product.discount_price.toString() : '');
    setEditIsExplore(product.is_explore_collection || false);
    setExistingImages(product.image_urls || [product.image_url]);
    setEditUploadItems([]);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    editUploadItems.forEach(item => URL.revokeObjectURL(item.preview));
    setEditUploadItems([]);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingEdit(true);

    try {
      let newlyUploadedUrls: string[] = [];
      if (editUploadItems.length > 0) {
        newlyUploadedUrls = await uploadImages(editUploadItems.map(i => i.file));
      }

      const updatedImageUrls = [...existingImages, ...newlyUploadedUrls];
      if (updatedImageUrls.length === 0) {
        alert('Product must have at least one image.');
        setIsSavingEdit(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .update({
          name: editName,
          description: editDescription,
          image_url: updatedImageUrls[0],
          original_price: editOriginalPrice ? parseFloat(editOriginalPrice) : null,
          discount_price: editDiscountPrice ? parseFloat(editDiscountPrice) : null,
          is_explore_collection: editIsExplore,
          image_urls: updatedImageUrls,
        })
        .eq('id', editingProduct.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setProducts(products.map(p => p.id === editingProduct.id ? data : p));
      closeEditModal();
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to update product');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: UploadItem[] = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setEditUploadItems(prev => [...prev, ...newItems]);
    }
  };

  const removeEditUploadItem = (index: number) => {
    setEditUploadItems(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) {
          setProducts(data || []);
        }
      } catch (err: unknown) {
        console.error('Error fetching products:', err);
        if (isMounted) {
          setFetchError('Unable to fetch products. Ensure Supabase is connected.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [category]);

  // Global paste handler to paste images anywhere on the page
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const newItems: UploadItem[] = [];
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
            const file = e.clipboardData.items[i].getAsFile();
            if (file) {
              newItems.push({
                file,
                preview: URL.createObjectURL(file),
              });
            }
          }
        }
        if (newItems.length > 0) {
          // If the edit modal is open, paste into the edit form instead
          if (editingProduct) {
            setEditUploadItems(prev => [...prev, ...newItems]);
          } else {
            setUploadItems(prev => [...prev, ...newItems]);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [editingProduct]);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to remove "${product.name}"? This will delete the product and permanently remove its images from Cloudflare storage.`)) return;
    
    try {
      // 1. Gather all image URLs associated with this product
      const urlsToDelete: string[] = [];
      if (product.image_url) urlsToDelete.push(product.image_url);
      if (product.image_urls && Array.isArray(product.image_urls)) {
        product.image_urls.forEach(url => {
          if (url && !urlsToDelete.includes(url)) urlsToDelete.push(url);
        });
      }

      // 2. Delete from Cloudflare R2 via our API route
      if (urlsToDelete.length > 0) {
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrls: urlsToDelete }),
        });
      }

      // 3. Delete from Supabase Database
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;

      // 4. Update UI
      setProducts(products.filter(p => p.id !== product.id));
    } catch (err: unknown) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: UploadItem[] = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setUploadItems(prev => [...prev, ...newItems]);
    }
  };

  const removeUploadItem = (index: number) => {
    setUploadItems(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    setUploadItems(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const calculateDiscountPercent = (orig: string, disc: string) => {
    const o = parseFloat(orig);
    const d = parseFloat(disc);
    if (!isNaN(o) && !isNaN(d) && o > d && o > 0) {
      return Math.round(((o - d) / o) * 100);
    }
    return null;
  };

  const discountPercent = calculateDiscountPercent(originalPrice, discountPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadError('');

    try {
      if (!name) throw new Error('Product Name is required.');
      if (uploadItems.length === 0) throw new Error('Please upload at least one image.');

      // 1. Upload all images in parallel
      const uploadPromises = uploadItems.map(item => uploadSingleImageToR2(item.file));
      const uploadedUrls = await Promise.all(uploadPromises);

      const primaryImageUrl = uploadedUrls[0];

      // 2. Save product into Supabase
      const { data, error: dbError } = await supabase
        .from('products')
        .insert({
          name,
          category,
          description: description || null,
          original_price: originalPrice ? parseFloat(originalPrice) : null,
          discount_price: discountPrice ? parseFloat(discountPrice) : null,
          image_url: primaryImageUrl,
          image_urls: uploadedUrls,
          is_explore_collection: isExploreCollection,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Reset form
      setName('');
      setDescription('');
      setOriginalPrice('');
      setDiscountPrice('');
      setIsExploreCollection(false);
      setUploadItems([]);

      setProducts([data, ...products]);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'An error occurred while saving the product.';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="border-b border-[#D4AF37]/20 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-[#D4AF37] capitalize tracking-wide">{category}</h1>
          <p className="text-[#D4AF37]/60 text-xs uppercase tracking-[0.2em] mt-2">Manage & Upload Multiple Photos</p>
        </div>
      </div>

      {/* Upload Form */}
      <section className="bg-[#1A0106] border border-[#D4AF37]/30 p-6 sm:p-8 rounded-sm shadow-[0_0_25px_rgba(212,175,55,0.06)]">
        <h2 className="text-[#D4AF37] font-serif text-xl mb-6 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" /> Upload New {category.slice(0, -1) || category}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {uploadError && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded-sm text-sm">
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Product Info & Pricing */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-2">Product Name *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none rounded-sm placeholder-[#D4AF37]/30"
                  placeholder={`e.g. Midnight Black Silk Saree`}
                />
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-2">Original MRP (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] outline-none rounded-sm placeholder-[#D4AF37]/30"
                    placeholder="e.g. 1999"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-2">Discounted Offer (₹)</label>
                  <input 
                    type="number"
                    min="0"
                    step="1"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] outline-none rounded-sm placeholder-[#D4AF37]/30"
                    placeholder="e.g. 1699"
                  />
                </div>
              </div>

              {/* Price Preview Card matching user reference */}
              {(originalPrice || discountPrice) && (
                <div className="p-3 bg-[#2A050D] border border-[#D4AF37]/20 rounded-sm flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-wider text-[#D4AF37]/60">Customer Price Tag:</span>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-white text-sm font-bold">
                      MRP ₹{discountPrice ? Number(discountPrice).toLocaleString('en-IN') : Number(originalPrice).toLocaleString('en-IN')}
                    </span>
                    {discountPrice && originalPrice && Number(originalPrice) > Number(discountPrice) && (
                      <span className="text-gray-400 line-through text-xs">
                        ₹{Number(originalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="text-[#E57373] text-xs font-bold italic">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] outline-none rounded-sm resize-none placeholder-[#D4AF37]/30 text-sm"
                  placeholder="Fabric, weave details, blouse piece details, zari purity..."
                />
              </div>

              {/* Explore Collection Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isExploreCollection}
                    onChange={(e) => setIsExploreCollection(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37] cursor-pointer rounded"
                  />
                  <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-medium">
                    Feature in &quot;Explore Collection&quot; on Homepage
                  </span>
                </label>
              </div>
            </div>

            {/* Right Column: Multiple Images Upload & Ordering */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80">
                  Product Photos * {uploadItems.length > 0 && `(${uploadItems.length} selected)`}
                </label>
                <span className="text-[10px] text-[#D4AF37]/60 tracking-wider">First photo is Cover</span>
              </div>

              {/* Upload Drop Zone */}
              <label 
                htmlFor="multi-file-upload" 
                className="cursor-pointer w-full h-32 flex flex-col justify-center items-center border border-[#D4AF37]/30 border-dashed rounded-sm hover:border-[#D4AF37] transition-all bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10"
              >
                <Upload className="h-6 w-6 text-[#D4AF37]/70 mb-2" />
                <span className="text-sm font-medium text-[#D4AF37]">Click to select photos (Multiple allowed)</span>
                <span className="text-xs text-[#D4AF37]/60 mt-1">Or paste anywhere with Cmd+V / Ctrl+V</span>
                <input 
                  id="multi-file-upload" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="sr-only" 
                  onChange={handleImageChange} 
                />
              </label>

              {/* Previews & Cover Selection */}
              {uploadItems.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-2 border border-[#D4AF37]/20 rounded-sm bg-[#120104]">
                    {uploadItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`relative aspect-square rounded-sm overflow-hidden border ${
                          idx === 0 ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50' : 'border-[#D4AF37]/30'
                        } group bg-black/40`}
                      >
                        <Image src={item.preview} alt={`Upload ${idx + 1}`} fill className="object-cover" />
                        
                        {/* Cover Badge */}
                        {idx === 0 ? (
                          <div className="absolute top-1 left-1 bg-[#D4AF37] text-[#210209] text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 shadow-md">
                            <Star className="w-2.5 h-2.5 fill-current" /> Cover
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAsCover(idx)}
                            className="absolute bottom-1 inset-x-1 bg-black/80 hover:bg-[#D4AF37] hover:text-[#210209] text-white text-[9px] py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity font-medium text-center"
                            title="Set as Cover Photo"
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Remove button */}
                        <button 
                          type="button"
                          onClick={() => removeUploadItem(idx)}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-red-700 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#D4AF37]/60 italic">
                    Tip: Hover over any photo and click &quot;Set Cover&quot; to make it the primary display image.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#D4AF37]/20">
            <button
              type="submit"
              disabled={isUploading}
              className="px-8 py-3 bg-[#D4AF37] text-[#210209] text-sm uppercase tracking-widest font-bold hover:bg-[#b5952f] disabled:opacity-70 transition-colors rounded-sm min-w-[170px] flex justify-center items-center shadow-lg"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-[#210209] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                `Upload to ${category}`
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Product List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#D4AF37] font-serif text-xl">All {category} ({products.length})</h2>
          <span className="text-xs text-[#D4AF37]/60">Changes reflect instantly on client pages</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : fetchError && products.length === 0 ? (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-sm">
            {fetchError}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-12 border border-[#D4AF37]/20 border-dashed rounded-sm">
            <p className="text-[#D4AF37]/60 text-sm tracking-widest uppercase">No {category} found. Upload your first product above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const pDiscount = calculateDiscountPercent(
                product.original_price ? String(product.original_price) : '',
                product.discount_price ? String(product.discount_price) : ''
              );
              const totalPhotos = (product.image_urls && product.image_urls.length > 0) ? product.image_urls.length : 1;

              return (
                <div key={product.id} className="group border border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] rounded-md overflow-hidden bg-[#1A0106] transition-all duration-300 flex flex-col">
                  {/* Image container */}
                  <div className="relative aspect-[3/4] w-full border-b border-[#D4AF37]/20 bg-black/30">
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      fill 
                      className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                    />

                    {/* Multiple images count badge */}
                    {totalPhotos > 1 && (
                      <span className="absolute bottom-2 left-2 bg-[#210209]/80 backdrop-blur-sm text-[#D4AF37] text-[10px] px-2 py-0.5 rounded-sm border border-[#D4AF37]/30">
                        📷 {totalPhotos} photos
                      </span>
                    )}

                    {/* Explore collection tag */}
                    {product.is_explore_collection && (
                      <span className="absolute top-2 left-2 bg-[#D4AF37] text-[#210209] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-md">
                        Featured
                      </span>
                    )}

                    {/* Actions container */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Edit button */}
                      <button
                        onClick={() => openEditModal(product)}
                        className="bg-[#D4AF37]/90 text-[#210209] p-2 rounded-full hover:bg-[#D4AF37] shadow-lg"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(product)}
                        className="bg-red-900/90 text-red-100 p-2 rounded-full hover:bg-red-700 shadow-lg"
                        title="Delete Product & Storage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[#D4AF37] font-serif text-base mb-1 truncate" title={product.name}>
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-[#D4AF37]/60 text-xs line-clamp-1 italic mb-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing Display */}
                    <div className="mt-2 pt-2 border-t border-[#D4AF37]/10 text-xs">
                      {product.original_price || product.discount_price ? (
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          <span className="text-white font-bold">
                            MRP ₹{product.discount_price ? Number(product.discount_price).toLocaleString('en-IN') : Number(product.original_price).toLocaleString('en-IN')}
                          </span>
                          {product.discount_price && product.original_price && Number(product.original_price) > Number(product.discount_price) && (
                            <span className="text-gray-400 line-through text-[11px]">
                              ₹{Number(product.original_price).toLocaleString('en-IN')}
                            </span>
                          )}
                          {pDiscount && (
                            <span className="text-[#E57373] text-[11px] font-bold italic ml-1">
                              {pDiscount}% OFF
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#D4AF37]/40 text-[11px]">Price on request</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A0106] border border-[#D4AF37] rounded-sm shadow-[0_0_30px_rgba(212,175,55,0.3)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-[#D4AF37]/20">
              <h3 className="text-[#D4AF37] font-serif text-xl">Edit Product</h3>
              <button onClick={closeEditModal} className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-1">Product Name</label>
                <input 
                  type="text" required value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] outline-none rounded-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-1">Original Price (₹)</label>
                  <input 
                    type="number" min="0" step="1" value={editOriginalPrice} onChange={e => setEditOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] outline-none rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-1">Discount Price (₹)</label>
                  <input 
                    type="number" min="0" step="1" value={editDiscountPrice} onChange={e => setEditDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] outline-none rounded-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-1">Description</label>
                <textarea 
                  value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3}
                  className="w-full px-3 py-2 bg-black/30 border border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] outline-none rounded-sm resize-none text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" checked={editIsExplore} onChange={e => setEditIsExplore(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                  <span className="text-xs uppercase tracking-wider text-[#D4AF37]">Feature in &quot;Explore Collection&quot;</span>
                </label>
              </div>

              <div className="pt-2 border-t border-[#D4AF37]/20">
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37]/80 mb-2">Add More Photos</label>
                <div className="flex flex-col gap-3">
                  <label className="cursor-pointer w-full h-20 flex flex-col justify-center items-center border border-[#D4AF37]/30 border-dashed rounded-sm hover:border-[#D4AF37] transition-all bg-[#D4AF37]/5">
                    <Plus className="h-5 w-5 text-[#D4AF37]/70 mb-1" />
                    <span className="text-xs font-medium text-[#D4AF37]">Click to select additional photos</span>
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={handleEditImageChange} />
                  </label>
                  
                  {editUploadItems.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {editUploadItems.map((item, idx) => (
                        <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-[#D4AF37]/30 bg-black/40">
                          <Image src={item.preview} alt={`New upload ${idx}`} fill className="object-cover" />
                          <button type="button" onClick={() => removeEditUploadItem(idx)} className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-700 text-white p-0.5 rounded-full">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-sm text-sm uppercase tracking-wider">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingEdit} className="px-4 py-2 bg-[#D4AF37] text-[#210209] hover:bg-[#b5952f] rounded-sm text-sm uppercase tracking-wider font-bold min-w-[100px] flex justify-center items-center">
                  {isSavingEdit ? <div className="w-4 h-4 border-2 border-[#210209] border-t-transparent rounded-full animate-spin"></div> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
