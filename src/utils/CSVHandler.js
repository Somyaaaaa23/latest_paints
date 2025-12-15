// CSV Handler - Import/Export data in CSV format
export class CSVHandler {
  constructor() {
    this.name = "CSV Handler";
  }

  // Parse CSV string to array of objects
  parseCSV(csvString, options = {}) {
    const {
      delimiter = ',',
      hasHeader = true,
      skipEmptyLines = true
    } = options;

    const lines = csvString.split('\n').filter(line => 
      !skipEmptyLines || line.trim().length > 0
    );

    if (lines.length === 0) return [];

    const headers = hasHeader 
      ? this.parseLine(lines[0], delimiter)
      : Array.from({ length: this.parseLine(lines[0], delimiter).length }, (_, i) => `column${i + 1}`);

    const startIndex = hasHeader ? 1 : 0;
    const data = [];

    for (let i = startIndex; i < lines.length; i++) {
      const values = this.parseLine(lines[i], delimiter);
      if (values.length === 0) continue;

      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : '';
      });
      data.push(row);
    }

    return data;
  }

  // Parse a single CSV line handling quoted values
  parseLine(line, delimiter = ',') {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  // Convert array of objects to CSV string
  toCSV(data, options = {}) {
    const {
      delimiter = ',',
      includeHeader = true,
      columns = null
    } = options;

    if (!data || data.length === 0) return '';

    const headers = columns || Object.keys(data[0]);
    const lines = [];

    // Add header row
    if (includeHeader) {
      lines.push(headers.map(h => this.escapeCSVValue(h)).join(delimiter));
    }

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return this.escapeCSVValue(value);
      });
      lines.push(values.join(delimiter));
    });

    return lines.join('\n');
  }

  // Escape CSV value (handle quotes and delimiters)
  escapeCSVValue(value) {
    if (value === null || value === undefined) return '';
    
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  // Download CSV file
  downloadCSV(data, filename = 'export.csv', options = {}) {
    const csvContent = this.toCSV(data, options);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  // Read CSV file from input
  async readCSVFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvString = event.target.result;
          const data = this.parseCSV(csvString);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Export RFP data to CSV
  exportRFPData(rfps) {
    const data = rfps.map(rfp => ({
      'RFP ID': rfp.id,
      'Title': rfp.title,
      'Source': rfp.source,
      'Deadline': rfp.deadline,
      'Value': rfp.value,
      'Status': rfp.status,
      'Days Left': rfp.daysLeft,
      'Match Score': rfp.matchScore || 'N/A',
      'Area (sq ft)': rfp.requirements?.area || 'N/A',
      'Type': rfp.requirements?.type || 'N/A',
      'Urgency': rfp.requirements?.urgency || 'N/A'
    }));

    this.downloadCSV(data, `rfp_data_${Date.now()}.csv`);
  }

  // Export vendor quotes to CSV
  exportVendorQuotes(vendorQuotes) {
    const data = Object.values(vendorQuotes).map(quote => ({
      'Vendor': quote.vendor || quote.vendorName,
      'Final Price': quote.finalPrice,
      'Material Cost': quote.costBreakdown?.materialCost || quote.subtotalCost,
      'Labor Cost': quote.costBreakdown?.laborCost || quote.totalLaborFees,
      'Testing Cost': quote.costBreakdown?.testingCost || quote.totalTestingCosts,
      'Overhead': quote.costBreakdown?.overheadCost || quote.overheadCost,
      'Volume Discount': quote.costBreakdown?.volumeDiscount || quote.volumeDiscount,
      'Reliability': `${quote.projectMetrics?.avgReliability || quote.avgReliability}%`,
      'Lead Time': `${quote.projectMetrics?.maxLeadTime || quote.maxLeadTime} days`,
      'Competitive Score': quote.competitiveScore || quote.score,
      'Total Area': quote.projectMetrics?.totalArea || quote.totalArea
    }));

    this.downloadCSV(data, `vendor_quotes_${Date.now()}.csv`);
  }

  // Export product catalog to CSV
  exportProductCatalog(productRepository) {
    const data = [];
    
    Object.entries(productRepository).forEach(([vendor, products]) => {
      products.forEach(product => {
        data.push({
          'Vendor': vendor,
          'Product ID': product.id,
          'Product Name': product.name,
          'Category': product.category,
          'Finish': product.finish,
          'Coverage (sq ft/liter)': product.coverage,
          'Durability (years)': product.durability,
          'Cost': product.cost,
          'Reliability': `${product.reliability}%`,
          'Lead Time (days)': product.leadTime,
          'Weather Resistance': product.specs?.weatherResistance || 'N/A',
          'Fade Resistance': product.specs?.fadeResistance || 'N/A',
          'Washability': product.specs?.washability || 'N/A',
          'VOC': product.specs?.voc || 'N/A'
        });
      });
    });

    this.downloadCSV(data, `product_catalog_${Date.now()}.csv`);
  }

  // Export audit trail to CSV
  exportAuditTrail(auditLogs) {
    const data = auditLogs.map(log => ({
      'Timestamp': log.timestamp,
      'Agent': log.agent,
      'Action': log.action,
      'Reasoning': log.reasoning,
      'Log ID': log.id,
      'RFP ID': log.data?.rfpId || 'N/A'
    }));

    this.downloadCSV(data, `audit_trail_${Date.now()}.csv`);
  }

  // Import product catalog from CSV
  async importProductCatalog(file) {
    const data = await this.readCSVFile(file);
    const productRepository = {};

    data.forEach(row => {
      const vendor = row['Vendor'];
      if (!productRepository[vendor]) {
        productRepository[vendor] = [];
      }

      productRepository[vendor].push({
        id: row['Product ID'],
        name: row['Product Name'],
        category: row['Category'],
        finish: row['Finish'],
        coverage: parseFloat(row['Coverage (sq ft/liter)']),
        durability: parseInt(row['Durability (years)']),
        cost: parseFloat(row['Cost']),
        reliability: parseFloat(row['Reliability'].replace('%', '')),
        leadTime: parseInt(row['Lead Time (days)']),
        specs: {
          weatherResistance: row['Weather Resistance'],
          fadeResistance: row['Fade Resistance'],
          washability: row['Washability'],
          voc: row['VOC']
        }
      });
    });

    return productRepository;
  }

  // Validate CSV structure
  validateCSV(data, requiredColumns) {
    if (!data || data.length === 0) {
      return { valid: false, error: 'CSV is empty' };
    }

    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      return {
        valid: false,
        error: `Missing required columns: ${missingColumns.join(', ')}`
      };
    }

    return { valid: true };
  }

  // Convert JSON to CSV (generic)
  jsonToCSV(jsonData) {
    return this.toCSV(jsonData);
  }

  // Convert CSV to JSON (generic)
  csvToJSON(csvString) {
    return this.parseCSV(csvString);
  }
}

// Create singleton instance
export const csvHandler = new CSVHandler();
