import { supabase } from './client';

// ==================== DOCTORS ====================

export async function fetchDoctors() {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('available', true);

  if (error) throw error;
  return data?.map(d => ({
    id: d.id,
    name: d.profile?.full_name ?? '',
    specialization: d.specialization,
    experience: `${d.experience_years} years`,
    hospital: d.hospital ?? '',
    location: d.location ?? '',
    rating: d.rating,
    reviewCount: d.total_reviews,
    fee: d.consultation_fee,
    image: d.profile?.avatar_url ?? '',
    available: d.available,
    about: d.about ?? '',
    availableSlots: d.available_slots ?? [],
  })) ?? [];
}

export async function fetchDoctorById(id: string) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.profile?.full_name ?? '',
    specialization: data.specialization,
    experience: `${data.experience_years} years`,
    hospital: data.hospital ?? '',
    location: data.location ?? '',
    rating: data.rating,
    reviewCount: data.total_reviews,
    fee: data.consultation_fee,
    image: data.profile?.avatar_url ?? '',
    available: data.available,
    about: data.about ?? '',
    availableSlots: data.available_slots ?? [],
  };
}

// ==================== MEDICINES ====================

export async function fetchMedicines() {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('in_stock', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function fetchMedicineById(id: string) {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function searchMedicines(query: string) {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .ilike('name', `%${query}%`)
    .eq('in_stock', true);

  if (error) throw error;
  return data ?? [];
}

// ==================== LAB TESTS ====================

export async function fetchLabTests() {
  const { data, error } = await supabase
    .from('lab_tests')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function fetchLabTestById(id: string) {
  const { data, error } = await supabase
    .from('lab_tests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ==================== HEALTH PACKAGES ====================

export async function fetchHealthPackages() {
  const { data, error } = await supabase
    .from('health_packages')
    .select('*')
    .order('popular', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ==================== APPOINTMENTS ====================

export async function fetchAppointments(userId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctor_profiles(
        *,
        profile:profiles(*)
      )
    `)
    .eq('patient_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data?.map(a => ({
    id: a.id,
    date: a.date,
    time: a.time,
    type: a.type,
    status: a.status,
    symptoms: a.symptoms,
    notes: a.notes,
    prescription: a.prescription,
    paymentAmount: a.payment_amount,
    paymentStatus: a.payment_status,
    doctor: {
      id: a.doctor?.id ?? '',
      name: a.doctor?.profile?.full_name ?? '',
      specialization: a.doctor?.specialization ?? '',
      image: a.doctor?.profile?.avatar_url ?? '',
      hospital: a.doctor?.hospital ?? '',
    },
  })) ?? [];
}

export async function fetchAppointmentById(id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctor_profiles(
        *,
        profile:profiles(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return {
    id: data.id,
    date: data.date,
    time: data.time,
    type: data.type,
    status: data.status,
    symptoms: data.symptoms,
    notes: data.notes,
    prescription: data.prescription,
    paymentAmount: data.payment_amount,
    paymentStatus: data.payment_status,
    doctor: {
      id: data.doctor?.id ?? '',
      name: data.doctor?.profile?.full_name ?? '',
      specialization: data.doctor?.specialization ?? '',
      image: data.doctor?.profile?.avatar_url ?? '',
      hospital: data.doctor?.hospital ?? '',
      fee: data.doctor?.consultation_fee ?? 0,
    },
  };
}

export async function createAppointment(params: {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: 'video' | 'in-person';
  symptoms?: string;
  paymentAmount: number;
  paymentId?: string;
}) {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: params.patientId,
      doctor_id: params.doctorId,
      date: params.date,
      time: params.time,
      type: params.type,
      symptoms: params.symptoms,
      payment_amount: params.paymentAmount,
      payment_id: params.paymentId,
      payment_status: params.paymentId ? 'paid' : 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelAppointment(id: string) {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'Cancelled' })
    .eq('id', id);

  if (error) throw error;
}

// ==================== ORDERS ====================

export async function createOrder(params: {
  patientId: string;
  items: { medicineId: string; quantity: number; price: number }[];
  totalAmount: number;
  deliveryAddress: string;
  paymentId?: string;
  prescriptionUrl?: string;
}) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      patient_id: params.patientId,
      total_amount: params.totalAmount,
      delivery_address: params.deliveryAddress,
      payment_id: params.paymentId,
      payment_status: params.paymentId ? 'paid' : 'pending',
      prescription_url: params.prescriptionUrl,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = params.items.map(item => ({
    order_id: order.id,
    medicine_id: item.medicineId,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
}

export async function fetchOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        medicine:medicines(*)
      )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ==================== LAB BOOKINGS ====================

export async function createLabBooking(params: {
  patientId: string;
  labTestId: string;
  date: string;
  time?: string;
  collectionType: 'home' | 'center';
  collectionAddress?: string;
  paymentAmount: number;
}) {
  const { data, error } = await supabase
    .from('lab_bookings')
    .insert({
      patient_id: params.patientId,
      lab_test_id: params.labTestId,
      date: params.date,
      time: params.time,
      collection_type: params.collectionType,
      collection_address: params.collectionAddress,
      payment_amount: params.paymentAmount,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchLabBookings(userId: string) {
  const { data, error } = await supabase
    .from('lab_bookings')
    .select(`
      *,
      lab_test:lab_tests(*)
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ==================== NOTIFICATIONS ====================

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) throw error;
}

// ==================== MEDICAL STORES ====================

export async function fetchMedicalStores() {
  const { data, error } = await supabase
    .from('medical_stores')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('is_open', true);

  if (error) throw error;
  return data ?? [];
}

// ==================== PRESCRIPTIONS ====================

export async function uploadPrescription(patientId: string, uri: string, notes?: string) {
  const fileName = `${patientId}/${Date.now()}.jpg`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('prescriptions')
    .upload(fileName, blob, { contentType: 'image/jpeg' });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('prescriptions')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      patient_id: patientId,
      file_url: publicUrl,
      notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
