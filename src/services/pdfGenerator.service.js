const PDFDocument = require("pdfkit");
const { format } = require("date-fns");
const fs = require("fs");
const path = require("path"); 
// const { formatId } = require("../utils/formatters");

function formatCurrency(amount) {
    // Adjust locale and options as needed
    // Ensure amount is a number for toLocaleString
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        return "N/A";
    }
    return numAmount.toLocaleString("en-AU", {
        style: "currency",
        currency: "AUD",
    });
}

function generateInvoicePdf(invoice, customer, transactions) {
    console.log("Generating PDF with invoice:", invoice,customer);
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: "A4" });

        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);


        // 1. Position and size the logo
        const logoPath = path.join(__dirname, "../assets/supercheap-logo.png"); // Adjust path as needed
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 100 }); 
        }

        // 2. MOVE THE CURSOR DOWN so text doesn't overlap
        doc.moveDown(4);

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
            )
            .font("Helvetica-Bold")
            .text(
                `Status: ${invoice.status.toLowerCase() === "paid" ? "Paid" : "Unpaid"}`,
                50,
                invoiceInfoTop + 30
            )

        const customerInfoX = 350;
        doc.fontSize(10)
            .text("Bill To:", customerInfoX, invoiceInfoTop, { underline: true })
            .font("Helvetica-Bold")
            // COMBINE Label and Value into one string:
            .text(`Name: ${customer.name || "N/A"}`, customerInfoX, invoiceInfoTop + 15)
            
            .font("Helvetica") 
            .text(`Location: ${customer.location || "N/A"}`, customerInfoX, invoiceInfoTop + 30)
            .text(`Phone: ${customer.phoneNumber || "N/A"}`, customerInfoX, invoiceInfoTop + 45)
            .text(`Customer ID: ${customer.customerNumber || "N/A"}`, customerInfoX, invoiceInfoTop + 60)
            .text(`Email: ${customer.email || "N/A"}`, customerInfoX, invoiceInfoTop + 75);

        doc.moveDown(2);

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
            .text("Total Amount(AUD):", 350, calcTop)
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
