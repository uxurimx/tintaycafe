import { pgTable, serial, text, integer, timestamp, doublePrecision, varchar, boolean, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Stores: Stable sucursales and informal points
export const stores = pgTable('stores', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    type: varchar('type', { length: 50 }).notNull().default('stable'), // 'stable', 'informal'
    address: text('address'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

// Categories: User-defined categories (Libros, Cafe, Juegos, etc.)
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    icon: varchar('icon', { length: 50 }).default('Package'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Items: Books, Coffee, Supplies, etc.
export const items = pgTable('items', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    barcode: varchar('barcode', { length: 100 }).unique(),
    type: varchar('type', { length: 50 }).notNull(), // legacy, to be replaced by categoryRef
    categoryId: integer('category_id').references(() => categories.id),
    category: varchar('category', { length: 100 }),
    imageUrl: text('image_url'),
    metadata: text('metadata'), // AI generated metadata (JSON string)
    price: doublePrecision('price').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

// Inventory: Specific stock levels per store
export const inventory = pgTable('inventory', {
    id: serial('id').primaryKey(),
    storeId: integer('store_id').references(() => stores.id).notNull(),
    itemId: integer('item_id').references(() => items.id).notNull(),
    quantity: doublePrecision('quantity').notNull().default(0),
    minStock: doublePrecision('min_stock').default(5),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
    unq: unique().on(table.storeId, table.itemId),
}));

// Recipes: Ingredients needed for prepared products (e.g., 100g coffee for an Espresso)
export const recipes = pgTable('recipes', {
    id: serial('id').primaryKey(),
    productId: integer('product_id').references(() => items.id).notNull(), // The final product (e.g. Latte)
    ingredientId: integer('ingredient_id').references(() => items.id).notNull(), // The base ingredient (e.g. Coffee beans)
    quantity: doublePrecision('quantity').notNull(), // Amount consumed per product
});

// Users/Employees
export const users = pgTable('users', {
    id: text('id').primaryKey(), // Clerk ID
    email: text('email').notNull(),
    name: text('name').notNull(),
    role: varchar('role', { length: 50 }).notNull().default('employee'), // 'owner', 'employee', 'admin'
    storeId: integer('store_id').references(() => stores.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// Transactions: Sales and movements
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    storeId: integer('store_id').references(() => stores.id).notNull(),
    userId: text('user_id').references(() => users.id).notNull(),
    customerId: integer('customer_id').references(() => customers.id),
    total: doublePrecision('total').notNull(),
    type: varchar('type', { length: 50 }).notNull().default('sale'), // 'sale', 'transfer', 'restock'
    createdAt: timestamp('created_at').defaultNow(),
});

export const transactionItems = pgTable('transaction_items', {
    id: serial('id').primaryKey(),
    transactionId: integer('transaction_id').references(() => transactions.id).notNull(),
    itemId: integer('item_id').references(() => items.id).notNull(),
    quantity: doublePrecision('quantity').notNull(),
    price: doublePrecision('price').notNull(),
});

// Customers & Loyalty (Quantum Points)
export const customers = pgTable('customers', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    phone: varchar('phone', { length: 20 }),
    birthday: timestamp('birthday'),
    points: integer('points').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const storeRelations = relations(stores, ({ many }) => ({
    inventory: many(inventory),
    transactions: many(transactions),
}));

export const itemRelations = relations(items, ({ many }) => ({
    inventory: many(inventory),
    recipes: many(recipes),
}));

export const transactionRelations = relations(transactions, ({ one, many }) => ({
    store: one(stores, { fields: [transactions.storeId], references: [stores.id] }),
    user: one(users, { fields: [transactions.userId], references: [users.id] }),
    customer: one(customers, { fields: [transactions.customerId], references: [customers.id] }),
    items: many(transactionItems),
}));
