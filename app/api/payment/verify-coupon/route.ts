import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { coupon_code, product_price } = body;

        if (!coupon_code) {
            return NextResponse.json({ error: "Kode kupon wajib diisi" }, { status: 400 });
        }

        const { data: coupon, error: couponError } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", coupon_code.toUpperCase())
            .eq("is_active", true)
            .single();

        if (couponError || !coupon) {
            return NextResponse.json({
                valid: false,
                error: "Kupon tidak valid atau tidak ditemukan"
            }, { status: 200 });
        }

        // Check expiry
        if (coupon.valid_until) {
            const validUntil = new Date(coupon.valid_until);
            if (validUntil < new Date()) {
                return NextResponse.json({
                    valid: false,
                    error: "Kupon sudah kadaluarsa"
                }, { status: 200 });
            }
        }

        // Check usage limit
        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
            return NextResponse.json({
                valid: false,
                error: "Kupon sudah mencapai batas penggunaan"
            }, { status: 200 });
        }

        // Calculate discount
        let discountAmount = 0;
        let discountDisplay = "";

        if (coupon.discount_percent) {
            discountAmount = product_price ? Math.floor(product_price * (coupon.discount_percent / 100)) : 0;
            discountDisplay = `${coupon.discount_percent}%`;
        } else if (coupon.discount_amount) {
            discountAmount = coupon.discount_amount;
            discountDisplay = `Rp ${coupon.discount_amount.toLocaleString("id-ID")}`;
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                code: coupon.code,
                discount_percent: coupon.discount_percent,
                discount_amount: coupon.discount_amount,
                discount_display: discountDisplay,
                calculated_discount: discountAmount,
            },
        });
    } catch (error) {
        console.error("Verify coupon error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}
