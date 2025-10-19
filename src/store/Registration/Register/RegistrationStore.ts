import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  PatientInfo,
  PatientRequest,
  RegistrationPayload,
  RegistrationResult
} from '@/types/Registration/Register'
import {
  searchPatient,
  createPatient,
  generatePatientNo,
  createRegistration
} from '@/api/modules/Registration/Register'

export const useRegistrationStore = defineStore('registration', () => {
  // ========== 状态定义 ==========
  /**
   * 以下类型的数据初始化时应当定义有null类型
   * 1. 异步获取的数据 - 初始状态为空，后续通过API获取
   * 2. 可能不存在的数据 - 比如搜索结构，可能查不到
   * 3. 业务逻辑中有‘无数据’状态 - 需要区分‘未加载’和‘有数据’
   *
   * 以下类型的数据初始化时应当给出初始默认值，而不定义null类型
   * 1. 表单数据 - 总是有初始值（可能是空字符串）
   * 2. 配置对象 - 有默认值的配置
   * 3. 状态对象 - 总是有明确状态的数据
   *
   * Partial的作用：将类型T的所有属性变为可选，好处如下
   * 1. 渐进式构建 - 可以逐步填充挂号信息，不需要一次性提供所有字段
   * 2. 灵活性 - 允许部分字段为空，适合表单逐步填写的场景
   * 3. 类型安全 - 任然有类型检查，但允许字段缺失
   */
  const patientInfo = ref<Partial<PatientInfo>>({})
  const patientRequest = ref<Partial<PatientRequest>>({})
  const registrationPayload = ref<Partial<RegistrationPayload>>({})
  const registrationResult = ref<RegistrationResult | null>(null)
  const patientFound = ref<boolean>(false)
  const patientId = ref<number | null>(null)
  const searchClicked = ref<boolean>(false)
  const finishedResgiter = ref<boolean>(false)

  // ========== 写操作函数 ==========

  const updatePatientRequest = (newForm: PatientRequest) => {
    patientRequest.value = newForm
  }

  // ========== 业务逻辑函数 ==========

  async function searchPatientFun(name: string, idCard: string) {
    searchClicked.value = true
    finishedResgiter.value = false
    const list = await searchPatient({ name, idCard })
    // 找到患者则填充patientInfo
    if (list.length == 1) {
      patientFound.value = true
      patientInfo.value = list[0]
    } else {
      patientFound.value = false
      // 调用接口获取后端生成的patientNo
      const generatedNo = await generatePatientNo()
      // 找不到患者则填充先前输入的name和idCard的值
      patientInfo.value.name = name
      patientInfo.value.idCard = idCard
      patientInfo.value.patientNo = generatedNo.patientNo

      console.log('searchClicked:', searchClicked.value)
    }
  }

  async function createPatientFun() {
    const created = await createPatient(patientRequest.value as PatientRequest)
    patientId.value = created.patientId
    patientInfo.value = patientRequest.value
    patientInfo.value.patientId = patientId.value
    patientFound.value = true
  }

  async function registerWithPatient(payload?: Partial<RegistrationPayload>) {
    // ...封装 createIfNotExist -> regApi.createRegistration 等
    const final = {
      ...(registrationPayload.value as any),
      ...(payload ?? {})
    } as RegistrationPayload
    const res = await createRegistration(final)
    registrationResult.value = res
    searchClicked.value = false
    finishedResgiter.value = true
    return res
  }

  return {
    // 状态
    patientInfo,
    patientRequest,
    registrationPayload,
    registrationResult,
    patientFound,
    patientId,
    searchClicked,
    finishedResgiter,

    // 操作函数
    updatePatientRequest,

    // 业务函数
    searchPatientFun,
    createPatientFun,
    registerWithPatient
  }
})
