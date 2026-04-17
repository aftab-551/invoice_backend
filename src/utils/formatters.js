/**
 * Formats IDs with prefixes
 * Example: Customer 1 in 2026 becomes C2601
 * Example: Product 5 becomes P105
 */
const formatId = (id, type) => {
    if (!id) return "N/A";
    
    if (type === 'customer') {
        const year = new Date().getFullYear().toString().slice(-2); // "26"
        // padStart(2, '0') ensures ID 1 becomes "01", ID 10 stays "10"
        return `C${year}${id.toString().padStart(2, '0')}`;
    }
    
    if (type === 'product') {
        return `P${(id + 100)}`; // Starts from P101, P102, etc.
    }
    
    return id;
};

module.exports = { formatId };