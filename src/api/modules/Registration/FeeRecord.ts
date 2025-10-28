import { apiRequest } from '@/api/request'
import type {
  FeeTransactionQueryParams,
  FeeTransactionResponse
} from '@/types/Registration/FeeRecord'

/**
 * 查询费用交易记录
 * @param params 查询参数
 * @returns 费用交易记录列表
 */
export function queryFeeTransactions(
  params: Partial<FeeTransactionQueryParams> = {}
) {
  return apiRequest<FeeTransactionResponse>({
    url: '/fees',
    method: 'GET',
    params: {
      // 过滤掉 undefined 值
      ...Object.fromEntries(
        Object.entries(params).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ''
        )
      )
    }
  })
}

// ✅ 导出常用的接口函数（主要接口）
export { queryFeeTransactions as getFeeTransactions }
