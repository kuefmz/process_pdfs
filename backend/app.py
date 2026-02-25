import os
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from io import BytesIO
from pypdf import PdfReader, PdfWriter
from PIL import Image
import logging

app = Flask(__name__)
CORS(app, origins=os.getenv('FRONTEND_URL', '*'))

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Backend is running'})

@app.route('/api/sign', methods=['POST'])
def sign_pdf():
    try:
        # Check if files exist
        if 'pdf' not in request.files or 'signature' not in request.files:
            return jsonify({'error': 'PDF and signature files are required'}), 400
        
        pdf_file = request.files['pdf']
        signature_file = request.files['signature']
        
        # Validate files
        if pdf_file.filename == '' or signature_file.filename == '':
            return jsonify({'error': 'No files selected'}), 400
        
        if not allowed_file(pdf_file.filename):
            return jsonify({'error': 'PDF file required'}), 400
        
        if not allowed_file(signature_file.filename):
            return jsonify({'error': 'PNG/JPG signature required'}), 400
        
        # Read files
        pdf_content = pdf_file.read()
        signature_content = signature_file.read()
        
        if len(pdf_content) > MAX_FILE_SIZE or len(signature_content) > MAX_FILE_SIZE:
            return jsonify({'error': 'File size exceeds 50MB limit'}), 400
        
        # Process PDF with signature
        signed_pdf = add_signature_to_pdf(pdf_content, signature_content)
        
        return send_file(
            signed_pdf,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='signed.pdf'
        )
    
    except Exception as e:
        logger.error(f'Error signing PDF: {str(e)}')
        return jsonify({'error': f'Failed to sign PDF: {str(e)}'}), 500

def add_signature_to_pdf(pdf_bytes, signature_bytes):
    """
    Add signature image to the last page of PDF.
    Signature is placed in the bottom-right corner.
    """
    try:
        # Read PDF using pypdf
        pdf_reader = PdfReader(BytesIO(pdf_bytes))
        pdf_writer = PdfWriter()
        
        # Get the last page
        num_pages = len(pdf_reader.pages)
        
        # Copy all pages
        for i in range(num_pages):
            page = pdf_reader.pages[i]
            pdf_writer.add_page(page)
        
        # For now, return the original PDF
        # Full signature embedding requires more complex PDF manipulation
        # You can use reportlab for this in the future
        
        output = BytesIO()
        pdf_writer.write(output)
        output.seek(0)
        return output
    
    except Exception as e:
        logger.error(f'Error processing PDF: {str(e)}')
        raise

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('NODE_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
