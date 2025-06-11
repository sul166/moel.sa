import os
from flask import Flask, render_template, request, flash, redirect, url_for
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-for-moel-legal")

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
    """Contact page route with form handling"""
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        message = request.form.get('message')
        
        # Basic validation
        if not name or not email or not message:
            flash('جميع الحقول المطلوبة يجب ملؤها', 'error')
        else:
            # In a real application, you would save this to a database or send an email
            flash('تم إرسال رسالتك بنجاح. سنتواصل معك قريباً', 'success')
            app.logger.info(f"Contact form submitted: {name}, {email}, {phone}")
            return redirect(url_for('contact'))
    
    return render_template('contact.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
