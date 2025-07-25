"""
loan_report.py - Generate PDF reports for loan decisions

This module provides functions to generate PDF reports for loan decisions.
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import io
import datetime
import os
from pathlib import Path
import re

def generate_loan_report(application_data, prediction_result, explanation_text):
    """
    Generate a PDF loan decision report.
    
    Args:
        application_data (dict): Loan application data
        prediction_result (dict): Prediction result data
        explanation_text (str): Explanation text generated by the explanation system
        
    Returns:
        bytes: PDF file as bytes
    """
    # Create a file-like buffer to receive PDF data
    buffer = io.BytesIO()
    
    # Create the PDF object using the buffer as its "file"
    doc = SimpleDocTemplate(buffer, pagesize=letter, title="BiasShield Loan Decision Report")
    
    # Create styles
    styles = getSampleStyleSheet()
    title_style = styles['Title']
    heading1_style = styles['Heading1']
    heading2_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # Create custom styles
    header_style = ParagraphStyle(
        'Header',
        parent=normal_style,
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=colors.gray
    )
    
    bold_style = ParagraphStyle(
        'Bold',
        parent=normal_style,
        fontName='Helvetica-Bold'
    )
    
    # Create content
    content = []
    
    # Try to add logo if it exists
    logo_path = Path(__file__).parent.parent / 'frontend' / 'public' / 'logo.png'
    if os.path.exists(logo_path):
        logo = Image(logo_path, width=200, height=50)
        content.append(logo)
        content.append(Spacer(1, 12))
    
    # Add title and date
    content.append(Paragraph("BiasShield Loan Decision Report", title_style))
    content.append(Spacer(1, 12))
    
    # Add date
    today = datetime.datetime.now().strftime("%B %d, %Y")
    content.append(Paragraph(f"Generated on: {today}", normal_style))
    content.append(Spacer(1, 24))
    
    # Add decision summary
    approved = prediction_result.get('approved', False)
    approval_probability = prediction_result.get('approval_probability', 0) * 100
    
    decision_color = colors.green if approved else colors.red
    decision_text = "APPROVED" if approved else "DENIED"
    
    decision_style = ParagraphStyle(
        'Decision',
        parent=heading1_style,
        textColor=decision_color
    )
    
    content.append(Paragraph(f"Loan Application: {decision_text}", decision_style))
    content.append(Paragraph(f"Approval Probability: {approval_probability:.1f}%", bold_style))
    content.append(Spacer(1, 24))
    
    # Add applicant information
    content.append(Paragraph("Applicant Information", heading2_style))
    content.append(Spacer(1, 12))
    
    applicant_data = [
        ['Field', 'Value'],
        ['Name', 'Applicant'],  # In a real app, this would be the actual name
        ['Gender', application_data.get('gender', 'N/A')],
        ['Race', application_data.get('race', 'N/A')],
        ['Age', str(application_data.get('age', 'N/A'))],
        ['Income', f"${application_data.get('income', 0):,.2f}"],
        ['Credit Score', str(application_data.get('credit_score', 'N/A'))],
        ['Loan Amount', f"${application_data.get('loan_amount', 0):,.2f}"],
        ['Employment Type', application_data.get('employment_type', 'N/A')]
    ]
    
    applicant_table = Table(applicant_data, colWidths=[150, 300])
    applicant_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    content.append(applicant_table)
    content.append(Spacer(1, 24))
    
    # Add decision factors
    content.append(Paragraph("Decision Factors", heading2_style))
    content.append(Spacer(1, 12))
    
    explanation = prediction_result.get('explanation', {})
    factors = sorted(explanation.items(), key=lambda x: abs(x[1]), reverse=True)
    
    factor_data = [['Factor', 'Impact']]
    for factor, impact in factors:
        # Format factor name
        factor_name = factor.replace('_', ' ').title()
        factor_data.append([factor_name, f"{impact:.2f}"])
    
    factor_table = Table(factor_data, colWidths=[300, 150])
    factor_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    content.append(factor_table)
    content.append(Spacer(1, 24))
    
    # Add explanation
    content.append(Paragraph("Detailed Explanation", heading2_style))
    content.append(Spacer(1, 12))
    
    # Process explanation text - remove markdown formatting
    processed_text = explanation_text.replace('**', '')
    processed_text = processed_text.replace('*', '')  # Remove single asterisks as well
    
    # Format the explanation text for better readability in PDF
    paragraphs = []
    current_paragraph = []
    
    for line in processed_text.split('\n'):
        if line.strip():
            current_paragraph.append(line)
        else:
            if current_paragraph:
                paragraphs.append(' '.join(current_paragraph))
                current_paragraph = []
    
    if current_paragraph:
        paragraphs.append(' '.join(current_paragraph))
    
    # Add each paragraph to the PDF
    for paragraph in paragraphs:
        if paragraph.strip():
            content.append(Paragraph(paragraph, normal_style))
            content.append(Spacer(1, 12))
    
    # Add footer
    content.append(Spacer(1, 24))
    content.append(Paragraph("CONFIDENTIAL - FOR APPLICANT USE ONLY", header_style))
    content.append(Paragraph("BiasShield Decision System", header_style))
    
    # Build the PDF
    doc.build(content)
    
    # Get the value of the BytesIO buffer
    pdf = buffer.getvalue()
    buffer.close()
    
    return pdf
