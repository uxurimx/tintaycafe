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
    costPrice: doublePrecision('cost_price').default(0),
    unit: varchar('unit', { length: 50 }), // kg, liter, piece, etc.
    supplierId: integer('supplier_id').references(() => suppliers.id),
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

// Roles: system + custom (slug used in users.role)
export const roles = pgTable('roles', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: varchar('slug', { length: 50 }).notNull().unique(),
    isSystem: boolean('is_system').notNull().default(false), // true = cannot delete
    createdAt: timestamp('created_at').defaultNow(),
});

// Role modules: which nav modules this role can access
export const roleModules = pgTable('role_modules', {
    id: serial('id').primaryKey(),
    roleId: integer('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    module: varchar('module', { length: 50 }).notNull(), // me, users, inventory, menu, pos, customers, suppliers, settings
}, (table) => ({
    unq: unique().on(table.roleId, table.module),
}));

// Users/Employees (users.role = role slug from roles table)
export const users = pgTable('users', {
    id: text('id').primaryKey(), // Clerk ID
    email: text('email').notNull(),
    name: text('name').notNull(),
    role: varchar('role', { length: 50 }).notNull().default('customer'), // slug: owner, admin, employee, kitchen, customer, or custom
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
    status: varchar('status', { length: 50 }).notNull().default('completed'), // 'pending', 'preparing', 'ready', 'completed'
    supplierId: integer('supplier_id').references(() => suppliers.id),
    createdAt: timestamp('created_at').defaultNow(),
});

export const transactionItems = pgTable('transaction_items', {
    id: serial('id').primaryKey(),
    transactionId: integer('transaction_id').references(() => transactions.id).notNull(),
    itemId: integer('item_id').references(() => items.id).notNull(),
    quantity: doublePrecision('quantity').notNull(),
    price: doublePrecision('price').notNull(),
});

// Suppliers: Entity providing raw materials
export const suppliers = pgTable('suppliers', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    contact: text('contact'),
    email: text('email'),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Customers & Loyalty (Quantum Points)
export const customers = pgTable('customers', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    phone: varchar('phone', { length: 20 }),
    birthday: timestamp('birthday'),
    points: integer('points').default(0),
    xp: integer('xp').default(0),
    rank: varchar('rank', { length: 50 }).default('Aprendiz'), // 'Aprendiz', 'Alquimista', 'Maestro', 'Quantum'
    createdAt: timestamp('created_at').defaultNow(),
});

// Custom Recipes: User-created drink recipes
export const customRecipes = pgTable('custom_recipes', {
    id: serial('id').primaryKey(),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    baseItemId: integer('base_item_id').references(() => items.id), // e.g. "Latte" base
    ingredients: text('ingredients').notNull(), // JSON string of ingredients and adjustments
    basePrice: doublePrecision('base_price').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const storeRelations = relations(stores, ({ many }) => ({
    inventory: many(inventory),
    transactions: many(transactions),
}));

export const itemRelations = relations(items, ({ one, many }) => ({
    inventory: many(inventory),
    recipes: many(recipes),
    category: one(categories, { fields: [items.categoryId], references: [categories.id] }),
}));

export const transactionRelations = relations(transactions, ({ one, many }) => ({
    store: one(stores, { fields: [transactions.storeId], references: [stores.id] }),
    user: one(users, { fields: [transactions.userId], references: [users.id] }),
    customer: one(customers, { fields: [transactions.customerId], references: [customers.id] }),
    items: many(transactionItems),
}));

export const transactionItemRelations = relations(transactionItems, ({ one }) => ({
    transaction: one(transactions, { fields: [transactionItems.transactionId], references: [transactions.id] }),
    item: one(items, { fields: [transactionItems.itemId], references: [items.id] }),
}));

export const roleRelations = relations(roles, ({ many }) => ({
    modules: many(roleModules),
}));

export const roleModuleRelations = relations(roleModules, ({ one }) => ({
    role: one(roles, { fields: [roleModules.roleId], references: [roles.id] }),
}));

export const userRelations = relations(users, ({ one, many }) => ({
    store: one(stores, { fields: [users.storeId], references: [stores.id] }),
    transactions: many(transactions),
}));

export const supplierRelations = relations(suppliers, ({ many }) => ({
    items: many(items),
    restocks: many(transactions),
}));

export const customRecipeRelations = relations(customRecipes, ({ one }) => ({
    user: one(users, { fields: [customRecipes.userId], references: [users.id] }),
    baseItem: one(items, { fields: [customRecipes.baseItemId], references: [items.id] }),
}));
