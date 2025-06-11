from flask import Blueprint, render_template, request, flash, redirect, url_for, session, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from models import ContactMessage, EmailLog
from app import db
import logging

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
logger = logging.getLogger(__name__)

def admin_required(f):
    """Decorator to require admin authentication"""
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            flash('يرجى تسجيل الدخول للوصول للوحة الإدارة', 'error')
            return redirect(url_for('admin.login'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login page"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Simple admin authentication (in production, use proper user management)
        from flask import current_app
        admin_email = current_app.config.get('ADMIN_EMAIL')
        admin_password = current_app.config.get('ADMIN_PASSWORD')
        
        if email == admin_email and password == admin_password:
            session['admin_logged_in'] = True
            session['admin_email'] = email
            flash('تم تسجيل الدخول بنجاح', 'success')
            return redirect(url_for('admin.dashboard'))
        else:
            flash('بيانات الدخول غير صحيحة', 'error')
    
    return render_template('admin/login.html')

@admin_bp.route('/logout')
def logout():
    """Admin logout"""
    session.pop('admin_logged_in', None)
    session.pop('admin_email', None)
    flash('تم تسجيل الخروج بنجاح', 'success')
    return redirect(url_for('index'))

@admin_bp.route('/')
@admin_bp.route('/dashboard')
@admin_required
def dashboard():
    """Admin dashboard"""
    # Get statistics
    total_messages = ContactMessage.query.count()
    unread_messages = ContactMessage.query.filter_by(is_read=False).count()
    replied_messages = ContactMessage.query.filter_by(is_replied=True).count()
    
    # Get recent messages
    recent_messages = ContactMessage.query.order_by(
        ContactMessage.created_at.desc()
    ).limit(5).all()
    
    # Get email statistics
    total_emails = EmailLog.query.count()
    failed_emails = EmailLog.query.filter_by(status='failed').count()
    
    stats = {
        'total_messages': total_messages,
        'unread_messages': unread_messages,
        'replied_messages': replied_messages,
        'total_emails': total_emails,
        'failed_emails': failed_emails
    }
    
    return render_template('admin/dashboard.html', 
                         stats=stats, 
                         recent_messages=recent_messages)

@admin_bp.route('/messages')
@admin_required
def messages():
    """View all contact messages"""
    page = request.args.get('page', 1, type=int)
    status_filter = request.args.get('status', 'all')
    
    query = ContactMessage.query
    
    # Apply filters
    if status_filter == 'unread':
        query = query.filter_by(is_read=False)
    elif status_filter == 'read':
        query = query.filter_by(is_read=True)
    elif status_filter == 'replied':
        query = query.filter_by(is_replied=True)
    
    # Paginate results
    messages = query.order_by(ContactMessage.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('admin/messages.html', 
                         messages=messages, 
                         status_filter=status_filter)

@admin_bp.route('/message/<int:message_id>')
@admin_required
def view_message(message_id):
    """View individual message"""
    message = ContactMessage.query.get_or_404(message_id)
    
    # Mark as read
    if not message.is_read:
        message.is_read = True
        db.session.commit()
    
    return render_template('admin/view_message.html', message=message)

@admin_bp.route('/message/<int:message_id>/mark-replied', methods=['POST'])
@admin_required
def mark_replied(message_id):
    """Mark message as replied"""
    message = ContactMessage.query.get_or_404(message_id)
    message.is_replied = True
    db.session.commit()
    
    flash('تم تحديد الرسالة كمُجاب عليها', 'success')
    return redirect(url_for('admin.view_message', message_id=message_id))

@admin_bp.route('/api/stats')
@admin_required
def api_stats():
    """API endpoint for dashboard statistics"""
    total_messages = ContactMessage.query.count()
    unread_messages = ContactMessage.query.filter_by(is_read=False).count()
    
    return jsonify({
        'total_messages': total_messages,
        'unread_messages': unread_messages
    })
