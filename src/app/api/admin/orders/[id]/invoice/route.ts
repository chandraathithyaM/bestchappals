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
  const products = order.products || [];
  const productIds = products
    .filter((p: any) => !p.image && p.productId)
    .map((p: any) => p.productId);

  if (productIds.length > 0) {
    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, images")
      .in("id", productIds);

    const imgMap = new Map<string, string>();
    for (const dp of dbProducts || []) {
      if (dp.images && dp.images.length > 0) {
        imgMap.set(dp.id, dp.images[0]);
      }
    }

    for (const p of products) {
      if (!p.image && p.productId) {
        p.image = imgMap.get(p.productId) || null;
      }
    }
  }

  const doc = new jsPDF();
  const addr = order.shipping_address || {};

  // Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
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
  doc.text(`Status: ${order.order_status.toUpperCase()}`, 140, 43);

  // Bill To
  doc.setFontSize(12);
  doc.text("BILL TO:", 14, 50);
  doc.setFontSize(10);
  doc.text(addr.fullName || "Customer", 14, 56);
  doc.text(addr.phone || "", 14, 61);
  doc.text(addr.email || "", 14, 66);
  doc.text(`${addr.addressLine1 || ""}${addr.addressLine2 ? ", " + addr.addressLine2 : ""}`, 14, 71);
  doc.text(`${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`, 14, 76);

  // Table
  const tableRows = products.map((p: any) => [
    p.name || "Product",
    p.category || "N/A",
    p.size || "N/A",
    String(p.quantity || 1),
    `Rs. ${Number(p.price || 0).toLocaleString("en-IN")}`,
    `Rs. ${Number(p.subtotal || 0).toLocaleString("en-IN")}`,
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["Product", "Category", "Size", "Qty", "Price", "Subtotal"]],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 25 },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 12, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 30, halign: "right" },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;

  // Totals
  const subtotal = products.reduce((s: number, p: any) => s + Number(p.subtotal || 0), 0);
  const shipping = Number(order.amount) - subtotal + Number(order.discount || 0);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("Subtotal:", 140, finalY + 10);
  doc.text(`Rs. ${subtotal.toLocaleString("en-IN")}`, 190, finalY + 10, { align: "right" });

  doc.text("Shipping:", 140, finalY + 16);
  doc.text(shipping > 0 ? `Rs. ${shipping.toLocaleString("en-IN")}` : "FREE", 190, finalY + 16, { align: "right" });

  if (Number(order.discount) > 0) {
    doc.text("Discount:", 140, finalY + 22);
    doc.text(`-Rs. ${Number(order.discount).toLocaleString("en-IN")}`, 190, finalY + 22, { align: "right" });
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount:", 140, finalY + 30);
  doc.text(`Rs. ${Number(order.amount).toLocaleString("en-IN")}`, 190, finalY + 30, { align: "right" });

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
