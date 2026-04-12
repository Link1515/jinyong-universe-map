import type { Gender } from '../types'

export function translateGender(gender: Gender): string {
  if (gender === 'male') {
    return '男'
  }

  if (gender === 'female') {
    return '女'
  }

  return '未標註'
}
