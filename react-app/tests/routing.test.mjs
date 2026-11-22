import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveRoute } from '../src/utils/routing.js'

const routes = ['home', 'lesson1', 'diet']
const aliases = { 'home-energy-diet': 'diet' }

test('1차시 주소는 lesson1 페이지로 이동한다', () => {
  assert.equal(resolveRoute('#/lesson1', '', routes), 'lesson1')
})

test('알 수 없는 주소만 홈으로 이동한다', () => {
  assert.equal(resolveRoute('#/unknown', '', routes), 'home')
})

test('2차시는 고심이네 집 에너지 다이어트 주소로 이동한다', () => {
  assert.equal(resolveRoute('#/diet', '', routes), 'diet')
})

test('이전 새 2차시 주소도 공식 2차시로 연결한다', () => {
  assert.equal(resolveRoute('#/home-energy-diet', '', routes, aliases), 'diet')
})
