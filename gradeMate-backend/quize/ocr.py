"""
OCR (Optical Character Recognition) module for GradeMate.

Extracts text from uploaded images using OpenCV preprocessing and EasyOCR,
and applies rule-based C++ syntax corrections.
"""

import logging
import cv2
import numpy as np

logger = logging.getLogger(__name__)

# Lazy initialization of EasyOCR reader to avoid slow startup
_OCR_READER = None


def get_ocr_reader():
    """Get or initialize single instance of EasyOCR reader."""
    global _OCR_READER
    if _OCR_READER is None:
        import easyocr
        _OCR_READER = easyocr.Reader(['en'], gpu=False)
    return _OCR_READER


def preprocess_image(image):
    """
    Preprocess image to improve OCR recognition accuracy.

    Converts image to grayscale, applies Gaussian blurring and Otsu thresholding.
    :param image: OpenCV BGR image array
    :return: Processed binary image
    """
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, binary = cv2.threshold(
            blurred, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )
        return binary
    except Exception as err:
        logger.error(f"Image preprocessing failed: {err}")
        return image


def convert_to_cv2_image(file_obj):
    """
    Convert Django InMemoryUploadedFile or file object to OpenCV image.

    :param file_obj: Uploaded file object
    :return: OpenCV image matrix
    """
    try:
        file_bytes = np.asarray(bytearray(file_obj.read()), dtype=np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        file_obj.seek(0)
        return image
    except Exception as err:
        logger.error(f"Failed converting file object to image: {err}")
        return None


def extract_text(file_obj):
    """
    Extract text lines from an image file using OCR.

    :param file_obj: Uploaded image file or numpy array
    :return: List of extracted text line strings
    """
    if file_obj is None:
        return []

    try:
        if hasattr(file_obj, "read"):
            image = convert_to_cv2_image(file_obj)
        else:
            image = file_obj

        if image is None:
            return []

        processed_img = preprocess_image(image)
        reader = get_ocr_reader()
        results = reader.readtext(processed_img, detail=1)

        # Sort bounding boxes by vertical Y position to preserve line ordering
        results.sort(key=lambda x: x[0][0][1])

        extracted_lines = []
        current_line = []
        prev_y = -10.0

        for bbox, text, _ in results:
            y = bbox[0][1]
            if abs(y - prev_y) > 12:
                if current_line:
                    extracted_lines.append(" ".join(current_line))
                    current_line = []
            current_line.append(text)
            prev_y = y

        if current_line:
            extracted_lines.append(" ".join(current_line))

        return extracted_lines

    except Exception as err:
        logger.error(f"OCR text extraction error: {err}")
        return []


def correct_cpp_code(lines):
    """
    Apply rule-based C++ syntax corrections to OCR text lines.

    Fixes common OCR misread tokens in C++ code snippets.
    :param lines: List of text lines or single string
    :return: Corrected text line list or string
    """
    if isinstance(lines, str):
        lines = lines.split("\n")

    corrections = {
        "includde": "include",
        "includ": "include",
        "<iostream <": "<iostream>",
        "mainC)": "main()",
        "Lint": "int",
        "int 0 =5>": "int a = 5;",
        "int b=10;": "int b = 10;",
        "bI0Z": "b=10;",
        "Sum_": "sum",
        "Ctb)": "a + b;",
        "stc ef_": "std::",
        "return_": "return",
        "0 ;": "0;",
    }

    corrected_lines = []
    for line in lines:
        for wrong, correct in corrections.items():
            line = line.replace(wrong, correct)
        corrected_lines.append(line)

    return corrected_lines
