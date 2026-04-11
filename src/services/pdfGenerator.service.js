const PDFDocument = require("pdfkit");
const { format } = require("date-fns");

function formatCurrency(amount) {
    // Adjust locale and options as needed
    // Ensure amount is a number for toLocaleString
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        return "N/A";
    }
    return numAmount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    });
}

function generateInvoicePdf(invoice, customer, transactions) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: "A4" });

        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        // --- Header ---
        doc.fontSize(20).text("INVOICE", { align: "center" }).moveDown(0.5);

        // Company Info (Optional - Add your details)
        doc.fontSize(10)
            .text("Supercheap Mobile Mechanic", { align: "left" })
            // .text("123 Workshop St, Quetta", { align: "left" })
            .text("Phone: 0473 834 227", { align: "left" })
            .text("Email: ali@supercheapmechanic.com.au", { align: "left" })
            .moveDown();

        // --- Invoice Info & Customer Info ---
        const invoiceInfoTop = doc.y;
        doc.fontSize(10)
            .text(
                `Invoice Number: ${invoice.invoiceNumber}`,
                50,
                invoiceInfoTop
            )
            .text(
                `Issue Date: ${format(
                    new Date(invoice.issueDate),
                    "dd MMM yyyy"
                )}`,
                50,
                invoiceInfoTop + 15
            );

        const customerInfoX = 350;
        doc.fontSize(10)
            .text("Bill To:", customerInfoX, invoiceInfoTop)
            .font("Helvetica-Bold") // Make customer name bold
            .text(customer.name || "N/A", customerInfoX, invoiceInfoTop + 15)
            .font("Helvetica") // Reset font
            .text(
                customer.location || "N/A",
                customerInfoX,
                invoiceInfoTop + 30
            )
            .text(
                customer.phoneNumber || "N/A",
                customerInfoX,
                invoiceInfoTop + 45
            )
            .moveDown(2); // Add space after addresses

        // --- Invoice Table ---
        const tableTop = doc.y + 20; // Add space before table
        const itemCol = 50;
        const qtyCol = 280;
        const unitPriceCol = 370;
        const amountCol = 450;

        doc.font("Helvetica-Bold");
        doc.fontSize(10);
        doc.text("Product/Service Name", itemCol, tableTop);
        doc.text("Qty", qtyCol, tableTop);
        doc.text("Unit Price", unitPriceCol, tableTop);
        doc.text("Amount", amountCol, tableTop, { align: "right" });
        doc.font("Helvetica");
        doc.moveDown(0.5);

        // Draw header line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

        let tableY = doc.y;
        const lineItems = Array.isArray(transactions) ? transactions : [];

        if (lineItems.length === 0) {
            doc.fontSize(10).text(
                "This is a consolidated invoice; individual line items were recorded at billing time.",
                itemCol,
                tableY,
                { width: 480 }
            );
            tableY = doc.y + 14;
        } else {
            lineItems.forEach((item) => {
                doc.fontSize(10);
                const name =
                    item.product?.productServiceName != null
                        ? item.product.productServiceName
                        : "N/A";
                doc.text(name, itemCol, tableY, {
                    width: 220,
                });
                doc.text(String(item.quantity ?? ""), qtyCol, tableY);
                doc.text(String(item.unitPrice ?? ""), unitPriceCol, tableY);
                doc.text(
                    formatCurrency(item.totalLineAmount),
                    amountCol,
                    tableY,
                    {
                        align: "right",
                    }
                );

                tableY = doc.y + 10;
                if (tableY > 700) {
                    doc.addPage();
                    tableY = 50;
                }
                doc.moveDown(0.5);
            });
        }

        // Draw line before total
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

        // --- Total ---
        const calcTop = doc.y + 20;
        doc.font("Helvetica-Bold")
            .fontSize(12)
            .text("Total Amount:", 350, calcTop)
            .text(formatCurrency(invoice.totalAmount), amountCol, calcTop, {
                align: "right",
            })
            .font("Helvetica")
            .moveDown();

        // Footer
        doc.fontSize(9).text("Thank you for visiting.", 50, 750, {
            align: "center",
            width: 500,
        });

        // --- Finalize PDF ---
        doc.end();
    });
}

module.exports = generateInvoicePdf;
