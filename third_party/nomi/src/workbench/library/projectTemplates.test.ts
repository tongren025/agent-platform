import { describe, expect, it } from 'vitest'
import { PROJECT_TEMPLATES, PROJECT_TEMPLATE_LIST } from './projectTemplates'

describe('projectTemplates', () => {
  it('exposes 3 templates', () => {
    expect(PROJECT_TEMPLATE_LIST.length).toBe(3)
    expect(PROJECT_TEMPLATES['manga-short']).toBeDefined()
    expect(PROJECT_TEMPLATES['product-demo']).toBeDefined()
    expect(PROJECT_TEMPLATES['free-form']).toBeDefined()
  })

  it('manga-short enables the v0.6 five-category workspace', () => {
    const tpl = PROJECT_TEMPLATES['manga-short']
    expect(tpl.enabledCategories).toEqual(['shots', 'cast', 'scene', 'prop', 'audio'])
  })

  it('product-demo enables fewer categories than manga-short', () => {
    const manga = PROJECT_TEMPLATES['manga-short'].enabledCategories.length
    const demo = PROJECT_TEMPLATES['product-demo'].enabledCategories.length
    expect(demo).toBeLessThan(manga)
  })

  it('free-form enables all 5 v0.6 categories', () => {
    expect(PROJECT_TEMPLATES['free-form'].enabledCategories).toEqual(['shots', 'cast', 'scene', 'prop', 'audio'])
  })

  it('each template has a non-empty name and description', () => {
    for (const tpl of PROJECT_TEMPLATE_LIST) {
      expect(tpl.name.length).toBeGreaterThan(0)
      expect(tpl.description.length).toBeGreaterThan(0)
    }
  })

  it('each template references a valid default category', () => {
    for (const tpl of PROJECT_TEMPLATE_LIST) {
      expect(tpl.enabledCategories).toContain(tpl.defaultCategoryId)
    }
  })

  it('seedDocument for manga-short contains placeholder @角色 syntax', () => {
    expect(PROJECT_TEMPLATES['manga-short'].seedDocument).toMatch(/@角色/)
  })

  it('seedDocument for free-form is empty', () => {
    expect(PROJECT_TEMPLATES['free-form'].seedDocument).toBe('')
  })
})
