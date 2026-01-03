import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

import {
  getRefundTrend,
  getRegistrationsByDepartment,
  getRegistrationsByDoctor,
  getRegistrationsTrend,
  getRegistrationsTypeBreakdown,
  getRevenueByDepartment,
  getRevenueByType,
  getRevenueTrend
} from '@/api/modules/Information/Overview'

import type {
  RegistrationsByDepartmentItem,
  RegistrationsByDoctorItem,
  RegistrationsTrendResponse,
  RegistrationsTypeBreakdownItem,
  RevenueByDepartmentResponse,
  RevenueByTypeResponse,
  RevenueTrendResponse,
  RefundTrendResponse,
  StatsPeriodQuery
} from '@/types/Information/Stats'

export const useInformationOverviewStore = defineStore(
  'informationOverviewStore',
  () => {
    const loading = ref(false)

    const query = reactive<StatsPeriodQuery>({
      period: 'month'
    })

    const registrationsTrend = ref<RegistrationsTrendResponse | null>(null)
    const registrationsTypeBreakdown = ref<RegistrationsTypeBreakdownItem[]>([])
    const registrationsByDepartment = ref<RegistrationsByDepartmentItem[]>([])
    const registrationsByDoctor = ref<RegistrationsByDoctorItem[]>([])

    const revenueTrend = ref<RevenueTrendResponse | null>(null)
    const revenueByType = ref<RevenueByTypeResponse | null>(null)
    const revenueByDepartment = ref<RevenueByDepartmentResponse | null>(null)

    const refundTrend = ref<RefundTrendResponse | null>(null)

    async function fetchAll(params?: Partial<StatsPeriodQuery>) {
      loading.value = true
      try {
        const merged: StatsPeriodQuery = {
          ...query,
          ...params
        }

        const requestQuery: StatsPeriodQuery = {
          period: merged.period
        }
        if (merged.period === 'auto') {
          if (merged.startDate) requestQuery.startDate = merged.startDate
          if (merged.endDate) requestQuery.endDate = merged.endDate
        }

        const [
          trend,
          typeBreakdown,
          byDept,
          byDoctor,
          revTrend,
          revByType,
          revByDept,
          refund
        ] = await Promise.all([
          getRegistrationsTrend(requestQuery),
          getRegistrationsTypeBreakdown(requestQuery),
          getRegistrationsByDepartment(requestQuery),
          getRegistrationsByDoctor(requestQuery),
          getRevenueTrend(requestQuery),
          getRevenueByType(requestQuery),
          getRevenueByDepartment(requestQuery),
          getRefundTrend(requestQuery)
        ])

        registrationsTrend.value = trend
        registrationsTypeBreakdown.value = typeBreakdown
        registrationsByDepartment.value = byDept
        registrationsByDoctor.value = byDoctor

        revenueTrend.value = revTrend
        revenueByType.value = revByType
        revenueByDepartment.value = revByDept

        refundTrend.value = refund
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      query,
      registrationsTrend,
      registrationsTypeBreakdown,
      registrationsByDepartment,
      registrationsByDoctor,
      revenueTrend,
      revenueByType,
      revenueByDepartment,
      refundTrend,
      fetchAll
    }
  }
)
