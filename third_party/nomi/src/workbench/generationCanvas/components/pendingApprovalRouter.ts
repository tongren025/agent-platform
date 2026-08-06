export type ApprovalRequestLike = { toolCallId: string }

export type ApprovalOwner<TRequest extends ApprovalRequestLike> = (
  requests: TRequest[],
) => Promise<void> | void

/**
 * 将确认请求交回创建该卡片的 Agent 轮次。
 *
 * 流结束后卡片仍可等待用户确认；新一轮开始也不会覆盖旧轮次的执行器。
 * lookup 不再返回卡片（拒绝、清空、卸载）时，请求会被安全忽略。
 */
export async function routeApprovalRequestsByOwner<TRequest extends ApprovalRequestLike>(
  requests: readonly TRequest[],
  lookupOwner: (toolCallId: string) => ApprovalOwner<TRequest> | undefined,
): Promise<void> {
  const grouped = new Map<ApprovalOwner<TRequest>, TRequest[]>()
  for (const request of requests) {
    const owner = lookupOwner(request.toolCallId)
    if (!owner) continue
    const group = grouped.get(owner)
    if (group) group.push(request)
    else grouped.set(owner, [request])
  }
  for (const [owner, ownerRequests] of grouped) {
    await owner(ownerRequests)
  }
}
