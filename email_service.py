import logging
from flask import current_app, render_template
from flask_mail import Message
from app import mail, db
from models import EmailLog

logger = logging.getLogger(__name__)

class EmailService:
    """Service class for handling email operations"""
    
    @staticmethod
    def send_contact_notification(contact_message):
        """Send notification email to admin about new contact message"""
        try:
            subject = f"رسالة جديدة من موقع موئل - {contact_message.name}"
            
            # Create message
            msg = Message(
                subject=subject,
                recipients=[current_app.config['ADMIN_EMAIL']],
                html=render_template('email/contact_notification.html', 
                                   message=contact_message),
                charset='utf-8'
            )
            
            # Send email
            mail.send(msg)
            
            # Log success
            EmailService._log_email(
                contact_message_id=contact_message.id,
                recipient_email=current_app.config['ADMIN_EMAIL'],
                email_type='notification',
                subject=subject,
                status='sent'
            )
            
            # Update contact message
            contact_message.email_sent = True
            db.session.commit()
            
            logger.info(f"Contact notification sent successfully to {current_app.config['ADMIN_EMAIL']}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send contact notification: {str(e)}")
            
            # Log failure
            EmailService._log_email(
                contact_message_id=contact_message.id,
                recipient_email=current_app.config['ADMIN_EMAIL'],
                email_type='notification',
                subject=subject if 'subject' in locals() else 'رسالة جديدة من موقع موئل',
                status='failed',
                error_message=str(e)
            )
            
            return False
    
    @staticmethod
    def send_welcome_email(contact_message):
        """Send welcome/confirmation email to the person who contacted us"""
        try:
            subject = "شكراً لتواصلك مع موئل للتمثيل القانوني"
            
            # Create message
            msg = Message(
                subject=subject,
                recipients=[contact_message.email],
                html=render_template('email/welcome_message.html', 
                                   message=contact_message),
                charset='utf-8'
            )
            
            # Send email
            mail.send(msg)
            
            # Log success
            EmailService._log_email(
                contact_message_id=contact_message.id,
                recipient_email=contact_message.email,
                email_type='welcome',
                subject=subject,
                status='sent'
            )
            
            # Update contact message
            contact_message.welcome_email_sent = True
            db.session.commit()
            
            logger.info(f"Welcome email sent successfully to {contact_message.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email: {str(e)}")
            
            # Log failure
            EmailService._log_email(
                contact_message_id=contact_message.id,
                recipient_email=contact_message.email,
                email_type='welcome',
                subject=subject if 'subject' in locals() else 'شكراً لتواصلك مع موئل للتمثيل القانوني',
                status='failed',
                error_message=str(e)
            )
            
            return False
    
    @staticmethod
    def _log_email(contact_message_id, recipient_email, email_type, subject, status, error_message=None):
        """Log email sending attempt"""
        try:
            email_log = EmailLog(
                contact_message_id=contact_message_id,
                recipient_email=recipient_email,
                email_type=email_type,
                subject=subject,
                status=status,
                error_message=error_message
            )
            db.session.add(email_log)
            db.session.commit()
        except Exception as e:
            logger.error(f"Failed to log email: {str(e)}")
