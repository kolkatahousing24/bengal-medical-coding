/**
 * Supabase Database Adapter
 * Replaces Prisma with Supabase REST API via the JS client.
 * Provides the same interface as Prisma: findMany, findUnique, findFirst, create, update, delete, count
 */

import { supabaseAdmin } from './supabase/server'
// PostgrestFilterBuilder type is used implicitly via method chaining
// eslint-disable-next-line @typescript-eslint/no-unused-vars
 type FilterChain = any

// ============ Tables with auto-timestamps ============
// Only these tables have createdAt/updatedAt columns in Supabase
const TABLES_WITH_CREATED_AT = new Set([
  'User', 'Course', 'Module', 'Lesson', 'LiveClass', 'Assignment',
  'AssignmentSubmission', 'Exam', 'Blog', 'Notification', 'Enquiry',
  'Review', 'Faculty', 'GalleryImage', 'ContactMessage', 'PasswordReset',
])

const TABLES_WITH_UPDATED_AT = new Set([
  'User', 'Course', 'Module', 'Lesson', 'LiveClass', 'Assignment',
  'Exam', 'Blog', 'Enquiry', 'Review', 'Faculty', 'GalleryImage',
  'ContactMessage',
])

// ============ Helper Types ============

type WhereValue = string | number | boolean | null | string[] | number[] | WhereObject
interface WhereObject {
  contains?: string
  in?: (string | number)[]
  lt?: string | number
  lte?: string | number
  gt?: string | number
  gte?: string | number
  not?: string | number | boolean
}

interface OrClause {
  OR?: Record<string, WhereValue>[]
  [key: string]: any
}

type WhereClause = Record<string, WhereValue> & Partial<OrClause>

interface FindManyOptions {
  where?: WhereClause
  select?: Record<string, any>
  include?: Record<string, any>
  orderBy?: Record<string, string> | { [key: string]: string }
  skip?: number
  take?: number
}

interface FindUniqueOptions {
  where: WhereClause
  select?: Record<string, any>
  include?: Record<string, any>
}

interface FindFirstOptions {
  where: WhereClause
  select?: Record<string, any>
  include?: Record<string, any>
  orderBy?: Record<string, string>
}

interface CreateOptions {
  data: Record<string, any>
  select?: Record<string, any>
  include?: Record<string, any>
}

interface UpdateOptions {
  where: WhereClause
  data: Record<string, any>
  select?: Record<string, any>
  include?: Record<string, any>
}

interface DeleteOptions {
  where: WhereClause
}

interface CountOptions {
  where?: WhereClause
}

// ============ Build select string from Prisma-style select/include ============

function buildSelectString(select?: Record<string, any>, include?: Record<string, any>): string {
  if (select) {
    const fields: string[] = []
    for (const [key, value] of Object.entries(select)) {
      if (value === true) {
        fields.push(key)
      } else if (typeof value === 'object' && value !== null) {
        // Nested relation selects are NOT supported in Supabase (no FK relationships)
        // Skip them - the caller must fetch related data separately
        console.warn(`[DB] Skipping nested select on relation "${key}" - not supported without FK relationships. Fetch separately instead.`)
      }
    }
    return fields.length > 0 ? fields.join(',') : '*'
  }

  if (include) {
    // `include` is NOT supported because Supabase has no FK relationships defined.
    // Log a warning and return '*' so the query at least works (without related data).
    const relationNames = Object.keys(include).join(', ')
    console.warn(`[DB] \`include\` is not supported (no FK relationships in Supabase). Skipping include: { ${relationNames} }. Fetch related data separately.`)
    return '*'
  }

  return '*'
}

// Map Prisma relation names to Supabase table names
const relationToTable: Record<string, string> = {
  studentProfile: 'StudentProfile',
  teacherProfile: 'TeacherProfile',
  user: 'User',
  course: 'Course',
  module: 'Module',
  lesson: 'Lesson',
  enrollment: 'Enrollment',
  liveClass: 'LiveClass',
  attendance: 'Attendance',
  assignment: 'Assignment',
  assignmentSubmission: 'AssignmentSubmission',
  exam: 'Exam',
  question: 'Question',
  examResult: 'ExamResult',
  blog: 'Blog',
  notification: 'Notification',
  certificate: 'Certificate',
  loginHistory: 'LoginHistory',
  passwordReset: 'PasswordReset',
  enquiry: 'Enquiry',
  review: 'Review',
  faculty: 'Faculty',
  galleryImage: 'GalleryImage',
  contactMessage: 'ContactMessage',
}

function mapRelationFields(selectStr: string): string {
  let result = selectStr
  for (const [relation, table] of Object.entries(relationToTable)) {
    // Replace relation names in select string with Supabase table names
    // e.g., "studentProfile(enrollmentNo)" → "StudentProfile(enrollmentNo)"
    result = result.replace(new RegExp(`\\b${relation}\\(`, 'g'), `${table}(`)
  }
  return result
}

// ============ Apply where filters ============

function applyWhere(query: any, where?: WhereClause): any {
  if (!where) return query

  for (const [key, value] of Object.entries(where)) {
    if (key === 'OR') {
      // Handle OR clause
      const orConditions: string[] = []
      for (const orCondition of value as Record<string, any>[]) {
        for (const [orKey, orValue] of Object.entries(orCondition)) {
          if (typeof orValue === 'object' && orValue !== null && 'contains' in orValue) {
            orConditions.push(`${orKey}.ilike.%${orValue.contains}%`)
          } else if (typeof orValue === 'object' && orValue !== null && 'in' in orValue) {
            const vals = (orValue as any).in
            vals.forEach((v: string | number) => orConditions.push(`${orKey}.eq.${v}`))
          } else {
            orConditions.push(`${orKey}.eq.${orValue}`)
          }
        }
      }
      if (orConditions.length > 0) {
        query = query.or(orConditions.join(','))
      }
      continue
    }

    if (value === null || value === undefined) {
      query = query.is(key, null)
      continue
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const obj = value as WhereObject
      if ('contains' in obj) {
        query = query.ilike(key, `%${obj.contains}%`)
      } else if ('in' in obj) {
        query = query.in(key, obj.in!)
      } else if ('lt' in obj) {
        query = query.lt(key, obj.lt!)
      } else if ('lte' in obj) {
        query = query.lte(key, obj.lte!)
      } else if ('gt' in obj) {
        query = query.gt(key, obj.gt!)
      } else if ('gte' in obj) {
        query = query.gte(key, obj.gte!)
      } else if ('not' in obj) {
        query = query.neq(key, obj.not!)
      }
      continue
    }

    // Simple equality
    query = query.eq(key, value)
  }

  return query
}

// ============ Apply orderBy ============

function applyOrderBy(query: any, orderBy?: Record<string, string> | { [key: string]: string }): any {
  if (!orderBy) return query

  if (typeof orderBy === 'object') {
    for (const [key, dir] of Object.entries(orderBy)) {
      query = query.order(key, { ascending: dir === 'asc' })
    }
  }

  return query
}

// ============ Generate CUID-like ID ============

export function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `c${timestamp}${random}`
}

// ============ SupabaseModel Class ============

class SupabaseModel {
  private tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  private from() {
    return supabaseAdmin.from(this.tableName)
  }

  async findMany(options: FindManyOptions = {}): Promise<any[]> {
    const selectStr = mapRelationFields(buildSelectString(options.select, options.include))
    let query = this.from().select(selectStr)

    query = applyWhere(query, options.where)
    query = applyOrderBy(query, options.orderBy as Record<string, string>)

    if (options.skip) {
      query = query.range(options.skip, options.skip + (options.take || 100) - 1)
    } else if (options.take) {
      query = query.limit(options.take)
    }

    const { data, error } = await query
    if (error) {
      console.error(`[DB] findMany error on ${this.tableName}:`, error)
      throw new Error(error.message)
    }

    return this.transformRelations(data || [])
  }

  async findUnique(options: FindUniqueOptions): Promise<any | null> {
    const selectStr = mapRelationFields(buildSelectString(options.select, options.include))
    let query = this.from().select(selectStr)

    query = applyWhere(query, options.where)

    const { data, error } = await query.limit(1).single()
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error(`[DB] findUnique error on ${this.tableName}:`, error)
      throw new Error(error.message)
    }

    return this.transformRelations(data)
  }

  async findFirst(options: FindFirstOptions): Promise<any | null> {
    const selectStr = mapRelationFields(buildSelectString(options.select, options.include))
    let query = this.from().select(selectStr)

    query = applyWhere(query, options.where)
    if (options.orderBy) {
      query = applyOrderBy(query, options.orderBy as Record<string, string>)
    }

    const { data, error } = await query.limit(1)
    if (error) {
      console.error(`[DB] findFirst error on ${this.tableName}:`, error)
      throw new Error(error.message)
    }

    const result = data?.[0] || null
    return result ? this.transformRelations(result) : null
  }

  async create(options: CreateOptions): Promise<any> {
    // Generate ID if not provided
    if (!options.data.id) {
      options.data.id = generateId()
    }

    // Auto-set timestamps (Prisma handled these automatically)
    const now = new Date().toISOString()
    if (TABLES_WITH_CREATED_AT.has(this.tableName) && !options.data.createdAt) options.data.createdAt = now
    if (TABLES_WITH_UPDATED_AT.has(this.tableName) && !options.data.updatedAt) options.data.updatedAt = now

    const { data, error } = await this.from().insert(options.data).select('*').single()
    if (error) {
      console.error(`[DB] create error on ${this.tableName}:`, error)
      throw new Error(error.message)
    }

    return data
  }

  async createMany(records: Record<string, any>[]): Promise<any[]> {
    const now = new Date().toISOString()
    const withIds = records.map(r => ({
      ...r,
      id: r.id || generateId(),
      ...(TABLES_WITH_CREATED_AT.has(this.tableName) && !r.createdAt ? { createdAt: now } : {}),
      ...(TABLES_WITH_UPDATED_AT.has(this.tableName) && !r.updatedAt ? { updatedAt: now } : {}),
    }))

    const { data, error } = await this.from().insert(withIds).select('*')
    if (error) {
      console.error(`[DB] createMany error on ${this.tableName}:`, error)
      throw new Error(error.message)
    }

    return data || []
  }

  async update(options: UpdateOptions): Promise<any> {
    // Auto-update timestamp (Prisma @updatedAt handled this automatically)
    if (TABLES_WITH_UPDATED_AT.has(this.tableName) && !options.data.updatedAt) options.data.updatedAt = new Date().toISOString()

    let query = this.from().update(options.data)

    // Apply where filters to update
    for (const [key, value] of Object.entries(options.where)) {
      if (value === null || value === undefined) {
        query = query.is(key, null) as any
      } else if (typeof value === 'object' && 'in' in (value as any)) {
        query = query.in(key, (value as any).in) as any
      } else {
        query = query.eq(key, value) as any
      }
    }

    const { data, error } = await query.select('*')
    if (error) {
      console.error(`[DB] update error on ${this.tableName}:`, error)
      throw new Error(error.message)
    }

    return data?.[0] || null
  }

  async delete(options: DeleteOptions): Promise<any> {
    let query = this.from().delete()

    // Apply where filters to delete
    for (const [key, value] of Object.entries(options.where)) {
      if (value === null || value === undefined) {
        query = query.is(key, null) as any
      } else if (typeof value === 'object' && 'in' in (value as any)) {
        query = query.in(key, (value as any).in) as any
      } else {
        query = query.eq(key, value) as any
      }
    }

    const { data, error } = await query.select('*')
    if (error) {
      console.error(`[DB] delete error on ${this.tableName}:`, error)
      throw new Error(error.message)
    }

    return data?.[0] || { message: 'Deleted successfully' }
  }

  async count(options: CountOptions = {}): Promise<number> {
    let query = this.from().select('*', { count: 'exact', head: true })

    if (options.where) {
      for (const [key, value] of Object.entries(options.where)) {
        if (key === 'OR') continue // Skip OR for count
        if (value === null || value === undefined) {
          query = query.is(key, null) as any
        } else if (typeof value === 'object' && 'in' in (value as any)) {
          query = query.in(key, (value as any).in) as any
        } else if (typeof value === 'object' && 'contains' in (value as any)) {
          query = query.ilike(key, `%${(value as any).contains}%`) as any
        } else {
          query = query.eq(key, value) as any
        }
      }
    }

    const { count, error } = await query
    if (error) {
      console.error(`[DB] count error on ${this.tableName}:`, error)
      throw new Error(error.message)
    }

    return count || 0
  }

  /**
   * Transform Supabase relation names back to Prisma-style camelCase
   * e.g., StudentProfile → studentProfile
   */
  private transformRelations(data: any): any {
    if (!data) return data
    if (Array.isArray(data)) {
      return data.map(item => this.transformRelations(item))
    }

    if (typeof data === 'object') {
      const result: any = {}
      for (const [key, value] of Object.entries(data)) {
        // Map PascalCase table names back to camelCase relation names
        const camelKey = this.tableNameToRelation(key)
        result[camelKey] = value
      }
      return result
    }

    return data
  }

  private tableNameToRelation(key: string): string {
    // Map known table names back to Prisma relation names
    const tableToRelation: Record<string, string> = {
      'StudentProfile': 'studentProfile',
      'TeacherProfile': 'teacherProfile',
      'User': 'user',
      'Course': 'course',
      'Module': 'module',
      'Lesson': 'lesson',
      'Enrollment': 'enrollment',
      'LiveClass': 'liveClass',
      'Attendance': 'attendance',
      'Assignment': 'assignment',
      'AssignmentSubmission': 'assignmentSubmission',
      'Exam': 'exam',
      'Question': 'question',
      'ExamResult': 'examResult',
      'Blog': 'blog',
      'Notification': 'notification',
      'Certificate': 'certificate',
      'LoginHistory': 'loginHistory',
      'PasswordReset': 'passwordReset',
      'Enquiry': 'enquiry',
      'Review': 'review',
      'Faculty': 'faculty',
      'GalleryImage': 'galleryImage',
      'ContactMessage': 'contactMessage',
    }
    return tableToRelation[key] || key
  }
}

// ============ Export db object matching Prisma's interface ============

export const db = {
  user: new SupabaseModel('User'),
  loginHistory: new SupabaseModel('LoginHistory'),
  passwordReset: new SupabaseModel('PasswordReset'),
  studentProfile: new SupabaseModel('StudentProfile'),
  teacherProfile: new SupabaseModel('TeacherProfile'),
  course: new SupabaseModel('Course'),
  module: new SupabaseModel('Module'),
  lesson: new SupabaseModel('Lesson'),
  enrollment: new SupabaseModel('Enrollment'),
  liveClass: new SupabaseModel('LiveClass'),
  attendance: new SupabaseModel('Attendance'),
  assignment: new SupabaseModel('Assignment'),
  assignmentSubmission: new SupabaseModel('AssignmentSubmission'),
  exam: new SupabaseModel('Exam'),
  question: new SupabaseModel('Question'),
  examResult: new SupabaseModel('ExamResult'),
  blog: new SupabaseModel('Blog'),
  notification: new SupabaseModel('Notification'),
  certificate: new SupabaseModel('Certificate'),
  enquiry: new SupabaseModel('Enquiry'),
  review: new SupabaseModel('Review'),
  faculty: new SupabaseModel('Faculty'),
  galleryImage: new SupabaseModel('GalleryImage'),
  contactMessage: new SupabaseModel('ContactMessage'),
}
