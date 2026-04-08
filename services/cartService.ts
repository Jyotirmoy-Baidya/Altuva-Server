import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';
import { getAllTaxes } from './taxService';
import { getApplicableDeliveryCharge } from './deliveryChargeService';

const { carts, cartItems, products, discountCodes } = schema;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getOrCreateCart = async (customerId: number) => {
    const existing = await db.select().from(carts).where(eq(carts.customer_id, customerId)).limit(1);
    if (existing[0]) return existing[0];
    const created = await db.insert(carts).values({ customer_id: customerId }).returning();
    return created[0];
};

const getCartItems = async (cartId: number) => {
    return db.select({
        id: cartItems.id,
        cart_id: cartItems.cart_id,
        product_id: cartItems.product_id,
        quantity: cartItems.quantity,
        product: {
            id: products.id,
            name: products.name,
            slug: products.slug,
            price: products.price,
            discounted_price: products.discounted_price,
            discount_percentage: products.discount_percentage,
            primary_image: products.primary_image,
            stock: products.stock,
            is_in_stock: products.is_in_stock,
            sku: products.sku,
            weight: products.weight,
        },
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.product_id, products.id))
    .where(eq(cartItems.cart_id, cartId));
};

// ─── Cart Calculation ─────────────────────────────────────────────────────────

export const calculateCart = async (cartId: number, discountCodeId?: number | null) => {
    const items = await getCartItems(cartId);
    const activeTaxes = await getAllTaxes(true);

    // Per-item calculations
    const itemBreakdown = items.map(item => {
        const mrp = Number(item.product.price);
        const selling = Number(item.product.discounted_price || item.product.price);
        const qty = item.quantity;
        return {
            id: item.id,
            product_id: item.product_id,
            product: item.product,
            quantity: qty,
            unit_price: selling,
            unit_mrp: mrp,
            line_total: parseFloat((selling * qty).toFixed(2)),
            line_mrp: parseFloat((mrp * qty).toFixed(2)),
        };
    });

    const totalBeforeDiscount = parseFloat(itemBreakdown.reduce((s, i) => s + i.line_total, 0).toFixed(2));

    // Discount
    let discountInfo: { name: string; code: string; type: string; value: number; amount: number } | null = null;
    let totalAfterDiscount = totalBeforeDiscount;

    if (discountCodeId) {
        const dc = await db.select().from(discountCodes).where(eq(discountCodes.id, discountCodeId)).limit(1);
        const code = dc[0];
        if (code && code.is_active) {
            const discountAmount = code.type === 'percentage'
                ? parseFloat((totalBeforeDiscount * Number(code.value) / 100).toFixed(2))
                : Math.min(Number(code.value), totalBeforeDiscount);

            totalAfterDiscount = parseFloat((totalBeforeDiscount - discountAmount).toFixed(2));
            discountInfo = {
                name: code.name,
                code: code.code,
                type: code.type,
                value: Number(code.value),
                amount: discountAmount,
            };
        }
    }

    // Tax (applied on selling item price, not after discount)
    const taxBreakdown = activeTaxes.map(tax => {
        const taxable = totalBeforeDiscount;
        const amount = tax.type === 'percentage'
            ? parseFloat((taxable * Number(tax.value) / 100).toFixed(2))
            : parseFloat(Number(tax.value).toFixed(2));
        return {
            id: tax.id,
            name: tax.name,
            type: tax.type,
            value: Number(tax.value),
            amount,
        };
    });
    const totalTax = parseFloat(taxBreakdown.reduce((s, t) => s + t.amount, 0).toFixed(2));

    // Delivery charge (based on totalAfterDiscount)
    const deliverySlab = await getApplicableDeliveryCharge(totalAfterDiscount);
    const deliveryCharge = {
        name: deliverySlab?.name || 'Standard Delivery',
        slab: deliverySlab
            ? `₹${deliverySlab.min_order_amount} – ${deliverySlab.max_order_amount ?? '∞'}`
            : 'N/A',
        amount: deliverySlab ? Number(deliverySlab.charge) : 0,
    };

    const grandTotal = parseFloat((totalAfterDiscount + totalTax + deliveryCharge.amount).toFixed(2));

    return {
        items: itemBreakdown,
        total_before_discount: totalBeforeDiscount,
        discount: discountInfo,
        total_after_discount: totalAfterDiscount,
        tax_breakdown: taxBreakdown,
        total_tax: totalTax,
        delivery_charge: deliveryCharge,
        grand_total: grandTotal,
        item_count: items.reduce((s, i) => s + i.quantity, 0),
    };
};

// ─── Cart Operations ──────────────────────────────────────────────────────────

export const getCart = async (customerId: number) => {
    const cart = await getOrCreateCart(customerId);
    const summary = await calculateCart(cart.id, cart.discount_code_id);
    return { cart_id: cart.id, ...summary };
};

export const addToCart = async (customerId: number, productId: number, quantity = 1) => {
    const cart = await getOrCreateCart(customerId);

    // Validate product exists and is in stock
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product[0]) throw new Error('Product not found');
    if (!product[0].is_in_stock || product[0].stock < 1) throw new Error('Product is out of stock');

    const existing = await db.select().from(cartItems)
        .where(and(eq(cartItems.cart_id, cart.id), eq(cartItems.product_id, productId)))
        .limit(1);

    if (existing[0]) {
        const newQty = existing[0].quantity + quantity;
        if (newQty > product[0].stock) throw new Error(`Only ${product[0].stock} units available`);
        await db.update(cartItems).set({ quantity: newQty, updated_at: new Date() }).where(eq(cartItems.id, existing[0].id));
    } else {
        if (quantity > product[0].stock) throw new Error(`Only ${product[0].stock} units available`);
        await db.insert(cartItems).values({ cart_id: cart.id, product_id: productId, quantity });
    }

    await db.update(carts).set({ updated_at: new Date() }).where(eq(carts.id, cart.id));
    return calculateCart(cart.id, cart.discount_code_id);
};

export const updateCartItem = async (customerId: number, productId: number, quantity: number) => {
    const cart = await getOrCreateCart(customerId);

    if (quantity <= 0) {
        await db.delete(cartItems).where(and(eq(cartItems.cart_id, cart.id), eq(cartItems.product_id, productId)));
    } else {
        const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        if (!product[0]) throw new Error('Product not found');
        if (quantity > product[0].stock) throw new Error(`Only ${product[0].stock} units available`);

        await db.update(cartItems)
            .set({ quantity, updated_at: new Date() })
            .where(and(eq(cartItems.cart_id, cart.id), eq(cartItems.product_id, productId)));
    }

    await db.update(carts).set({ updated_at: new Date() }).where(eq(carts.id, cart.id));
    return calculateCart(cart.id, cart.discount_code_id);
};

export const removeFromCart = async (customerId: number, productId: number) => {
    const cart = await getOrCreateCart(customerId);
    await db.delete(cartItems).where(and(eq(cartItems.cart_id, cart.id), eq(cartItems.product_id, productId)));
    await db.update(carts).set({ updated_at: new Date() }).where(eq(carts.id, cart.id));
    return calculateCart(cart.id, cart.discount_code_id);
};

export const clearCart = async (customerId: number) => {
    const cart = await getOrCreateCart(customerId);
    await db.delete(cartItems).where(eq(cartItems.cart_id, cart.id));
    await db.update(carts).set({ discount_code_id: null, updated_at: new Date() }).where(eq(carts.id, cart.id));
    return calculateCart(cart.id, null);
};

export const applyDiscount = async (customerId: number, code: string) => {
    const cart = await getOrCreateCart(customerId);
    const summary = await calculateCart(cart.id, null);

    const dc = await db.select().from(discountCodes).where(eq(discountCodes.code, code.toUpperCase())).limit(1);
    if (!dc[0]) throw new Error('Invalid discount code');
    if (!dc[0].is_active) throw new Error('Discount code is inactive');
    if (dc[0].expires_at && new Date(dc[0].expires_at) < new Date()) throw new Error('Discount code has expired');
    if (dc[0].max_uses !== null && dc[0].used_count >= dc[0].max_uses) throw new Error('Discount code usage limit reached');
    if (Number(dc[0].min_order_amount) > summary.total_before_discount) {
        throw new Error(`Minimum order of ₹${dc[0].min_order_amount} required`);
    }

    await db.update(carts).set({ discount_code_id: dc[0].id, updated_at: new Date() }).where(eq(carts.id, cart.id));
    return calculateCart(cart.id, dc[0].id);
};

export const removeDiscount = async (customerId: number) => {
    const cart = await getOrCreateCart(customerId);
    await db.update(carts).set({ discount_code_id: null, updated_at: new Date() }).where(eq(carts.id, cart.id));
    return calculateCart(cart.id, null);
};
