import os
from flask import Flask, render_template, request, flash, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import datetime
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

# Set up logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-for-moel-legal")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "postgresql://localhost/moel_legal")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Configure Flask-Mail for Gmail SMTP
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.environ.get('GMAIL_USERNAME', 'your-email@gmail.com')
app.config['MAIL_PASSWORD'] = os.environ.get('GMAIL_PASSWORD', 'your-app-password')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('GMAIL_USERNAME', 'your-email@gmail.com')

# Admin email for notifications
app.config['ADMIN_EMAIL'] = os.environ.get('ADMIN_EMAIL', 'admin@moellegal.com')

# Initialize extensions
db.init_app(app)
mail = Mail(app)

# Import models after db initialization
from models import ContactMessage

# Custom template filter for line breaks
@app.template_filter('nl2br')
def nl2br_filter(text):
    """Convert newlines to HTML line breaks"""
    if text:
        return text.replace('\n', '<br>')
    return text

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    """Home page route"""
    return render_template('index.html')

@app.route('/services')
def services():
    """Services page route"""
    return render_template('services.html')

@app.route('/about')
def about():
    """About page route"""
    return render_template('about.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    """Contact page route with form handling and email sending"""
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        service_type = request.form.get('service_type', '').strip()
        message = request.form.get('message', '').strip()
        
        # Basic validation
        if not name or not email or not message:
            flash('جميع الحقول المطلوبة يجب ملؤها', 'error')
            return render_template('contact.html')
        
        try:
            # Save to database
            contact_message = ContactMessage(
                name=name,
                email=email,
                phone=phone,
                service_type=service_type,
                message=message,
                created_at=datetime.utcnow()
            )
            db.session.add(contact_message)
            db.session.commit()
            
            # Send emails
            send_admin_notification(contact_message)
            send_user_confirmation(contact_message)
            
            flash('تم إرسال رسالتك بنجاح. سنتواصل معك قريباً', 'success')
            app.logger.info(f"Contact form submitted successfully: {name}, {email}")
            
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error processing contact form: {str(e)}")
            flash('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى', 'error')
        
        return redirect(url_for('contact'))
    
    return render_template('contact.html')

@app.route('/admin/messages')
def admin_messages():
    """Admin route to view all contact messages"""
    try:
        # Get all messages ordered by newest first
        messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
        return render_template('admin_messages.html', messages=messages)
    except Exception as e:
        app.logger.error(f"Error fetching messages: {str(e)}")
        flash('حدث خطأ أثناء تحميل الرسائل', 'error')
        return redirect(url_for('index'))

@app.route('/admin/message/<int:message_id>/read')
def mark_message_read(message_id):
    """Mark a message as read"""
    try:
        message = ContactMessage.query.get_or_404(message_id)
        message.is_read = True
        db.session.commit()
        flash('تم وضع علامة مقروء على الرسالة', 'success')
    except Exception as e:
        app.logger.error(f"Error marking message as read: {str(e)}")
        flash('حدث خطأ', 'error')
    
    return redirect(url_for('admin_messages'))

def send_admin_notification(contact_message):
    """Send email notification to admin about new contact message"""
    try:
        # Create email content
        subject = f"رسالة جديدة من {contact_message.name} - موقع موئل"
        
        # Create HTML email
        html_body = render_template('email/admin_notification.html', 
                                  contact=contact_message)
        
        # Send email using Gmail SMTP
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = app.config['MAIL_DEFAULT_SENDER']
        msg['To'] = app.config['ADMIN_EMAIL']
        
        html_part = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Connect to Gmail SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        
        # Send email
        text = msg.as_string()
        server.sendmail(app.config['MAIL_DEFAULT_SENDER'], app.config['ADMIN_EMAIL'], text)
        server.quit()
        
        app.logger.info(f"Admin notification email sent for contact from {contact_message.email}")
        
    except Exception as e:
        app.logger.error(f"Failed to send admin notification email: {str(e)}")

def send_user_confirmation(contact_message):
    """Send confirmation email to user"""
    try:
        # Create email content
        subject = "تأكيد استلام رسالتك - موئل للتمثيل القانوني"
        
        # Create HTML email
        html_body = render_template('email/user_confirmation.html', 
                                  contact=contact_message)
        
        # Send email using Gmail SMTP
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = app.config['MAIL_DEFAULT_SENDER']
        msg['To'] = contact_message.email
        
        html_part = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Connect to Gmail SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        
        # Send email
        text = msg.as_string()
        server.sendmail(app.config['MAIL_DEFAULT_SENDER'], contact_message.email, text)
        server.quit()
        
        app.logger.info(f"User confirmation email sent to {contact_message.email}")
        
    except Exception as e:
        app.logger.error(f"Failed to send user confirmation email: {str(e)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
