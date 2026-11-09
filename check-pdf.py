"""Optional independent validation after `npm run test:invoices`.
Requires: pip install pypdf pymupdf
"""
from pathlib import Path
from pypdf import PdfReader
import pymupdf

root = Path(__file__).resolve().parent
files = sorted((root / 'results').glob('invoice-*.pdf'))
assert len(files) == 8, 'Run the invoice suite first; eight PDFs are expected.'
for file in files:
    pdf = PdfReader(file)
    texts = [page.extract_text() for page in pdf.pages]
    text = '\n'.join(texts)
    assert 'Balance due' in text and 'NS-2026' in text
    assert 'YOUR WORKSPACE' not in text
    for index, page in enumerate(pdf.pages):
        assert abs(float(page.mediabox.width) - 595.28) < 2
        assert abs(float(page.mediabox.height) - 841.89) < 2
        assert f'Page {index + 1} of {len(pdf.pages)}' in texts[index]
        assert 'Invoice NS-2026' in texts[index]
    if file.name == 'invoice-standard.pdf':
        assert len(pdf.pages) == 1
        assert '€1,368.00' in text and '€968.00' in text
    if file.name == 'invoice-split.pdf':
        assert '₹1,345.20' in text
    if file.name == 'invoice-kwd.pdf':
        assert '0.001' in text
    if file.name == 'invoice-multipage.pdf':
        assert len(pdf.pages) > 1
        assert 'Service item 70' in text and 'END-OF-INVOICE' in text
        assert all('DESCRIPTION' in page for page in texts[:-1])
    elif file.name != 'invoice-long-token.pdf':
        assert len(pdf.pages) == 1
    print(f'PASS {file.name}: {len(pdf.pages)} A4 page(s)')

with pymupdf.open(root.parent / 'docs/sample-invoice.pdf') as pdf:
    pdf[0].get_pixmap(matrix=pymupdf.Matrix(1.4, 1.4)).save(root / 'results/invoice-print-checked.png')
print('Invoice reference, pagination, symbols, totals and closing content verified.')
