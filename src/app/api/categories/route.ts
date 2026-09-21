import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export type Category = {
  id: string;
  name: string;
  count: number;
  section: 'sarees' | 'jewellery' | 'heritage';
  description?: string;
  coverImage?: string;
};

const dataPath = path.join(process.cwd(), 'src/data/categories.json');

const getCategories = (): Category[] => {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to read categories', e);
  }
  return [];
};

const saveCategories = (cats: Category[]) => {
  try {
    if (!fs.existsSync(path.dirname(dataPath))) {
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(cats, null, 2));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
};

export async function GET() {
  const categories = getCategories();
  try {
    const { data: products, error } = await supabase.from('products').select('category');
    
    if (error) {
      console.error("Error fetching product counts:", error);
      return NextResponse.json(categories);
    }
    
    const counts: Record<string, number> = {};
    products?.forEach(p => {
      const catName = typeof p.category === 'string' ? p.category.toLowerCase() : '';
      if (catName) {
        counts[catName] = (counts[catName] || 0) + 1;
      }
    });
    
    // Auto-recovery: if a product exists for a category not in our JSON, add it!
    let needsSave = false;
    Object.keys(counts).forEach(lowerCatName => {
      if (!categories.find(c => c.name.toLowerCase() === lowerCatName)) {
        // Find the actual case from the product if possible
        const originalName = products.find(p => typeof p.category === 'string' && p.category.toLowerCase() === lowerCatName)?.category || lowerCatName;
        categories.push({
          id: Math.random().toString(36).substring(2, 11),
          name: originalName,
          count: 0,
          section: 'sarees', // fallback
          description: '',
          coverImage: '',
        });
        needsSave = true;
      }
    });

    const updatedCategories = categories.map(c => ({
      ...c,
      count: counts[c.name.toLowerCase()] || 0
    }));
    
    if (needsSave) {
      saveCategories(updatedCategories);
    }
    
    return NextResponse.json(updatedCategories);
  } catch (err) {
    console.error("Error calculating categories:", err);
    return NextResponse.json(categories);
  }
}

export async function POST(request: Request) {
  try {
    const categories = getCategories();
    const body = await request.json();
    const newCategory: Category = {
      id: Math.random().toString(36).substring(2, 11),
      name: body.name,
      count: 0,
      section: body.section || 'sarees',
      description: body.description || '',
      coverImage: body.coverImage || '',
    };
    categories.push(newCategory);
    saveCategories(categories);
    return NextResponse.json(newCategory, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const categories = getCategories();
    const body = await request.json();
    const { id, name, section, description, coverImage } = body;
    const catIndex = categories.findIndex(c => c.id === id);
    if (catIndex > -1) {
      categories[catIndex] = { ...categories[catIndex], description, coverImage, section: section || categories[catIndex].section };
      if (name) categories[catIndex].name = name;
      saveCategories(categories);
      return NextResponse.json(categories[catIndex]);
    } else {
      const restoredCat: Category = {
        id,
        name: name || 'Restored Category',
        count: 0,
        section: section || 'sarees',
        description: description || '',
        coverImage: coverImage || '',
      };
      categories.push(restoredCat);
      saveCategories(categories);
      return NextResponse.json(restoredCat);
    }
  } catch {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    let categories = getCategories();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    categories = categories.filter(c => c.id !== id);
    saveCategories(categories);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 400 });
  }
}
