import { readFileSync } from 'node:fs'
import { type Database } from '../types/db-types'

export const db = JSON.parse(readFileSync('db/db.json', 'utf-8')) as Database