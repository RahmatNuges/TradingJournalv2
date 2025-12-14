import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN!;

// GET handler for Xendit webhook connectivity test
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "Webhook endpoint is active"
    });
}

export async function POST(request: NextRequest) {
    try {
        // Verify webhook token
        const callbackToken = request.headers.get("x-callback-token");

        if (callbackToken !== XENDIT_WEBHOOK_TOKEN) {
            console.error("Invalid webhook token");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { external_id, status, paid_at } = body;

        console.log("Webhook received:", { external_id, status });

        if (!external_id) {
            return NextResponse.json({ error: "Missing external_id" }, { status: 400 });
        }

        // Get order by external_id
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*, products(*)")
            .eq("external_id", external_id)
            .single();

        if (orderError || !order) {
            console.error("Order not found:", external_id);
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Map Xendit status to our status
        let newStatus = order.status;
        if (status === "PAID" || status === "SETTLED") {
            newStatus = "PAID";
        } else if (status === "EXPIRED") {
            newStatus = "EXPIRED";
        } else if (status === "FAILED") {
            newStatus = "FAILED";
        }

        // Update order status
        const { error: updateError } = await supabase
            .from("orders")
            .update({
                status: newStatus,
                paid_at: newStatus === "PAID" ? (paid_at || new Date().toISOString()) : null,
            })
            .eq("id", order.id);

        if (updateError) {
            console.error("Failed to update order:", updateError);
            return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
        }

        // If paid, create or extend subscription
        if (newStatus === "PAID" && order.user_id) {
            const durationDays = order.products?.duration_days || 30;
            const planName = order.products?.name || "Premium";

            // Check if user has existing subscription
            const { data: existingSub } = await supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", order.user_id)
                .single();

            if (existingSub) {
                // Extend existing subscription
                const currentExpiry = new Date(existingSub.expires_at);
                const now = new Date();
                const baseDate = currentExpiry > now ? currentExpiry : now;
                const newExpiry = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

                await supabase
                    .from("subscriptions")
                    .update({
                        order_id: order.id,
                        plan_name: planName,
                        expires_at: newExpiry.toISOString(),
                        is_active: true,
                    })
                    .eq("user_id", order.user_id);
            } else {
                // Create new subscription
                const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

                await supabase.from("subscriptions").insert({
                    user_id: order.user_id,
                    order_id: order.id,
                    plan_name: planName,
                    expires_at: expiresAt.toISOString(),
                    is_active: true,
                });
            }

            console.log(`Subscription created/extended for user ${order.user_id}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
