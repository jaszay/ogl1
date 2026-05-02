export const filterGuides = (guides: any[], search: string | null) => {
    // console.log('filterGuides', guides, search)
    if (!guides) {
      return [];
    }
    if (!search) {
      return guides.sort((a, b) => a.displayName.localeCompare(b.displayName))
    }
    search = search.toLowerCase();
    // @ts-ignore
    let res = guides.filter(
      (guide: any) => guide.displayName.toLowerCase().indexOf(search) > -1
    )
    if (!res.length) {
      // @ts-ignore
      res = guides.filter(
        (guide: any) => guide.apiName.toLowerCase().indexOf(search) > -1
      )
    }

    return res.sort((a, b) => a.displayName.localeCompare(b.displayName))
  }
 