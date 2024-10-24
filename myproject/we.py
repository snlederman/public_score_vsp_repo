import pyheif
from PIL import Image
import pytesseract
import re

# Set the path to Tesseract (if necessary, you can update this path based on your environment)
pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'  # Update this path based on your Tesseract installation

# Path to the HEIC image
image_path = 'IMG_6361.HEIC'

# Convert HEIC to a compatible format (JPEG)
heif_file = pyheif.read(image_path)
image = Image.frombytes(
    heif_file.mode,
    heif_file.size,
    heif_file.data,
    "raw",
    heif_file.mode,
    heif_file.stride
)

# Convert to RGB mode (if necessary) and save as JPEG
image = image.convert("RGB")

# Use pytesseract to extract text from the image
extracted_text = pytesseract.image_to_string(image)

# Split the extracted text into lines
lines = extracted_text.splitlines()

# Function to filter only code and text cells, and fix common OCR issues
def filter_code_text(lines):
    filtered_lines = []
    is_code_block = False

    for line in lines:
        line = line.strip()

        # Ignore blank lines and unrelated content with too many special symbols
        if not line or re.search(r'[^a-zA-Z0-9_#()=:., ]+', line):
            continue

        # Fix common OCR issues (e.g., "u from" should be "from", "1 import" should be "import")
        line = re.sub(r'^\d+ ', '', line)  # Remove line numbers
        line = re.sub(r'^\w ', '', line)  # Remove single character at the start (common OCR issue)

        # Fix incorrect capitalizations (e.g., "Import" should be "import")
        line = re.sub(r'\bImport\b', 'import', line)

        # Detect code blocks with typical code patterns
        if line.startswith('!') or line.startswith('%') or re.search(r'\b(import|from|def|class)\b', line):
            filtered_lines.append(line)

    return filtered_lines

# Filter out unnecessary lines (code/text cells)
filtered_lines = filter_code_text(lines)

# Join and print the filtered lines
print("\n".join(filtered_lines))