import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db, schema } from '../db';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import { calculateCart, clearCart } from './cartService';

const { orders, orderItems, products, customerUsers, addresses } = schema;

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateOrderNumber = () => {
    const date = new Date();
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${ymd}-${rand}`;
};

// ─── Create Razorpay Order ────────────────────────────────────────────────────

export const createRazorpayOrder = async (customerId: number, addressId: number) => {
    // Validate address belongs to customer
    const addr = await db.select().from(addresses)
        .where(and(eq(addresses.id, addressId), eq(addresses.customer_id, customerId)))
        .limit(1);
    if (!addr[0]) throw new Error('Address not found');

    // Get cart summary
    const { carts } = schema;
    const cartRow = await db.select().from(carts).where(eq(carts.customer_id, customerId)).limit(1);
    if (!cartRow[0]) throw new Error('Cart is empty');

    const summary = await calculateCart(cartRow[0].id, cartRow[0].discount_code_id);
    if (summary.items.length === 0) throw new Error('Cart is empty');

    // Validate stock
    for (const item of summary.items) {
        const prod = await db.select({ stock: products.stock, is_in_stock: products.is_in_stock })
            .from(products).where(eq(products.id, item.product_id)).limit(1);
        if (!prod[0] || !prod[0].is_in_stock || prod[0].stock < item.quantity) {
            throw new Error(`"${item.product.name}" does not have enough stock`);
        }
    }

    // Create Razorpay order (amount in paise)
    const rzpOrder = await razorpay.orders.create({
        amount: Math.round(summary.grand_total * 100),
        currency: 'INR',
        receipt: generateOrderNumber(),
    });

    return {
        razorpay_order_id: rzpOrder.id,
        amount: summary.grand_total,
        currency: 'INR',
        key_id: process.env.RAZORPAY_KEY_ID,
        cart_summary: summary,
        address: addr[0],
    };
};

// ─── Verify Payment & Place Order ────────────────────────────────────────────

export const verifyAndPlaceOrder = async (
    customerId: number,
    addressId: number,
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
) => {
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest('hex');

    if (expected !== razorpay_signature) throw new Error('Payment verification failed');

    // Get address snapshot
    const addr = await db.select().from(addresses)
        .where(and(eq(addresses.id, addressId), eq(addresses.customer_id, customerId)))
        .limit(1);
    if (!addr[0]) throw new Error('Address not found');

    // Get cart
    const { carts } = schema;
    const cartRow = await db.select().from(carts).where(eq(carts.customer_id, customerId)).limit(1);
    if (!cartRow[0]) throw new Error('Cart is empty');

    const summary = await calculateCart(cartRow[0].id, cartRow[0].discount_code_id);
    if (summary.items.length === 0) throw new Error('Cart is empty');

    // Create order in DB
    const orderNumber = generateOrderNumber();
    const { id: addrId, customer_id: _, created_at: _ca, updated_at: _ua, ...addrSnapshot } = addr[0];
    void addrId; void _; void _ca; void _ua;

    const newOrder = await db.insert(orders).values({
        order_number: orderNumber,
        customer_id: customerId,
        delivery_address: addrSnapshot,
        subtotal: String(summary.total_before_discount),
        discount_amount: String(summary.discount?.amount ?? 0),
        discount_code: summary.discount?.code ?? null,
        tax_amount: String(summary.total_tax),
        tax_breakdown: summary.tax_breakdown,
        delivery_charge: String(summary.delivery_charge.amount),
        grand_total: String(summary.grand_total),
        status: 'placed',
        payment_method: 'online',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'paid',
    }).returning();

    const order = newOrder[0];

    // Insert order items
    await db.insert(orderItems).values(
        summary.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product.name,
            product_sku: item.product.sku ?? null,
            product_image: item.product.primary_image,
            quantity: item.quantity,
            unit_price: String(item.unit_price),
            unit_mrp: String(item.unit_mrp),
            line_total: String(item.line_total),
        }))
    );

    // Reduce stock
    for (const item of summary.items) {
        await db.update(products)
            .set({
                stock: sql`${products.stock} - ${item.quantity}`,
                is_in_stock: sql`CASE WHEN ${products.stock} - ${item.quantity} > 0 THEN true ELSE false END`,
                updated_at: new Date(),
            })
            .where(eq(products.id, item.product_id));
    }

    // Increment discount used_count
    if (summary.discount) {
        const { discountCodes } = schema;
        await db.update(discountCodes)
            .set({ used_count: sql`${discountCodes.used_count} + 1` })
            .where(eq(discountCodes.code, summary.discount.code));
    }

    // Clear cart
    await clearCart(customerId);

    return getOrderById(order.id, customerId);
};

// ─── Get Order By ID ──────────────────────────────────────────────────────────

export const getOrderById = async (orderId: number, customerId?: number) => {
    const where = customerId
        ? and(eq(orders.id, orderId), eq(orders.customer_id, customerId))
        : eq(orders.id, orderId);

    const order = await db.select().from(orders).where(where).limit(1);
    if (!order[0]) throw new Error('Order not found');

    const items = await db.select().from(orderItems).where(eq(orderItems.order_id, orderId));

    return { ...order[0], items };
};

// ─── Get Customer Orders ──────────────────────────────────────────────────────

export const getCustomerOrders = async (customerId: number, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const rows = await db.select().from(orders)
        .where(eq(orders.customer_id, customerId))
        .orderBy(desc(orders.created_at))
        .limit(limit)
        .offset(offset);

    const total = await db.select({ count: sql<number>`count(*)::int` })
        .from(orders).where(eq(orders.customer_id, customerId));

    return { orders: rows, total: total[0].count, page, limit };
};

// ─── Admin: Get All Orders ────────────────────────────────────────────────────

export const getAllOrders = async (params: {
    page?: number; limit?: number; status?: string; search?: string;
}) => {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    const rows = await db
        .select({
            id: orders.id,
            order_number: orders.order_number,
            customer_id: orders.customer_id,
            customer_name: customerUsers.name,
            customer_email: customerUsers.email,
            grand_total: orders.grand_total,
            status: orders.status,
            payment_status: orders.payment_status,
            payment_method: orders.payment_method,
            item_count: sql<number>`(SELECT COUNT(*) FROM order_items WHERE order_id = ${orders.id})::int`,
            created_at: orders.created_at,
        })
        .from(orders)
        .innerJoin(customerUsers, eq(orders.customer_id, customerUsers.id))
        .where(params.status ? eq(orders.status, params.status) : undefined)
        .orderBy(desc(orders.created_at))
        .limit(limit)
        .offset(offset);

    const totalQ = await db.select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(params.status ? eq(orders.status, params.status) : undefined);

    return { orders: rows, total: totalQ[0].count, page, limit };
};

// ─── Admin: Update Order Status ───────────────────────────────────────────────

export const updateOrderStatus = async (
    orderId: number,
    status: string,
    revertStock = false,
) => {
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order[0]) throw new Error('Order not found');

    const validStatuses = ['placed', 'confirmed', 'packed', 'dispatched', 'out_for_delivery', 'delivered', 'canceled', 'refunded'];
    if (!validStatuses.includes(status)) throw new Error('Invalid status');

    await db.update(orders).set({ status, updated_at: new Date() }).where(eq(orders.id, orderId));

    // Revert stock if requested (for canceled/refunded)
    if (revertStock && (status === 'canceled' || status === 'refunded')) {
        const items = await db.select().from(orderItems).where(eq(orderItems.order_id, orderId));
        for (const item of items) {
            if (item.product_id) {
                await db.update(products)
                    .set({
                        stock: sql`${products.stock} + ${item.quantity}`,
                        is_in_stock: true,
                        updated_at: new Date(),
                    })
                    .where(eq(products.id, item.product_id));
            }
        }
    }

    return getOrderById(orderId);
};

// ─── Admin: Stats ─────────────────────────────────────────────────────────────

export const getOrderStats = async () => {
    const [totals] = await db.select({
        total_orders: sql<number>`count(*)::int`,
        total_revenue: sql<number>`COALESCE(SUM(CASE WHEN status NOT IN ('canceled','refunded','payment_pending') THEN grand_total::numeric ELSE 0 END), 0)`,
        pending_orders: sql<number>`count(CASE WHEN status = 'payment_pending' THEN 1 END)::int`,
        placed_orders: sql<number>`count(CASE WHEN status = 'placed' THEN 1 END)::int`,
        delivered_orders: sql<number>`count(CASE WHEN status = 'delivered' THEN 1 END)::int`,
    }).from(orders);

    // Top products by quantity sold
    const topProducts = await db
        .select({
            product_id: orderItems.product_id,
            product_name: orderItems.product_name,
            total_qty: sql<number>`SUM(${orderItems.quantity})::int`,
            total_revenue: sql<number>`SUM(${orderItems.line_total}::numeric)`,
        })
        .from(orderItems)
        .innerJoin(orders, and(eq(orderItems.order_id, orders.id), inArray(orders.status, ['placed', 'confirmed', 'packed', 'dispatched', 'out_for_delivery', 'delivered'])))
        .groupBy(orderItems.product_id, orderItems.product_name)
        .orderBy(desc(sql`SUM(${orderItems.quantity})`))
        .limit(5);

    return { ...totals, top_products: topProducts };
};
