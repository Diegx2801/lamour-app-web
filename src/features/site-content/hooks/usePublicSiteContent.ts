import { useCallback, useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import {
  fetchPublicSiteContent,
  type SiteContentItem,
  type SiteContentSection,
} from "../api/siteContentService"

export function usePublicSiteContent(
  section: SiteContentSection,
  fallbackItems: SiteContentItem[]
) {
  const [items, setItems] = useState<SiteContentItem[]>(fallbackItems)

  const loadItems = useCallback(async () => {
    const data = await fetchPublicSiteContent(section)
    setItems(data)
  }, [section])

  useEffect(() => {
    let isMounted = true

    fetchPublicSiteContent(section).then((data) => {
      if (!isMounted) return
      setItems(data)
    })

    return () => {
      isMounted = false
    }
  }, [section])

  useEffect(() => {
    const channel = supabase
      .channel(`site-content-${section}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_content_items",
          filter: `section=eq.${section}`,
        },
        () => {
          loadItems()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadItems, section])

  return items.length > 0 ? items : fallbackItems
}
