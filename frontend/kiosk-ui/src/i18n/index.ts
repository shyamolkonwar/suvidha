import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            // Common
            'welcome': 'Welcome to SUVIDHA Kiosk',
            'login': 'Login',
            'logout': 'Logout',
            'register': 'Register',
            'submit': 'Submit',
            'cancel': 'Cancel',
            'back': 'Back',
            'next': 'Next',
            'home': 'Home',

            // Login
            'consumer_id': 'Consumer ID',
            'password': 'Password',
            'forgot_password': 'Forgot Password?',
            'login_success': 'Login successful',
            'login_failed': 'Login failed',

            // Dashboard
            'dashboard': 'Dashboard',
            'bills': 'Bills',
            'payments': 'Payments',
            'complaints': 'Complaints',
            'meter_reading': 'Meter Reading',
            'my_profile': 'My Profile',

            // Bills
            'electricity': 'Electricity',
            'gas': 'Gas',
            'water': 'Water',
            'amount_due': 'Amount Due',
            'due_date': 'Due Date',
            'status': 'Status',
            'pay_now': 'Pay Now',
            'view_bill': 'View Bill',

            // Payments
            'pay_bills': 'Pay Bills',
            'select_bills': 'Select Bills to Pay',
            'total_amount': 'Total Amount',
            'proceed_to_pay': 'Proceed to Pay',
            'payment_success': 'Payment Successful',
            'payment_failed': 'Payment Failed',
            'receipt': 'Receipt',
            'download_receipt': 'Download Receipt',

            // Complaints
            'file_complaint': 'File a Complaint',
            'complaint_subject': 'Subject',
            'complaint_description': 'Description',
            'complaint_category': 'Category',
            'priority': 'Priority',
            'my_complaints': 'My Complaints',
            'complaint_status': 'Status',

            // Meter Reading
            'submit_reading': 'Submit Meter Reading',
            'reading_value': 'Reading Value',
            'utility_type': 'Utility Type',
            'upload_photo': 'Upload Photo',
            'reading_history': 'Reading History',

            // Messages
            'loading': 'Loading...',
            'error': 'Error',
            'success': 'Success',
            'no_data': 'No data available',
        },
    },
    hi: {
        translation: {
            'welcome': 'SUVIDHA कियोस्क में आपका स्वागत है',
            'login': 'लॉग इन करें',
            'logout': 'लॉग आउट',
            'register': 'पंजीकरण करें',
            'submit': 'जमा करें',
            'cancel': 'रद्द करें',
            'back': 'वापस',
            'next': 'आगे',
            'home': 'होम',

            'consumer_id': 'उपभोक्ता आईडी',
            'password': 'पासवर्ड',
            'forgot_password': 'पासवर्ड भूल गए?',

            'dashboard': 'डैशबोर्ड',
            'bills': 'बिल',
            'payments': 'भुगतान',
            'complaints': 'शिकायत',
            'meter_reading': 'मीटर रीडिंग',
            'my_profile': 'मेरी प्रोफ़ाइल',

            'electricity': 'बिजली',
            'gas': 'गैस',
            'water': 'पानी',
            'amount_due': 'देय राशि',
            'due_date': 'नियत तारीख',
            'status': 'स्थिति',
            'pay_now': 'अभी भुगतान करें',

            'loading': 'लोड हो रहा है...',
            'error': 'त्रुटि',
            'success': 'सफलता',
            'no_data': 'कोई डेटा उपलब्ध नहीं',
        },
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
