import { apiRequest } from '@/api/request'
import type {
  RefundableItemsQueryParams,
  RefundableItemsResponse,
  RefundSettleItem
} from '@/types/Registration/RefundCharge'

/**
 * 获取可退费项目列表
 * @param params 查询参数
 * @returns 可退费项目列表
 */
export function listRefundableItems(
  params: Partial<RefundableItemsQueryParams> = {}
) {
  return apiRequest<RefundableItemsResponse>({
    url: '/refunds/items',
    method: 'GET',
    params: {
      // 过滤掉 undefined 值
      ...Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      )
    }
  })
}

/**
 * 批量退费
 * @param items 退费项目列表
 * @returns 退费结果
 */
export function refund(items: RefundSettleItem[]) {
  return apiRequest<{}>({
    url: '/refunds',
    method: 'POST',
    data: items
  })
}

// ✅ 导出常用的接口函数（主要接口）
export { listRefundableItems as getRefundableItems, refund as performRefund }
