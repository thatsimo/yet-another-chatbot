import fitz  # PyMuPDF
import pandas as pd
from lxml import etree
from io import BytesIO

def parse_pdf_bytes(data: bytes) -> str:
    """Extract text from PDF bytes."""
    doc = fitz.open(stream=data, filetype='pdf')
    return "\n".join(page.get_text() for page in doc)


def parse_excel_bytes(data: bytes) -> str:
    """Extract text from Excel bytes."""
    df = pd.read_excel(BytesIO(data))
    return df.to_string()


def parse_xml_bytes(data: bytes) -> str:
    """Extract text from XML bytes."""
    tree = etree.fromstring(data)
    return " ".join(tree.xpath('//text()'))
