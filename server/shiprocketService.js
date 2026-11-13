/**
 * ==============================================================================
 * ALEEZ PERFUMES - SHIPROCKET LOGISTICS & DELIVERY INTEGRATION
 * Handles automated courier allocation, AWB generation, and tracking across India.
 * ==============================================================================
 */

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Get Shiprocket Bearer Authentication Token
 */
export async function getShiprocketToken(credentials = {}) {
  const email = credentials.email || process.env.SHIPROCKET_EMAIL;
  const password = credentials.password || process.env.SHIPROCKET_PASSWORD;

  if (!email || !password || email.includes('example.com') || password.includes('your_password')) {
    return { token: null, isMock: true, reason: 'Credentials not configured' };
  }

  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return { token: cachedToken, isMock: false };
  }

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn('Shiprocket auth failed:', err);
      return { token: null, isMock: true, error: err.message || 'Authentication rejected' };
    }

    const data = await response.json();
    cachedToken = data.token;
    // Cache token for 9 days (Shiprocket tokens expire in 10 days)
    tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
    return { token: cachedToken, isMock: false };
  } catch (err) {
    console.error('Shiprocket network auth error:', err.message);
    return { token: null, isMock: true, error: err.message };
  }
}

/**
 * Create a new Shiprocket Adhoc Order for Delhivery/BlueDart Surface Delivery
 */
export async function createShiprocketOrder(order, credentials = {}) {
  const { token, isMock } = await getShiprocketToken(credentials);
  const pickupLocation = credentials.pickupLocation || process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';

  // If live credentials are not active yet, generate realistic simulated logistics data
  if (isMock || !token) {
    const mockAwb = `DEL-${Date.now().toString().slice(-8)}`;
    const mockShipmentId = Math.floor(10000000 + Math.random() * 90000000);
    const mockOrderId = Math.floor(1000000 + Math.random() * 9000000);

    return {
      success: true,
      isMock: true,
      order_id: mockOrderId,
      shipment_id: mockShipmentId,
      awb_code: mockAwb,
      courier_name: 'Delhivery Surface (Fragrance Compliant)',
      status: 'AWB Assigned',
      tracking_url: `https://shiprocket.co/tracking/${mockAwb}`,
      label_url: null,
      message: 'Demo shipment created successfully. Add live Shiprocket API credentials in Store Settings to dispatch real couriers.',
    };
  }

  try {
    // Format customer names
    const nameParts = (order.customer_name || 'Customer').trim().split(' ');
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Client';

    // Format order date: YYYY-MM-DD HH:mm
    const dateObj = new Date(order.created_at || Date.now());
    const orderDate = dateObj.toISOString().replace('T', ' ').slice(0, 16);

    // Format line items
    const orderItems = (order.items || []).map((it, idx) => ({
      name: it.product_name || `Luxury Flacon #${idx + 1}`,
      sku: `ALZ-${(it.product_id || 'PROD').slice(0, 6)}`,
      units: it.quantity || 1,
      selling_price: it.unit_price || 1199,
      discount: 0,
      tax: 0,
      hsn: '330300', // HSN code for perfumes and toilet waters in India
    }));

    const payload = {
      order_id: order.order_number,
      order_date: orderDate,
      pickup_location: pickupLocation,
      channel_id: '',
      comment: 'Luxury Perfume - Handle with Care (Surface Cargo)',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: order.shipping_address,
      billing_address_2: '',
      billing_city: order.shipping_city,
      billing_pincode: order.shipping_pincode,
      billing_state: order.shipping_state,
      billing_country: 'India',
      billing_email: order.customer_email,
      billing_phone: order.customer_phone.replace(/[^0-9]/g, '').slice(-10),
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: 'Prepaid',
      shipping_charges: order.shipping_charge || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.discount_amount || 0,
      sub_total: order.total_amount,
      // Standard outer box dimensions for perfume flacons (in cm & kg)
      length: 15,
      breadth: 12,
      height: 10,
      weight: 0.45,
    };

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.status_code === 422 || !data.order_id) {
      throw new Error(data.message || 'Failed to create Shiprocket shipment');
    }

    const shiprocketOrderId = data.order_id;
    const shipmentId = data.shipment_id;
    let awbCode = data.awb_code || null;
    let courierName = data.courier_name || 'Delhivery Surface';

    // Automatically request AWB allocation if not assigned automatically
    if (!awbCode && shipmentId) {
      try {
        const awbRes = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shipment_id: shipmentId }),
        });
        const awbData = await awbRes.json();
        if (awbData.response?.data?.awb_code) {
          awbCode = awbData.response.data.awb_code;
          courierName = awbData.response.data.courier_name || courierName;
        }
      } catch (awbErr) {
        console.warn('Auto AWB allocation deferred:', awbErr);
      }
    }

    return {
      success: true,
      isMock: false,
      order_id: shiprocketOrderId,
      shipment_id: shipmentId,
      awb_code: awbCode,
      courier_name: courierName,
      status: awbCode ? 'AWB Assigned' : 'Order Created',
      tracking_url: awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null,
      message: 'Shipment created successfully on Shiprocket',
    };
  } catch (err) {
    console.error('Shiprocket order creation error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Generate Shipping Label PDF URL
 */
export async function generateShippingLabel(shipmentId, credentials = {}) {
  const { token, isMock } = await getShiprocketToken(credentials);

  if (isMock || !token) {
    return {
      success: true,
      label_url: 'https://shiprocket.co/demo-shipping-label.pdf',
      isMock: true,
    };
  }

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/courier/generate/label', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipment_id: [shipmentId] }),
    });

    const data = await res.json();
    return {
      success: res.ok,
      label_url: data.label_url || null,
      message: data.message,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Track Shipment by AWB
 */
export async function trackShipment(awbCode, credentials = {}) {
  const { token, isMock } = await getShiprocketToken(credentials);

  if (isMock || !token) {
    return {
      success: true,
      isMock: true,
      awb_code: awbCode,
      current_status: 'In Transit via Delhivery Surface Express',
      location: 'Central Sorting Hub, Bangalore / Chennai',
      tracking_url: `https://shiprocket.co/tracking/${awbCode}`,
    };
  }

  try {
    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return {
      success: res.ok,
      tracking_data: data.tracking_data,
      tracking_url: `https://shiprocket.co/tracking/${awbCode}`,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Calculate Live Courier Shipping Rates & Availability via Shiprocket
 */
export async function calculateShiprocketRates({ pickupPincode, deliveryPincode, weight = 0.45, cod = 0 }, credentials = {}) {
  const { token, isMock } = await getShiprocketToken(credentials);
  const pickup = pickupPincode || process.env.SHIPROCKET_PICKUP_PINCODE || '608306';

  if (isMock || !token) {
    // Generate realistic simulated logistics rates based on Indian pincode zone distance
    const isLocal = deliveryPincode && (deliveryPincode.startsWith('60') || deliveryPincode.startsWith('61') || deliveryPincode.startsWith('62') || deliveryPincode.startsWith('63') || deliveryPincode.startsWith('64'));
    const isSouth = deliveryPincode && (deliveryPincode.startsWith('56') || deliveryPincode.startsWith('57') || deliveryPincode.startsWith('58') || deliveryPincode.startsWith('50') || deliveryPincode.startsWith('68') || deliveryPincode.startsWith('69'));
    const baseRate = isLocal ? 48 : isSouth ? 65 : 85;

    return {
      success: true,
      isMock: true,
      pickup_postcode: pickup,
      delivery_postcode: deliveryPincode,
      recommended_courier: 'Delhivery Surface (Fragrance Compliant)',
      rate: baseRate,
      estimated_days: isLocal ? '1-2 Days' : isSouth ? '2-3 Days' : '3-5 Days',
      couriers: [
        { name: 'Delhivery Surface', rate: baseRate, etd: isLocal ? '2 days' : '3-4 days' },
        { name: 'Blue Dart Surface', rate: baseRate + 20, etd: isLocal ? '1-2 days' : '2-3 days' },
        { name: 'DTDC Surface', rate: baseRate + 10, etd: isLocal ? '2 days' : '3-5 days' },
        { name: 'Shadowfax Surface', rate: baseRate + 5, etd: isLocal ? '2 days' : '4 days' },
      ],
      notice: 'Simulated quote based on standard 0.45kg flacon box. Connect live Shiprocket credentials in Admin Settings for exact contractual rates.',
    };
  }

  try {
    const url = new URL('https://apiv2.shiprocket.in/v1/external/courier/serviceability/');
    url.searchParams.append('pickup_postcode', pickup);
    url.searchParams.append('delivery_postcode', deliveryPincode);
    url.searchParams.append('weight', String(weight));
    url.searchParams.append('cod', String(cod));

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok || data.status !== 200 || !data.data?.available_courier_companies) {
      throw new Error(data.message || 'Pincode not serviceable or Shiprocket error.');
    }

    const available = data.data.available_courier_companies;
    available.sort((a, b) => Number(a.rate) - Number(b.rate));
    const bestCourier = available[0];

    return {
      success: true,
      isMock: false,
      pickup_postcode: pickup,
      delivery_postcode: deliveryPincode,
      recommended_courier: bestCourier.courier_name,
      rate: Math.round(Number(bestCourier.rate)),
      estimated_days: bestCourier.etd || '3-5 Days',
      couriers: available.slice(0, 5).map((c) => ({
        id: c.courier_company_id,
        name: c.courier_name,
        rate: Math.round(Number(c.rate)),
        etd: c.etd,
        cod: c.cod === 1,
      })),
    };
  } catch (err) {
    console.error('Shiprocket rate calculation error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}
