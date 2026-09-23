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
  const [categorySelect, setCategorySelect] = useState(category);
  const [colorSwatchHex, setColorSwatchHex] = useState('#D4AF37');
  const [colorSwatchName, setColorSwatchName] = useState('');
  const [fabricSpec, setFabricSpec] = useState('');
  const [weavingCraft, setWeavingCraft] = useState('');
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColorSwatchHex, setEditColorSwatchHex] = useState('#D4AF37');
  const [editColorSwatchName, setEditColorSwatchName] = useState('');
  const [editFabricSpec, setEditFabricSpec] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editDiscountPrice, setEditDiscountPrice] = useState('');
  const [editIsExplore, setEditIsExplore] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editUploadItems, setEditUploadItems] = useState<UploadItem[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Subcategories state
  type SubCategory = { id: string; name: string; description?: string; coverImage?: string; count: number; section: string };
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [newSubCatName, setNewSubCatName] = useState('');
  const [newSubCatDesc, setNewSubCatDesc] = useState('');
  const [newSubCatCover, setNewSubCatCover] = useState('');
  const [newSubCatUpload, setNewSubCatUpload] = useState<UploadItem | null>(null);
  const [isSavingSubCat, setIsSavingSubCat] = useState(false);
  const [editingSubCatId, setEditingSubCatId] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'details' | 'products'>('details');

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
    
    let parsedDesc = { text: product.description || '', colorName: '', colorHex: '#D4AF37', fabricSpec: '' };
    try {
      if (product.description && product.description.trim().startsWith('{')) {
        parsedDesc = { ...parsedDesc, ...JSON.parse(product.description) };
      }
    } catch (e) {}

    setEditDescription(parsedDesc.text);
    setEditColorSwatchName(parsedDesc.colorName);
    setEditColorSwatchHex(parsedDesc.colorHex);
    setEditFabricSpec(parsedDesc.fabricSpec);
    
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

      const descJson = JSON.stringify({
        text: editDescription || '',
        colorName: editColorSwatchName || '',
        colorHex: editColorSwatchHex || '#D4AF37',
        fabricSpec: editFabricSpec || ''
      });

      const { data, error } = await supabase
        .from('products')
        .update({
          name: editName,
          description: descJson,
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

  const removeExistingImage = async (index: number) => {
    if (!editingProduct) return;
    
    if (existingImages.length === 1) {
      alert("You cannot delete the only photo. Please upload a new photo first, or delete the entire product.");
      return;
    }

    if (!confirm('This photo will be permanently deleted from Cloudflare R2 immediately. Are you sure?')) {
      return;
    }

    const urlToDelete = existingImages[index];
    const newImages = existingImages.filter((_, i) => i !== index);
    
    // Update UI immediately
    setExistingImages(newImages);

    try {
      // 1. Delete from R2
      await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: [urlToDelete] }),
      });

      // 2. Update Supabase
      await supabase
        .from('products')
        .update({
          image_url: newImages[0],
          image_urls: newImages
        })
        .eq('id', editingProduct.id);
        
      // Update the main products grid in background so it matches if modal is closed
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, image_url: newImages[0], image_urls: newImages } : p));
    } catch (err) {
      console.error(err);
      alert('Failed to delete image from storage.');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Fetch Category details
        const categoryNamesToQuery: string[] = [category];

        // Fetch Subcategories first to populate category dropdown and build query list
        const res = await fetch('/api/categories');
        if (res.ok) {
          const allCategories = await res.json();
          const sectionCategories = allCategories.filter((c: SubCategory) => c.section === category);
          if (isMounted) {
            setSubcategories(sectionCategories);
            if (sectionCategories.length > 0 && categorySelect === category) {
              setCategorySelect(sectionCategories[0].name);
            }
          }
          
          // Add all subcategory names to the query list
          sectionCategories.forEach((c: SubCategory) => {
            if (!categoryNamesToQuery.includes(c.name)) {
              categoryNamesToQuery.push(c.name);
            }
          });
        }

        // Fetch Products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('category', categoryNamesToQuery)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) {
          setProducts(data || []);
        }
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setFetchError('Unable to fetch data. Ensure Supabase is connected.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

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



  const handleSubCatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setNewSubCatUpload({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (activeTab === 'details' && e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          setNewSubCatUpload({
            file,
            preview: URL.createObjectURL(file),
          });
        }
      }
    };
    
    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [activeTab]);

  const removeSubCatUploadItem = () => {
    if (newSubCatUpload) {
      URL.revokeObjectURL(newSubCatUpload.preview);
    }
    setNewSubCatUpload(null);
  };

  const handleSaveSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCatName) return;
    setIsSavingSubCat(true);

    try {
      let finalCoverImageUrl = newSubCatCover;
      
      let oldCoverImageUrl = '';
      if (editingSubCatId) {
        const oldCat = subcategories.find(c => c.id === editingSubCatId);
        if (oldCat) {
          oldCoverImageUrl = oldCat.coverImage || '';
        }
      }

      // Upload new cover image if selected
      if (newSubCatUpload) {
        finalCoverImageUrl = await uploadSingleImageToR2(newSubCatUpload.file);
      }

      const method = editingSubCatId ? 'PUT' : 'POST';
      const body = editingSubCatId ? {
        id: editingSubCatId,
        name: newSubCatName,
        section: category,
        description: newSubCatDesc,
        coverImage: finalCoverImageUrl
      } : {
        name: newSubCatName,
        section: category,
        description: newSubCatDesc,
        coverImage: finalCoverImageUrl
      };

      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save category');
      
      const savedCat = await res.json();
      
      if (editingSubCatId) {
        setSubcategories(prev => prev.map(c => c.id === editingSubCatId ? { ...c, ...savedCat } : c));
        
        // If an old image existed and a new one was uploaded successfully, delete the old one
        if (oldCoverImageUrl && newSubCatUpload && oldCoverImageUrl !== finalCoverImageUrl) {
          fetch('/api/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrls: [oldCoverImageUrl] })
          }).catch(console.error);
        }
      } else {
        setSubcategories(prev => [...prev, savedCat]);
        if (subcategories.length === 0) setCategorySelect(savedCat.name);
      }
      
      setNewSubCatName('');
      setNewSubCatDesc('');
      setNewSubCatCover('');
      setEditingSubCatId(null);
      if (newSubCatUpload) {
        URL.revokeObjectURL(newSubCatUpload.preview);
        setNewSubCatUpload(null);
      }
      alert('Category saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save category.');
    } finally {
      setIsSavingSubCat(false);
    }
  };

  const handleDeleteSubCategory = async (id: string, coverImage?: string) => {
    if (!confirm('Are you sure you want to delete this category? Its cover image will also be permanently deleted from Cloudflare.')) return;
    try {
      if (coverImage) {
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrls: [coverImage] })
        });
      }

      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      setSubcategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete category.');
    }
  };

  const startEditingSubCat = (cat: SubCategory) => {
    setEditingSubCatId(cat.id);
    setNewSubCatName(cat.name);
    setNewSubCatDesc(cat.description || '');
    setNewSubCatCover(cat.coverImage || '');
    setNewSubCatUpload(null);
  };

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

      const descJson = JSON.stringify({
        text: description || '',
        colorName: colorSwatchName || '',
        colorHex: colorSwatchHex || '#D4AF37',
        fabricSpec: fabricSpec || ''
      });

      // 2. Save product into Supabase
      const { data, error: dbError } = await supabase
        .from('products')
        .insert({
          name,
          category: categorySelect,
          description: descJson,
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
      <div className="border-b border-[#8A5A19]/20 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-[#1F3324] capitalize tracking-wide">{category}</h1>
          <p className="text-[#1F3324] font-semibold text-xs uppercase tracking-[0.2em] mt-2">Manage & Upload Multiple Photos</p>
        </div>
      </div>
      <div className="flex gap-4 border-b border-[#8A5A19]/20 pb-1 mb-8">
        <button 
          onClick={() => setActiveTab('details')}
          className={`px-6 py-2 text-xs font-semibold tracking-widest uppercase transition-all border-b-2 ${activeTab === 'details' ? 'border-[#8A5A19] text-[#1F3324]' : 'border-transparent text-[#1F3324] font-semibold hover:text-[#1F3324] font-semibold'}`}
        >
          Manage Categories
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 text-xs font-semibold tracking-widest uppercase transition-all border-b-2 ${activeTab === 'products' ? 'border-[#8A5A19] text-[#1F3324]' : 'border-transparent text-[#1F3324] font-semibold hover:text-[#1F3324] font-semibold'}`}
        >
          Manage Inventory
        </button>
      </div>

      {activeTab === 'details' && (
      <section className="bg-[#EAE3D9]/60 border border-[#8A5A19]/30 p-6 sm:p-8 rounded-sm shadow-[0_4px_25px_rgba(138,90,25,0.08)] space-y-8">
        <div>
          <h2 className="text-[#1F3324] font-serif text-xl mb-6 flex items-center gap-3">
            <Edit className="w-5 h-5 text-[#1F3324]" /> Manage Subcategories
          </h2>
          
          {subcategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subcategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-4 bg-white/40 p-3 border border-[#8A5A19]/20 rounded-sm">
                  <div className="relative w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 bg-white/60 border border-[#8A5A19]/30">
                    {cat.coverImage ? (
                      <Image src={cat.coverImage} alt={cat.name} fill className="object-cover" />
                    ) : (
                      <Image src="/images/logo.jpg" alt="Default" fill className="object-cover opacity-20 grayscale" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#1F3324] font-semibold text-sm capitalize">{cat.name}</h4>
                    <p className="text-[#1F3324] font-semibold text-[10px] line-clamp-1 mt-0.5">{cat.description || 'No description'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditingSubCat(cat)} className="p-2 text-[#1F3324] font-semibold hover:text-[#1F3324] hover:bg-[#1F3324]/10 rounded-sm" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteSubCategory(cat.id, cat.coverImage)} className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-900/20 rounded-sm" title="Delete">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#1F3324] font-semibold text-sm">No categories added yet. Add one below.</p>
          )}
        </div>

        <div className="pt-8 border-t border-[#8A5A19]/20">
          <h3 className="text-[#1F3324] font-serif text-lg mb-6">
            {editingSubCatId ? 'Edit Subcategory' : 'Add New Subcategory'}
          </h3>
          <form onSubmit={handleSaveSubCategory} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Category Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newSubCatName}
                    onChange={(e) => setNewSubCatName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm text-sm"
                    placeholder="e.g. Cotton, Kanjeevaram"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Category Description</label>
                  <textarea 
                    value={newSubCatDesc}
                    onChange={(e) => setNewSubCatDesc(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm resize-none placeholder-[#1F3324]/30 text-sm"
                    placeholder={`Describe the category...`}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold">Cover Photo</label>
                
                <div className="flex gap-4 items-start">
                  <div className="relative aspect-square w-32 rounded-sm overflow-hidden border border-[#8A5A19]/30 bg-white/40 flex-shrink-0">
                    {(newSubCatUpload?.preview || newSubCatCover) ? (
                      <Image src={newSubCatUpload?.preview || newSubCatCover} alt="Cover" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#1F3324] font-semibold">
                        <Image src="/images/logo.jpg" alt="Default" fill className="object-cover opacity-20 grayscale" />
                        <span className="text-[10px] uppercase z-10 mt-2">No Cover</span>
                      </div>
                    )}
                    {newSubCatUpload && (
                      <button
                        type="button"
                        onClick={removeSubCatUploadItem}
                        className="absolute top-1 right-1 bg-white/60 hover:bg-red-500 text-[#1F3324] text-[9px] p-1 rounded-sm shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <label 
                      htmlFor="subcategory-cover-upload" 
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('subcategory-cover-upload')?.click(); }}
                      className="cursor-pointer inline-flex flex-col items-center justify-center w-full px-4 py-4 border border-[#8A5A19]/30 border-dashed rounded-sm hover:border-[#8A5A19] transition-all bg-[#1F3324]/5 hover:bg-[#1F3324]/10 focus:outline-none focus:border-[#8A5A19]/60"
                    >
                      <div className="flex items-center mb-1">
                        <Upload className="h-4 w-4 text-[#1F3324] font-semibold mr-2" />
                        <span className="text-xs font-medium text-[#1F3324]">Click to Upload</span>
                      </div>
                      <span className="text-[10px] text-[#1F3324] font-semibold">(Or click and Cmd+V to paste)</span>
                      <input 
                        id="subcategory-cover-upload" 
                        type="file" 
                        accept="image/*" 
                        className="sr-only" 
                        onChange={handleSubCatImageChange} 
                      />
                    </label>

                    <input 
                      type="text" 
                      value={newSubCatUpload ? '' : newSubCatCover} 
                      onChange={(e) => { setNewSubCatCover(e.target.value); setNewSubCatUpload(null); }}
                      placeholder="Or paste an image URL..." 
                      className="w-full px-3 py-2 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm text-xs placeholder-[#1F3324]/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#8A5A19]/20 gap-4">
              {editingSubCatId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubCatId(null);
                    setNewSubCatName('');
                    setNewSubCatDesc('');
                    setNewSubCatCover('');
                    setNewSubCatUpload(null);
                  }}
                  className="px-6 py-2.5 rounded-sm font-semibold text-xs tracking-widest uppercase transition-all text-[#1F3324] hover:bg-[#1F3324]/10 border border-[#8A5A19]/30"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                disabled={isSavingSubCat}
                className="bg-[#1F3324] hover:bg-[#8A5A19] text-[#EBD4C9] px-8 py-2.5 rounded-sm font-semibold text-xs tracking-widest uppercase transition-all shadow-[0_4px_15px_rgba(138,90,25,0.15)] disabled:opacity-50"
              >
                {isSavingSubCat ? 'Saving...' : (editingSubCatId ? 'Update Subcategory' : 'Add Subcategory')}
              </button>
            </div>
          </form>
        </div>
      </section>
      )}
      {activeTab === 'products' && (
        <div className="space-y-12">
          {/* Upload Form */}
          <section className="bg-[#EAE3D9]/60 border border-[#8A5A19]/30 p-6 sm:p-8 rounded-sm shadow-[0_4px_25px_rgba(138,90,25,0.08)]">
        <h2 className="text-[#1F3324] font-serif text-xl mb-6 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#1F3324]" /> Upload New {category.slice(0, -1) || category}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {uploadError && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded-sm text-sm">
              {uploadError}
            </div>
          )}

          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1 */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Saree Title *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm placeholder-[#1F3324]/30 text-sm"
                  placeholder="e.g. Mulberry Silk Handloom Saree"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Category *</label>
                <select 
                  value={categorySelect}
                  onChange={(e) => setCategorySelect(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm text-sm appearance-none capitalize"
                >
                  {subcategories.length > 0 ? (
                    subcategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))
                  ) : (
                    <option value={category}>{category}</option>
                  )}
                </select>
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Sale Price (₹) *</label>
                <input 
                  type="number" 
                  required
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm placeholder-[#1F3324]/30 text-sm"
                  placeholder="e.g. 8999"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Original MRP (₹)</label>
                <input 
                  type="number" 
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm placeholder-[#1F3324]/30 text-sm"
                  placeholder="e.g. 12499"
                />
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Color Palette Swatch *</label>
                <div className="flex bg-white/40 border border-[#8A5A19]/20 rounded-sm focus-within:border-[#8A5A19]/60 overflow-hidden h-[42px]">
                  <input 
                    type="color"
                    value={colorSwatchHex}
                    onChange={(e) => setColorSwatchHex(e.target.value)}
                    className="h-full w-12 cursor-pointer border-none p-0 outline-none bg-transparent"
                  />
                  <input 
                    type="text"
                    value={colorSwatchName}
                    onChange={(e) => setColorSwatchName(e.target.value)}
                    placeholder="e.g. Royal Gold"
                    className="flex-1 px-3 bg-transparent text-[#1F3324] text-sm outline-none placeholder-[#1F3324]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Fabric Specification</label>
                <input 
                  type="text" 
                  value={fabricSpec}
                  onChange={(e) => setFabricSpec(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm placeholder-[#1F3324]/30 text-sm"
                  placeholder="e.g. 100% Pure Mulberry Silk"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Weaving Craft</label>
              <input 
                type="text" 
                value={weavingCraft}
                onChange={(e) => setWeavingCraft(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2.5 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm placeholder-[#1F3324]/30 text-sm"
                placeholder="e.g. Kanjivaram Antique Gold Zari Brocade"
              />
            </div>

            {/* Photo Upload Section matching screenshot */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#1F3324] font-semibold">
                <Upload className="w-4 h-4" />
                <span>Multi-Photo Cloudflare R2 Upload (Browse, Drag & Drop, or Paste `Ctrl+V` / `Cmd+V`) *</span>
              </div>

              {/* Upload Drop Zone */}
              <label 
                htmlFor="multi-file-upload" 
                className="cursor-pointer w-full h-32 flex flex-col justify-center items-center border border-[#8A5A19]/30 border-dashed rounded-sm hover:border-[#8A5A19] transition-all bg-[#1F3324]/5 hover:bg-[#1F3324]/10"
              >
                <Upload className="h-6 w-6 text-[#1F3324] font-semibold mb-2" />
                <span className="text-sm font-medium text-[#1F3324]">Click to select photos (Multiple allowed)</span>
                <span className="text-xs text-[#1F3324] font-semibold mt-1">Or paste anywhere with Cmd+V / Ctrl+V</span>
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
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-2 border border-[#8A5A19]/20 rounded-sm bg-[#120104]">
                    {uploadItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`relative aspect-square rounded-sm overflow-hidden border ${
                          idx === 0 ? 'border-[#8A5A19] ring-2 ring-[#D4AF37]/50' : 'border-[#8A5A19]/30'
                        } group bg-white/40`}
                      >
                        <Image src={item.preview} alt={`Upload ${idx + 1}`} fill className="object-cover" />
                        
                        {/* Cover Badge */}
                        {idx === 0 ? (
                          <div className="absolute top-1 left-1 bg-[#1F3324] text-[#EBD4C9] text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 shadow-md">
                            <Star className="w-2.5 h-2.5 fill-current" /> Cover
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAsCover(idx)}
                            className="absolute top-1 left-1 bg-white/60 hover:bg-[#1F3324] text-[#1F3324] hover:text-[#EBD4C9] text-[9px] font-medium px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-all shadow-md"
                          >
                            Make Cover
                          </button>
                        )}

                        {/* Remove button */}
                        <button 
                          type="button"
                          onClick={() => removeUploadItem(idx)}
                          className="absolute top-1 right-1 bg-white/60 hover:bg-red-500 text-[#1F3324] text-[9px] p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-all shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Craft Story Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm resize-none placeholder-[#1F3324]/30 text-sm"
                placeholder="Share the history and craft details of this piece..."
              />
            </div>

            {uploadItems.length > 0 && (
              <p className="text-[10px] text-[#1F3324] font-semibold italic">
                Tip: Hover over any photo and click &quot;Set Cover&quot; to make it the primary display image.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-[#8A5A19]/20">
            <button
              type="submit"
              disabled={isUploading}
              className="px-8 py-3 bg-[#1F3324] text-[#EBD4C9] text-sm uppercase tracking-widest font-bold hover:bg-[#b5952f] disabled:opacity-70 transition-colors rounded-sm min-w-[170px] flex justify-center items-center shadow-lg"
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
          <h2 className="text-[#1F3324] font-serif text-xl">All {category} ({products.length})</h2>
          <span className="text-xs text-[#1F3324] font-semibold">Changes reflect instantly on client pages</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-[#8A5A19] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : fetchError && products.length === 0 ? (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-sm">
            {fetchError}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-12 border border-[#8A5A19]/20 border-dashed rounded-sm">
            <p className="text-[#1F3324] font-semibold text-sm tracking-widest uppercase">No {category} found. Upload your first product above!</p>
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
                <div key={product.id} className="group border border-[#8A5A19] shadow-[0_4px_15px_rgba(138,90,25,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] rounded-md overflow-hidden bg-[#EAE3D9]/60 transition-all duration-300 flex flex-col">
                  {/* Image container */}
                  <div className="relative aspect-[3/4] w-full border-b border-[#8A5A19]/20 bg-white/30">
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      fill 
                      className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                    />

                    {/* Multiple images count badge */}
                    {totalPhotos > 1 && (
                      <span className="absolute bottom-2 left-2 bg-[#EAE3D9]/80 backdrop-blur-sm text-[#1F3324] text-[10px] px-2 py-0.5 rounded-sm border border-[#8A5A19]/30">
                        📷 {totalPhotos} photos
                      </span>
                    )}

                    {/* Explore collection tag */}
                    {product.is_explore_collection && (
                      <span className="absolute top-2 left-2 bg-[#1F3324] text-[#EBD4C9] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-md">
                        Featured
                      </span>
                    )}

                    {/* Actions container */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Edit button */}
                      <button
                        onClick={() => openEditModal(product)}
                        className="bg-[#1F3324]/90 text-[#EBD4C9] p-2 rounded-full hover:bg-[#1F3324] shadow-lg"
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
                      <h3 className="text-[#1F3324] font-serif text-base mb-1 truncate" title={product.name}>
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-[#1F3324] font-semibold text-xs line-clamp-1 italic mb-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing Display */}
                    <div className="mt-2 pt-2 border-t border-[#8A5A19]/10 text-xs">
                      {product.original_price || product.discount_price ? (
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          <span className="text-[#1F3324] font-bold">
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
                        <span className="text-[#1F3324] font-semibold text-[11px]">Price on request</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="bg-[#EAE3D9]/60 border border-[#8A5A19] rounded-sm shadow-[0_0_30px_rgba(212,175,55,0.3)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-[#8A5A19]/20">
              <h3 className="text-[#1F3324] font-serif text-xl">Edit Product</h3>
              <button onClick={closeEditModal} className="text-[#1F3324] font-semibold hover:text-[#1F3324] transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Product Name</label>
                <input 
                  type="text" required value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/30 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Original Price (₹)</label>
                  <input 
                    type="number" min="0" step="1" value={editOriginalPrice} onChange={e => setEditOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white/30 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Discount Price (₹)</label>
                  <input 
                    type="number" min="0" step="1" value={editDiscountPrice} onChange={e => setEditDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white/30 border border-[#8A5A19]/30 text-[#1F3324] focus:border-[#8A5A19] outline-none rounded-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-1">Description</label>
                <textarea 
                  value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-2 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm placeholder-[#1F3324]/30 text-sm resize-none"
                  placeholder="Product description"
                />
              </div>

              {/* Color & Fabric */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Color Swatch</label>
                  <div className="flex bg-white/40 border border-[#8A5A19]/20 rounded-sm focus-within:border-[#8A5A19]/60 overflow-hidden h-[38px]">
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
                      className="flex-1 px-3 bg-transparent text-[#1F3324] text-sm outline-none placeholder-[#1F3324]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Fabric</label>
                  <input 
                    type="text" 
                    value={editFabricSpec}
                    onChange={(e) => setEditFabricSpec(e.target.value)}
                    className="w-full px-4 py-2 bg-white/40 border border-[#8A5A19]/20 text-[#1F3324] focus:border-[#8A5A19]/60 outline-none rounded-sm placeholder-[#1F3324]/30 text-sm"
                    placeholder="e.g. Pure Silk"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" checked={editIsExplore} onChange={e => setEditIsExplore(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                  <span className="text-xs uppercase tracking-wider text-[#1F3324]">Feature in &quot;Explore Collection&quot;</span>
                </label>
              </div>

              <div className="pt-2 border-t border-[#8A5A19]/20">
                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Existing Photos</label>
                {existingImages.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-[#8A5A19]/30 bg-white/40 group">
                        <Image src={url} alt={`Existing ${idx}`} fill className="object-cover" />
                        <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white text-[#1F3324] p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-1 left-1 bg-[#1F3324]/90 text-[#EBD4C9] text-[9px] px-1.5 py-0.5 rounded-sm">Cover</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#1F3324]/60 mb-4 italic">No existing photos.</p>
                )}

                <label className="block text-xs uppercase tracking-wider text-[#1F3324] font-semibold mb-2">Add More Photos</label>
                <div className="flex flex-col gap-3">
                  <label className="cursor-pointer w-full h-20 flex flex-col justify-center items-center border border-[#8A5A19]/30 border-dashed rounded-sm hover:border-[#8A5A19] transition-all bg-[#1F3324]/5">
                    <Plus className="h-5 w-5 text-[#1F3324] font-semibold mb-1" />
                    <span className="text-xs font-medium text-[#1F3324]">Click to select additional photos</span>
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={handleEditImageChange} />
                  </label>
                  
                  {editUploadItems.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {editUploadItems.map((item, idx) => (
                        <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-[#8A5A19]/30 bg-white/40">
                          <Image src={item.preview} alt={`New upload ${idx}`} fill className="object-cover" />
                          <button type="button" onClick={() => removeEditUploadItem(idx)} className="absolute top-0.5 right-0.5 bg-white/70 hover:bg-red-700 text-[#1F3324] p-0.5 rounded-full">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 border border-[#8A5A19]/30 text-[#1F3324] hover:bg-[#1F3324]/10 rounded-sm text-sm uppercase tracking-wider">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingEdit} className="px-4 py-2 bg-[#1F3324] text-[#EBD4C9] hover:bg-[#b5952f] rounded-sm text-sm uppercase tracking-wider font-bold min-w-[100px] flex justify-center items-center">
                  {isSavingEdit ? <div className="w-4 h-4 border-2 border-[#210209] border-t-transparent rounded-full animate-spin"></div> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </div>
      )}
    </div>
  );
}
