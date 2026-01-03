import type { Money } from './common'

export interface RegistrationLevelResponse {
  code: string
  name: string
  price: Money
  status: 0 | 1
}

export interface SetRegistrationPriceRequest {
  prices: Array<{
    code: string
    price: Money
  }>
}

export interface CreateRegistrationLevelRequest {
  code: string
  name: string
  price: Money
}

export interface UpdateRegistrationLevelStatusParams {
  code: string
  status: 0 | 1
}
