---
name: testing-pharmaqo-labels
description: Test the PharmaQo label editor, PDF exports with embedded template background, and Python batch QR overlay script. Use when verifying label system changes.
---

# Testing PharmaQo Label System

## Prerequisites

1. Start dev server: `npm run dev` (port 3000)
2. Seed database if needed: `npx prisma db push && npx tsx prisma/seed.ts`
3. Login as admin: `admin@pharmaqo.com` / `admin123`
4. Navigate to Admin > Etiquetas

## Devin Secrets Needed

None - uses local SQLite database with seeded credentials.

## Testing the Label Editor

1. **Open editor**: Click any product card on the Etiquetas page
2. **Verify template**: Canvas should show Anadrol template image (1024x512) as background
3. **Verify layers**: Left sidebar should list 21 default fields
4. **Test drag**: Click and drag elements - threshold is 5px to prevent accidental moves
5. **Test rotation**: Select element, use rotation slider in properties panel
6. **Test multi-select**: Shift+click multiple elements, drag should move all together
7. **Test text wrapping**: Set width on a text element, text should wrap within bounds
8. **Test resize handles**: Select text element, drag corner/edge handles to resize

## Testing PDF Exports

### Key indicator: PDF file size
- **With template background**: ~300-340 KB per label page
- **Without template (broken)**: ~5-13 KB per label page
- If PDFs are very small, the `embedTemplateBackground()` function is likely failing silently

### Verify template image path first
- Navigate to `http://localhost:3000/images/anadrol-template.png`
- Should load the 1024x512 Anadrol template image
- If 404, all PDF exports will fall back to no background

### Export functions to test
1. **exportEditorPDF** ("Exportar PDF" button in editor toolbar): Single label PDF
2. **massExportPDF** ("PDF em Massa" button on list view): Multi-page PDF, one label per page
3. **massExportZIP** ("ZIP em Massa" button on list view): ZIP of individual PDFs
4. **exportPDF** ("Exportar PDF" button on list view): 2x5 grid of labels

### For mass exports, generate codes first
- Click "Gerar 10 Codigos em Massa" in the sidebar
- This creates 10 unique PHQ-{PRODUCT}-{8CHARS} codes
- Mass exports use these codes for unique labels per page

## Testing Python Batch QR Overlay Script

### Setup
```bash
pip install Pillow qrcode[pil]
cd scripts/
```

### Test modes
```bash
# Generate N random codes
python gerar_rotulos.py --gerar-qr --quantidade 5 --produto "ANADROL"

# Import from CSV
echo -e "PHQ-TEST-AAAA1111\nPHQ-TEST-BBBB2222" > codes.csv
python gerar_rotulos.py --gerar-qr --arquivo codes.csv

# Comma-separated codes
python gerar_rotulos.py --gerar-qr --codigos "PHQ-TEST-AAAA1111,PHQ-TEST-BBBB2222"
```

### Verify output
- QR code PNGs in `scripts/qrcodes_entrada/`
- PDF at `scripts/rotulos_finalizados/todos_os_rotulos.pdf`
- PDF should have N pages (one per QR code)
- Each page shows base.png template with QR overlaid at position (880, 230)

## Common Issues

- **Category object crash**: If clicking a product card crashes with "Objects are not valid as React child", the `openEditorForProduct` function may be setting `product.category` (an object) directly instead of `product.category?.name`
- **Blank PDFs**: Check browser console for fetch errors on `/images/anadrol-template.png`. The `embedTemplateBackground` catch block swallows errors silently.
- **QR codes not updating**: The QR code preview depends on a `useEffect` watching the UID field. If the UID field text doesn't change, QR won't regenerate.
- **Python script missing dependencies**: Run `pip install Pillow qrcode[pil]` before using the script.
