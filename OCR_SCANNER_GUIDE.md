# 📷 Enhanced OCR Scanner Guide

## Overview
The enhanced OCR (Optical Character Recognition) scanner allows you to automatically extract expense information from receipt images and add them to your expense tracker.

## Features

### 🖼️ Image Upload
- **Drag & Drop**: Simply drag and drop receipt images onto the upload area
- **Click to Upload**: Click the upload area to browse and select images
- **Supported Formats**: JPG, PNG, GIF, BMP
- **File Size Limit**: Maximum 10MB per image

### 🔍 Smart Text Extraction
The OCR scanner automatically extracts:
- **Amount**: Detects currency amounts in various formats (₹, RS, INR)
- **Date**: Identifies dates in multiple formats (DD/MM/YYYY, MM/DD/YYYY, etc.)
- **Merchant**: Extracts business names from receipt headers
- **Category**: Automatically categorizes expenses based on keywords

### 📊 Automatic Categorization
The scanner recognizes these categories based on receipt content:
- **Food & Dining**: grocery, food, restaurant, cafe
- **Transportation**: fuel, petrol, gas, transport
- **Healthcare**: medical, pharmacy, hospital, clinic
- **Shopping**: clothing, fashion, apparel, shopping
- **Utilities**: utility, electricity, water, bill
- **Entertainment**: entertainment, movie, game
- **Education**: education, course, book
- **General**: Default category for unrecognized expenses

### ✏️ Manual Editing
Before adding to expenses, you can:
- Review and edit extracted amounts
- Modify dates
- Update merchant names
- Change categories
- Add custom notes

### 📱 User Experience
- **Progress Tracking**: Real-time OCR progress indicator
- **Image Preview**: See the uploaded receipt image
- **Error Handling**: Clear error messages for failed scans
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### 1. Access the OCR Scanner
- Navigate to the OCR tab in your expense tracker
- Or use the OCR section on the dashboard

### 2. Upload a Receipt
- **Option A**: Drag and drop a receipt image onto the upload area
- **Option B**: Click the upload area to browse and select an image

### 3. Wait for Processing
- The scanner will process your image with a progress indicator
- This may take a few seconds depending on image quality and size

### 4. Review Extracted Data
- Check the automatically extracted information
- Edit any fields that need correction
- Verify the amount, date, and category

### 5. Add to Expenses
- Click "Add to Expenses" to save the transaction
- The receipt will be added to your expense history
- You can reset and scan another receipt if needed

## Tips for Best Results

### 📸 Image Quality
- **High Resolution**: Use clear, high-resolution images
- **Good Lighting**: Ensure the receipt is well-lit
- **Flat Surface**: Place receipt on a flat surface when photographing
- **Avoid Glare**: Minimize reflections and shadows

### 🧾 Receipt Types
- **Printed Receipts**: Work best with OCR
- **Handwritten Receipts**: May have lower accuracy
- **Digital Receipts**: Screenshots work well
- **Faded Receipts**: May not scan properly

### 🔧 Troubleshooting
- **Amount Not Detected**: Check if the amount is clearly visible
- **Poor Text Quality**: Try a different image or better lighting
- **Large File Size**: Compress the image before uploading
- **Unsupported Format**: Convert to JPG or PNG format

## Technical Details

### OCR Engine
- **Tesseract.js**: Open-source OCR engine
- **Language Support**: English (eng)
- **Processing**: Client-side processing for privacy

### Data Extraction
- **Regex Patterns**: Multiple patterns for amount and date detection
- **Keyword Matching**: Intelligent category detection
- **Fallback Values**: Default values when extraction fails

### Integration
- **API Compatible**: Works with existing expense tracker API
- **Transaction Format**: Standard expense transaction structure
- **Real-time Updates**: Immediately reflects in expense history

## Privacy & Security
- **Local Processing**: OCR processing happens in your browser
- **No Upload**: Images are not sent to external servers
- **Data Control**: You control what information is extracted and saved

## Future Enhancements
Potential improvements for future versions:
- **Multi-language Support**: Additional language recognition
- **Receipt Storage**: Save receipt images with transactions
- **Batch Processing**: Scan multiple receipts at once
- **Advanced Categorization**: Machine learning-based categorization
- **Export Options**: Export scanned data to various formats

---

**Note**: The OCR scanner works best with clear, well-lit images of printed receipts. For best results, ensure your receipt is clearly visible and the text is readable.


