/**
 * Utility functions for print functionality
 */

export const addPrintStyles = (printContentId: string) => {
  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      #${printContentId}, #${printContentId} * { visibility: visible; }
      #${printContentId} { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
      .print\\:block { display: block !important; }
      .hidden { display: none; }
      .print\\:block.hidden { display: block !important; }
      
      /* Ensure proper page breaks */
      .page-break-before { page-break-before: always; }
      .page-break-after { page-break-after: always; }
      .page-break-inside-avoid { page-break-inside: avoid; }
      
      /* Print-specific styling */
      body { 
        margin: 0; 
        font-size: 12px;
        line-height: 1.4;
        color: black !important;
        background: white !important;
      }
      
      /* Hide form controls */
      input[type="date"]::-webkit-calendar-picker-indicator,
      input[type="date"]::-webkit-inner-spin-button,
      input[type="date"]::-webkit-clear-button,
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        display: none !important;
        -webkit-appearance: none;
      }
      
      input, textarea, select {
        color: black !important;
        background: white !important;
        border: 1px solid #ccc !important;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }
      
      /* Table styling for print */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      
      th, td {
        border: 1px solid #333;
        padding: 4px 6px;
        text-align: left;
        font-size: 10px;
      }
      
      th {
        background-color: #f0f0f0 !important;
        font-weight: bold;
      }
      
      /* Signature boxes */
      .signature-box {
        border: 1px solid #333;
        height: 50px;
        margin-top: 5px;
      }
      
      /* Enhanced signature styling */
      .print-signature-field {
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      
      .print-signature-field .signature-container {
        border: 2px solid #000;
        height: 60px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
      }
      
      .print-signature-field img {
        max-height: 55px;
        max-width: 100%;
        object-fit: contain;
      }
      
      .print-signature-field .signature-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 5px;
        font-size: 10px;
      }
      
      .print-signature-field .signature-line {
        border-bottom: 1px solid #333;
        padding-bottom: 2px;
        min-height: 15px;
      }
      
      .print-signatures {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 20px;
        page-break-inside: avoid;
      }
      
      /* Section styling */
      .section {
        margin-bottom: 15px;
        page-break-inside: avoid;
      }
      
      .section h3 {
        border-bottom: 1px solid #333;
        padding-bottom: 3px;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: bold;
      }
      
      /* Grid layouts for print */
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      
      .field {
        margin-bottom: 6px;
      }
      
      .field-label {
        font-weight: bold;
        margin-bottom: 2px;
        font-size: 11px;
      }
      
      .field-value {
        margin-left: 8px;
        font-size: 11px;
      }
    }
  `
  
  const styleSheet = document.createElement('style')
  styleSheet.type = 'text/css'
  styleSheet.innerText = printStyles
  document.head.appendChild(styleSheet)
  
  return styleSheet
}

export const removePrintStyles = (styleSheet: HTMLStyleElement) => {
  if (styleSheet && document.head.contains(styleSheet)) {
    document.head.removeChild(styleSheet)
  }
}

export const createPrintWindow = (content: string, title: string) => {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
              line-height: 1.4;
              color: black;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .header h1 {
              font-size: 18px;
              margin-bottom: 5px;
            }
            .header h2 {
              font-size: 14px;
              margin-bottom: 5px;
              color: #666;
            }
            .header h3 {
              font-size: 12px;
              margin-bottom: 10px;
            }
            .section { 
              margin-bottom: 20px; 
              page-break-inside: avoid; 
            }
            .section h3 { 
              border-bottom: 1px solid #333; 
              padding-bottom: 5px; 
              margin-bottom: 10px;
              font-size: 14px;
              font-weight: bold;
            }
            .grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
            }
            .field { 
              margin-bottom: 8px; 
            }
            .field-label { 
              font-weight: bold; 
              margin-bottom: 2px; 
            }
            .field-value { 
              margin-left: 10px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            th, td { 
              border: 1px solid #333; 
              padding: 6px; 
              text-align: left; 
              font-size: 11px; 
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold; 
            }
            .signature-section { 
              margin-top: 30px; 
            }
            .signature-box { 
              border: 1px solid #333; 
              height: 60px; 
              margin-top: 10px; 
            }
            .check-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .check-item {
              display: flex;
              justify-content: space-between;
              padding: 5px;
              border: 1px solid #ddd;
              font-size: 10px;
            }
            .totals {
              margin-top: 20px;
            }
            .totals table {
              width: 300px;
              margin-left: auto;
            }
            .grand-total {
              font-weight: bold;
              font-size: 1.1em;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }
}

export const handleDefaultPrint = (printContentId: string, title: string) => {
  const printContent = document.getElementById(printContentId)
  if (printContent) {
    createPrintWindow(printContent.innerHTML, title)
  }
}