import { describe, expect, it } from 'vitest'
import { buildGuidedScriptPrompt } from './guidedProductionPrompts'

describe('buildGuidedScriptPrompt', () => {
  it('把当前创意直接交给编剧并要求真实写入', () => {
    const prompt = buildGuidedScriptPrompt('一个失忆剑客发现追杀自己的人是未来的自己')
    expect(prompt).toContain('一个失忆剑客发现追杀自己的人是未来的自己')
    expect(prompt).toContain('必须调用 append_to_end')
    expect(prompt).toContain('args.content')
    expect(prompt).not.toContain('先调用 read_full_text')
  })
})
