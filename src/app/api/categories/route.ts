import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export type Category = {
  id: string;
  name: string;
  count: number;
  section: 'sarees' | 'jewellery' | 'heritage' | 'dresses';
  description?: string;
  coverImage?: string;
};

export async function GET() {
  try {
    // Fetch categories from Supabase
    const { data: dbCategories, error: catError } = await supabase.from('categories').select('*');
    if (catError) {
      console.error("Error fetching categories:", catError);
      return NextResponse.json([]);
    }

    // Fetch products to calculate counts
    const { data: products, error: prodError } = await supabase.from('products').select('category');
    if (prodError) {
      console.error("Error fetching product counts:", prodError);
      return NextResponse.json(dbCategories || []);
    }
    
    // Count products per category
    const counts: Record<string, number> = {};
    products?.forEach(p => {
      const catName = typeof p.category === 'string' ? p.category.toLowerCase() : '';
      if (catName) {
        counts[catName] = (counts[catName] || 0) + 1;
      }
    });
    
    // Auto-recovery: if a product exists for a category not in the DB, add it to DB!
    let categories: Category[] = (dbCategories || []).map((c: any) => ({
      ...c,
      count: counts[(c.name || '').toLowerCase()] || 0
    }));

    const existingNames = categories.map(c => c.name.toLowerCase());
    
    const missingCategoriesToInsert: any[] = [];
    
    Object.keys(counts).forEach(lowerCatName => {
      if (!existingNames.includes(lowerCatName)) {
        const originalName = products.find(p => typeof p.category === 'string' && p.category.toLowerCase() === lowerCatName)?.category || lowerCatName;
        const newId = Math.random().toString(36).substring(2, 11);
        
        missingCategoriesToInsert.push({
          id: newId,
          name: originalName,
          section: 'sarees',
          description: '',
          coverImage: ''
        });
        
        categories.push({
          id: newId,
          name: originalName,
          count: counts[lowerCatName],
          section: 'sarees',
          description: '',
          coverImage: ''
        });
      }
    });

    if (missingCategoriesToInsert.length > 0) {
      // Async insert missing categories in background to self-heal
      supabase.from('categories').insert(missingCategoriesToInsert).then(({ error }) => {
        if (error) console.error("Failed to auto-heal missing categories:", error);
      });
    }
    
    return NextResponse.json(categories);
  } catch (err) {
    console.error("Error in GET categories:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCategory = {
      id: Math.random().toString(36).substring(2, 11),
      name: body.name,
      section: body.section || 'sarees',
      description: body.description || '',
      coverImage: body.coverImage || '',
    };
    
    const { error } = await supabase.from('categories').insert(newCategory);
    if (error) throw error;
    
    return NextResponse.json({ ...newCategory, count: 0 }, { status: 201 });
  } catch (err) {
    console.error("POST Category error:", err);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, section, description, coverImage } = body;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (section !== undefined) updateData.section = section;
    if (description !== undefined) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
        // If it doesn't exist, insert it (upsert behavior)
        const restoredCat = {
          id,
          name: name || 'Restored Category',
          section: section || 'sarees',
          description: description || '',
          coverImage: coverImage || '',
        };
        const { error: insertError } = await supabase.from('categories').insert(restoredCat);
        if (insertError) throw insertError;
        return NextResponse.json({ ...restoredCat, count: 0 });
    }
    
    return NextResponse.json({ ...data, count: 0 }); // Count is handled by GET
  } catch (err) {
    console.error("PUT Category error:", err);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Category error:", err);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 400 });
  }
}
