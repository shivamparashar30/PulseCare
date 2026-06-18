import React from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface RazorpayWebCheckoutProps {
  amount: number; // in INR (not paise)
  razorpayKey: string;
  name: string;
  description: string;
  prefillEmail?: string;
  prefillContact?: string;
  themeColor?: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export default function RazorpayWebCheckout({
  amount,
  razorpayKey,
  name,
  description,
  prefillEmail = '',
  prefillContact = '',
  themeColor = '#0066CC',
  onSuccess,
  onCancel,
  onError,
}: RazorpayWebCheckoutProps) {
  const amountInPaise = Math.round(amount * 100);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <style>
        body {
          margin: 0; padding: 0;
          display: flex; justify-content: center; align-items: center;
          min-height: 100vh;
          background: #f7f9fc;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .loading {
          text-align: center; color: #64748B;
          font-size: 16px;
        }
        .loading p { margin-top: 12px; }
      </style>
    </head>
    <body>
      <div class="loading">
        <p>Opening payment gateway...</p>
      </div>
      <script>
        var options = {
          key: '${razorpayKey}',
          amount: ${amountInPaise},
          currency: 'INR',
          name: '${name.replace(/'/g, "\\'")}',
          description: '${description.replace(/'/g, "\\'")}',
          prefill: {
            email: '${prefillEmail}',
            contact: '${prefillContact}'
          },
          theme: { color: '${themeColor}' },
          handler: function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_SUCCESS',
              paymentId: response.razorpay_payment_id
            }));
          },
          modal: {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_CANCELLED'
              }));
            },
            escape: false,
            confirm_close: true
          }
        };

        try {
          var rzp = new Razorpay(options);
          rzp.on('payment.failed', function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_ERROR',
              error: response.error.description || 'Payment failed'
            }));
          });
          rzp.open();
        } catch(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_ERROR',
            error: e.message || 'Failed to initialize payment'
          }));
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PAYMENT_SUCCESS') {
        onSuccess(data.paymentId);
      } else if (data.type === 'PAYMENT_CANCELLED') {
        onCancel();
      } else if (data.type === 'PAYMENT_ERROR') {
        onError(data.error);
      }
    } catch (e) {
      onError('Unexpected error processing payment');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
          <Ionicons name="close" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.amountBadge}>
          <Text style={styles.amountText}>₹{amount}</Text>
        </View>
      </View>
      <WebView
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColor} />
            <Text style={styles.loadingText}>Loading payment gateway...</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  amountBadge: {
    backgroundColor: '#D1FAE5', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  amountText: { fontSize: 14, fontWeight: '800', color: '#047857' },
  webview: { flex: 1 },
  loadingContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f9fc',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
});
