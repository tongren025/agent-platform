import { describe, expect, it, vi } from 'vitest'
import { routeApprovalRequestsByOwner, type ApprovalOwner } from './pendingApprovalRouter'

type Request = { toolCallId: string; overrides?: Record<string, unknown> }

describe('routeApprovalRequestsByOwner', () => {
  it('流已结束但卡片仍在时，仍交给创建它的轮次批准执行', async () => {
    const oldOwner = vi.fn<ApprovalOwner<Request>>(async () => undefined)
    const owners = new Map<string, ApprovalOwner<Request>>([['old-call', oldOwner]])

    // Web 流结束不会清除 pending 卡；稍后点击确认仍能找到原 owner。
    await routeApprovalRequestsByOwner([{ toolCallId: 'old-call' }], (id) => owners.get(id))

    expect(oldOwner).toHaveBeenCalledOnce()
    expect(oldOwner).toHaveBeenCalledWith([{ toolCallId: 'old-call' }])
  })

  it('旧卡和新轮卡按 owner 隔离，不会被新轮回调吞掉', async () => {
    const oldOwner = vi.fn<ApprovalOwner<Request>>(async () => undefined)
    const newOwner = vi.fn<ApprovalOwner<Request>>(async () => undefined)
    const owners = new Map<string, ApprovalOwner<Request>>([
      ['old-call', oldOwner],
      ['new-call', newOwner],
    ])

    await routeApprovalRequestsByOwner(
      [{ toolCallId: 'old-call' }, { toolCallId: 'new-call', overrides: { prompt: 'new' } }],
      (id) => owners.get(id),
    )

    expect(oldOwner).toHaveBeenCalledWith([{ toolCallId: 'old-call' }])
    expect(newOwner).toHaveBeenCalledWith([{ toolCallId: 'new-call', overrides: { prompt: 'new' } }])
  })

  it('拒绝或清空后不再调用过期 owner', async () => {
    const owner = vi.fn<ApprovalOwner<Request>>(async () => undefined)
    const owners = new Map<string, ApprovalOwner<Request>>([['cleared-call', owner]])
    owners.clear()

    await routeApprovalRequestsByOwner([{ toolCallId: 'cleared-call' }], (id) => owners.get(id))

    expect(owner).not.toHaveBeenCalled()
  })
})
