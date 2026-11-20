export const PRODUCT_CATEGORIES = [
  { value: 'production-lines', label: 'Production Lines', adminLabel: 'Production Lines（生产线）' },
  { value: 'standalone-machine', label: 'Standalone Machines', adminLabel: 'Standalone Machine（单机设备）' },
] as const

export function productCategory(value: string | null | undefined) {
  return PRODUCT_CATEGORIES.find((category) => category.value === value) ?? PRODUCT_CATEGORIES[0]
}

export function groupProducts<T extends { category?: string | null }>(products: T[]) {
  return PRODUCT_CATEGORIES.map((category) => ({
    ...category,
    products: products.filter((product) => productCategory(product.category).value === category.value),
  }))
}
