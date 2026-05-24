import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const supabase = createServerClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Heal missing product images from products table
  // ── 3. Heal order products on the fly for the invoice ─────────────────────
  if (order.products && order.products.length > 0) {
    const productIds = Array.from(new Set(order.products.map((p: any) => p.productId).filter(Boolean)));
    const dbProductMap = new Map<string, any>();
    if (productIds.length > 0) {
      const { data: dbProducts } = await supabase
        .from("products")
        .select("id, name, category, images, sizes")
        .in("id", productIds);

      for (const dp of dbProducts || []) {
        dbProductMap.set(dp.id, dp);
      }
    }

    for (const p of order.products) {
      if (p.productId) {
        const dbProd = dbProductMap.get(p.productId);
        const localProd = localCatalog.find((lp) => lp.id === p.productId);

        if (!p.name) {
          p.name = dbProd?.name || localProd?.name || "Product";
        }
        if (!p.size) {
          const sizesList = dbProd?.sizes || localProd?.sizes || [];
          const firstSize = typeof sizesList[0] === 'string' ? sizesList[0] : sizesList[0]?.size;
          p.size = firstSize || "N/A";
        }
        if (!p.price) {
          p.price = dbProd?.price || localProd?.price || 0;
        }
        if (!p.subtotal) {
          p.subtotal = p.price * (p.quantity || 1);
        }
      }
    }
  }

  const doc = new jsPDF() as any;
  const addr = order.shipping_address || {};

  // Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // #2563EB
  doc.text("BESTCHAPPALS", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Puliampatti, Tamil Nadu", 14, 26);
  doc.text("Phone: +91 8838247446", 14, 31);

  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text("INVOICE", 140, 20);

  doc.setFontSize(10);
  doc.text(`Order ID: ${order.id.substring(0, 8)}`, 140, 28);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 140, 33);
  doc.text(`Payment: ${order.payment_status.toUpperCase()}`, 140, 38);

  // Bill To
  doc.setFontSize(12);
  doc.text("BILL TO:", 14, 50);
  doc.setFontSize(10);
  doc.text(addr.fullName || "Customer", 14, 56);
  doc.text(addr.phone || "", 14, 61);
  doc.text(addr.email || "", 14, 66);
  doc.text(`${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`, 14, 71);
  doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 14, 76);

  // Table
  const tableRows = (order.products || []).map((p: any) => [
    p.name || "Product",
    p.size || "N/A",
    p.quantity || 1,
    `INR ${p.price || 0}`,
    `INR ${p.subtotal || 0}`
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["Product", "Size", "Qty", "Price", "Subtotal"]],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
  });

  const finalY = (doc as any).previousAutoTable?.finalY || (doc as any).lastAutoTable?.finalY || 150;

  // Totals
  doc.text("Subtotal:", 140, finalY + 10);
  doc.text(`INR ${order.amount - (order.shipping || 0) + (order.discount || 0)}`, 175, finalY + 10, { align: "right" });
  
  doc.text("Shipping:", 140, finalY + 15);
  doc.text(`INR ${order.shipping || 0}`, 175, finalY + 15, { align: "right" });

  if (order.discount > 0) {
    doc.text("Discount:", 140, finalY + 20);
    doc.text(`- INR ${order.discount}`, 175, finalY + 20, { align: "right" });
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount:", 140, finalY + 28);
  doc.text(`INR ${order.amount}`, 175, finalY + 28, { align: "right" });

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("Thank you for shopping with BestChappals!", 105, 280, { align: "center" });

  const pdfOutput = doc.output("arraybuffer");

  return new NextResponse(pdfOutput, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice_${order.id.substring(0, 8)}.pdf"`,
    },
  });
}
