import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_API_URL = "https://api.xendit.co/v2/invoices";

export async function POST(request: NextRequest) {
    try {
        // Check required env vars
        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase config:", { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
            return NextResponse.json(
                { error: "Server configuration error: Supabase not configured" },
                { status: 500 }
            );
        }

        if (!XENDIT_SECRET_KEY) {
            console.error("Missing XENDIT_SECRET_KEY");
            return NextResponse.json(
                { error: "Server configuration error: Xendit not configured" },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const body = await request.json();
        const { product_id, coupon_code, user_id, user_email } = body;

        console.log("Create invoice request:", { product_id, user_id, user_email });

        if (!product_id || !user_id || !user_email) {
            return NextResponse.json(
                { error: "product_id, user_id, dan user_email wajib diisi" },
                { status: 400 }
            );
        }

        // Get product details
        const { data: product, error: productError } = await supabase
            .from("products")
            .select("*")
            .eq("id", product_id)
            .eq("is_active", true)
            .single();

        console.log("Product query result:", { product, productError });

        if (productError || !product) {
            return NextResponse.json(
                { error: `Produk tidak ditemukan: ${productError?.message || 'No product'}` },
                { status: 404 }
            );
        }

        let discountAmount = 0;
        let couponId = null;

        // Validate coupon if provided
        if (coupon_code) {
            const { data: coupon, error: couponError } = await supabase
                .from("coupons")
                .select("*")
                .eq("code", coupon_code.toUpperCase())
                .eq("is_active", true)
                .single();

            if (!couponError && coupon) {
                // Check if coupon is still valid
                const now = new Date();
                const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
                const maxUsesReached = coupon.max_uses && coupon.used_count >= coupon.max_uses;

                if (!maxUsesReached && (!validUntil || validUntil > now)) {
                    couponId = coupon.id;
                    if (coupon.discount_percent) {
                        discountAmount = Math.floor(product.price_idr * (coupon.discount_percent / 100));
                    } else if (coupon.discount_amount) {
                        discountAmount = Math.min(coupon.discount_amount, product.price_idr);
                    }
                }
            }
        }

        const amountFinal = product.price_idr - discountAmount;
        const externalId = `order_${Date.now()}_${user_id.slice(0, 8)}`;

        // Create Xendit Invoice
        const xenditResponse = await fetch(XENDIT_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`,
            },
            body: JSON.stringify({
                external_id: externalId,
                amount: amountFinal,
                currency: "IDR",
                description: `Langganan ${product.name} - Catat Cuanmu`,
                customer: {
                    email: user_email,
                },
                success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
                failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
                invoice_duration: 86400, // 24 hours
                items: [
                    {
                        name: product.name,
                        quantity: 1,
                        price: amountFinal,
                    },
                ],
            }),
        });

        if (!xenditResponse.ok) {
            const errorData = await xenditResponse.json();
            console.error("Xendit error:", errorData);
            return NextResponse.json(
                { error: "Gagal membuat invoice" },
                { status: 500 }
            );
        }

        const xenditData = await xenditResponse.json();

        // Save order to database
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id,
                user_email,
                product_id,
                coupon_id: couponId,
                external_id: externalId,
                xendit_invoice_id: xenditData.id,
                xendit_invoice_url: xenditData.invoice_url,
                amount_original: product.price_idr,
                discount_amount: discountAmount,
                amount_final: amountFinal,
                status: "PENDING",
                expires_at: new Date(Date.now() + 86400000).toISOString(), // 24 hours
            })
            .select()
            .single();

        if (orderError) {
            console.error("Order save error:", orderError);
            return NextResponse.json(
                { error: "Gagal menyimpan pesanan" },
                { status: 500 }
            );
        }

        // Increment coupon usage if used
        if (couponId) {
            await supabase.rpc("increment_coupon_usage", { coupon_id: couponId });
        }

        return NextResponse.json({
            invoice_url: xenditData.invoice_url,
            order_id: order.id,
            external_id: externalId,
        });
    } catch (error) {
        console.error("Create invoice error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
