import { useEffect, useState } from 'react'
import { demoProperties, type Property, type PropertyCategory } from '../lib/data'
import { supabase } from '../lib/supabase'

interface PropertyRow {
  id: string
  slug: string
  title: string
  location: string
  category: PropertyCategory
  price: number
  bedrooms: number
  bathrooms: number
  area_sqft: number
  image_url: string
  tag: string | null
  description: string
  features: string[] | null
  featured: boolean
  sort_order: number
}

function mapRow(row: PropertyRow): Property {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    category: row.category,
    price: row.price,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqft: row.area_sqft,
    image: row.image_url,
    tag: row.tag,
    description: row.description,
    features: row.features ?? [],
    featured: row.featured,
    sortOrder: row.sort_order,
  }
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(demoProperties)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const client = supabase
    if (!client) return

    let cancelled = false

    const loadProperties = async () => {
      const { data, error } = await client
        .from('properties')
        .select(
          'id, slug, title, location, category, price, bedrooms, bathrooms, area_sqft, image_url, tag, description, features, featured, sort_order',
        )
        .eq('published', true)
        .order('sort_order', { ascending: true })

      if (cancelled) return

      if (error) {
        console.info(
          '[Hearth & Form] Supabase is connected, but the properties table is not ready. Showing the local collection.',
          error.message,
        )
        return
      }

      if (data?.length) {
        setProperties((data as PropertyRow[]).map(mapRow))
        setIsLive(true)
      }
    }

    void loadProperties()

    return () => {
      cancelled = true
    }
  }, [])

  return { properties, isLive }
}
