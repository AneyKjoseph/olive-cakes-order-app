import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Cake,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  ChevronRight,
  TrendingUp,
  Database,
  Coffee,
  Heart,
  Lock,
  Unlock,
  KeyRound,
  Upload,
  Image as ImageIcon,
  X,
  User2Icon,
  IndianRupee,
  Tag,
  Printer
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { OrderForm } from './components/OrderForm';
import { DashboardView } from './components/DashboardView';
import { FlavorManager } from './components/FlavorManager';
import { CakeTargetManager } from './components/CakeTargetManager';
import { AdminAuthCard } from './components/AdminAuthCard';
import { OverviewStrip } from './features/dashboard/OverviewStrip';
import { InfoChip } from './features/shared/InfoChip';

// =========================================================
// SUPABASE CLIENT CONFIGURATION
// Dynamic script loading is used to prevent bundler errors
// =========================================================

const cakeOrderSchema = import.meta.env.VITE_SUPABASE_SCHEMA;
console.log(import.meta.env);

const QUANTITIES = [
  { id: 'medium', name: 'Medium' },
  { id: 'large', name: 'Large' },
  { id: 'custom', name: 'Add Quantity in Kg' }
];

const TARGET_TYPE = [
  { id: 'display', name: 'Display' },
  { id: 'fill', name: 'Fill' }
];


const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSWORD;

export default function App() {
  const [activeTab, setActiveTab] = useState('order-form');
  const [previousTab, setPreviousTab] = useState('order-form');
  const [orders, setOrders] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Supabase client reference

  const [isLiveConnection, setIsLiveConnection] = useState(true);

  // Admin Security session validation
  const [isAdmin, setIsAdmin] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Toast System banner
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form Parameters
  const [orderType, setOrderType] = useState('Regular');
  const [dateTime, setDateTime] = useState('');
  const [flavor, setFlavor] = useState('');
  const [quantity, setQuantity] = useState('medium');
  const [customQtyDetails, setCustomQtyDetails] = useState('');
  const [wishes, setWishes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [designDetails, setDesignDetails] = useState('');
  // flavor params
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newFlavorId, setNewFlavorId] = useState('');
  const [newFlavorPriceMedium, setNewFlavorPriceMedium] = useState('');
  const [newFlavorPriceLarge, setNewFlavorPriceLarge] = useState('');
  const [isSavingFlavor, setIsSavingFlavor] = useState(false);

  const [flavorNameForTarget, setFlavorNameForTarget] = useState('');
  const [kgForTarget, setKgForTarget] = useState('');
  const [remarks, setRemarks] = useState('');
  const [countForTarget, setCountForTarget] = useState('');
  const [typeForTarget, setTypeForTarget] = useState('');
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [targets, setTargets] = useState([]);

  // Image Storage Base64 parameters
  const [referenceImage, setReferenceImage] = useState(null);
  const [isCompilingImage, setIsCompilingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [filterDate, setFilterDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [editingOrderId, setEditingOrderId] = useState(null);

  // Full Screen Lightbox parameters
  const [lightboxImage, setLightboxImage] = useState(null);

  const handleResetToToday = () => {
    setFilterDate(new Date().toLocaleDateString('en-CA'));
  };

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;
    setPreviousTab(activeTab);
    setActiveTab(nextTab);
  };

  const handleGoBack = () => {
    if (previousTab && previousTab !== activeTab) {
      setActiveTab(previousTab);
      setPreviousTab(activeTab);
    } else {
      setActiveTab('order-form');
    }
  };

  const populateOrderForEdit = (order) => {
    setEditingOrderId(order.id ?? null);
    setOrderType(order.order_type || 'Regular');
    setDateTime(order.date_time || '');
    setFlavor(order.flavor || '');
    setQuantity(order.quantity || 'medium');
    setCustomQtyDetails(order.custom_qty_details || '');
    setWishes(order.wishes || '');
    setCustomerName(order.customer_name || '');
    setAdvanceAmount(String(order.advance_amount ?? ''));
    setTotalAmount(String(order.total_amount ?? ''));
    setContactNo(order.contact_no || '');
    setDesignDetails(order.design_details || '');
    setReferenceImage(order.image_data || null);
    setPreviousTab(activeTab);
    setActiveTab('order-form');
    showToast('Editing selected order. Update and save changes.');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const balanceAmount = useMemo(() => {
    const total = parseFloat(totalAmount) || 0;
    const paid = parseFloat(advanceAmount) || 0;
    return total - paid;
  }, [totalAmount, advanceAmount]);


  const handlePrintOnlyTable = (id) => {
  const tableElement = document.getElementById(id);
  if (!tableElement) {
    showToast("Schedule table not found to print.", "error");
    return;
  }

  const iframe = document.createElement('iframe');
  // Make it visible to the system but off-screen
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.top = '0px';
  iframe.style.width = '100vw'; 
  iframe.style.height = '100vh';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          /* Your existing styles here */
          body { padding: 24px; }
          table { width: 100% !important; border-collapse: collapse !important; }
        </style>
      </head>
      <body>
        ${tableElement.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // FIX: Wait for the script to load and images/styles to render
  // Using an interval/check is safer than a hardcoded timeout
  const printWhenReady = () => {
    if (iframe.contentWindow.document.readyState === 'complete') {
      // Small delay to ensure Tailwind has processed the DOM
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        // Remove after a longer delay to ensure the dialog opened
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    } else {
      setTimeout(printWhenReady, 100);
    }
  };

  printWhenReady();
};


  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please upload a valid image file.", "error");
      return;
    }

    setIsCompilingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Keep file extremely optimized for relational SQL
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Output optimized base64
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setReferenceImage(optimizedBase64);
        setIsCompilingImage(false);
        showToast("Concept illustration compressed & attached!");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };




  // Dynamically load Supabase client script inside the browser to avoid bundling issues


  // Sync data streams once database client is resolved
  useEffect(() => {
    if (!isLiveConnection || !supabase) {
      // Offline local database engine
      const localStored = localStorage.getItem('local_cake_orders');
      if (localStored) {
        setOrders(JSON.parse(localStored));
      }
      setLoading(false);
      return;
    }



    setLoading(true);

    const fetchSQLOrders = async () => {
      try {
        const { data, error } = await supabase
          .schema(cakeOrderSchema)
          .from('orders')
          .select('*');

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.warn("SQL Fetch Error, defaulting to local simulation:", error);
        showToast("Database restricted. Operating in local simulation mode.", "error");
        setIsLiveConnection(false);

        const localStored = localStorage.getItem('local_cake_orders');
        if (localStored) setOrders(JSON.parse(localStored));
      } finally {
        setLoading(false);
      }
    };
    const fetchFlavors = async () => {
      const { data, error } = await supabase
        .schema(cakeOrderSchema)
        .from('flavors')
        .select('id, name, price_medium, price_large'); // Fetch prices

      if (error) {
        console.error("Error fetching flavors:", error);
      } else {
        console.log("Data returned from Supabase:", data);
        setFlavors(data || []);
      }
    };

    fetchSQLOrders();
    fetchFlavors();

    // Configure Realtime PostgreSQL Replication Pipeline
    const ordersChannel = supabase
      .channel('realtime_orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: cakeOrderSchema, table: 'orders' },
        () => {
          fetchSQLOrders(); // Refresh values dynamically on Postgres signals
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [isLiveConnection, supabase]);

  const handleFlavorNameChange = (e) => {
    const val = e.target.value;
    setNewFlavorName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-_]/g, '')
      .replace(/\s+/g, '_');
    setNewFlavorId(generatedSlug);
  };

  const createIdGenerator = () => {
  let id = 1; 
  return () => id++;
};

  const handleTarget = (e) => {
    e.preventDefault();
  
    const target = {
      id: createIdGenerator(),
      flavor: flavorNameForTarget.trim(),
      kg: kgForTarget.trim(),
      type: typeForTarget.trim(),
      remarks: remarks,
      count: Number(countForTarget) || 0
    };
    setTargets([...targets, target]);
  };

  // Insert a new flavor row to Supabase VITE_SUPABASE_SCHEMA.flavors
  const handleAddFlavor = async (e) => {
    e.preventDefault();
    if (!newFlavorName.trim()) {
      return showToast("Flavor Name required.", "error");
    }

    setIsSavingFlavor(true);
    const payload = {
      id: newFlavorId.trim(),
      name: newFlavorName.trim(),
      price_medium: Number(newFlavorPriceMedium) || 0,
      price_large: Number(newFlavorPriceLarge) || 0
    };

    try {
      if (isLiveConnection && supabase) {
        const { error } = await supabase
          .schema(cakeOrderSchema)
          .from('flavors')
          .insert([payload]);

        if (error) throw error;
      } else {
        const updated = [...flavors, payload];
        setFlavors(updated);
        localStorage.setItem('local_cake_flavors', JSON.stringify(updated));
      }

      showToast(`🎉 Flavor "${newFlavorName}" added and synced!`);
      setNewFlavorName('');
      setNewFlavorId('');
      setNewFlavorPriceMedium('');
      setNewFlavorPriceLarge('');
    } catch (err) {
      console.error("Failed to append new database flavor row:", err);
      showToast("Relational insert failure. The key ID might already exist.", "error");
    } finally {
      setIsSavingFlavor(false);
    }
  };

  const validateOrderForm = () => {
    if (!dateTime) return "Please select Order date and time.";
    if (!flavor) return "Please select a flavor.";
    if (!contactNo) return "Please input customer contact number.";
    if (!customerName) return "Please input customer name.";
    if (quantity === 'custom' && !customQtyDetails.trim()) return "Please describe the custom cake quantity details.";
    if (orderType === 'Theme' && !designDetails.trim()) return "Please describe the design specifications for your Theme Cake.";
    if (!totalAmount || Number(totalAmount) <= 0) return "Please enter a valid total amount.";
    return null;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    const validationMessage = validateOrderForm();
    if (validationMessage) {
      showToast(validationMessage, 'error');
      return;
    }

    setIsSubmitting(true);

    const total = parseFloat(totalAmount) || 0;
    const paid = parseFloat(advanceAmount) || 0;
    const finalBalance = total - paid;

    const orderPayload = {
      order_type: orderType,
      date_time: dateTime,
      flavor: flavor,
      quantity: quantity,
      custom_qty_details: quantity === 'custom' ? customQtyDetails : '',
      wishes: wishes.trim(),
      advance_amount: Number(advanceAmount) || 0,
      balance_amount: finalBalance || 0,
      total_amount: Number(totalAmount) || 0,
      customer_name: customerName,
      contact_no: contactNo.trim(),
      design_details: orderType === 'Theme' ? designDetails.trim() : '',
      image_data: orderType === 'Theme' ? referenceImage : null,
      created_at: new Date().toISOString()
    };

    try {
      if (editingOrderId !== null && editingOrderId !== undefined) {
        const updatedOrders = orders.map(order =>
          order.id === editingOrderId ? { ...order, ...orderPayload } : order
        );

        if (isLiveConnection && supabase) {
          const { error } = await supabase
            .schema(cakeOrderSchema)
            .from('orders')
            .update(orderPayload)
            .eq('id', editingOrderId);

          if (error) throw error;
        }

        setOrders(updatedOrders);
        localStorage.setItem('local_cake_orders', JSON.stringify(updatedOrders));
        showToast('🎉 Order details updated successfully!');
      } else {
        const backupList = [...orders, { id: crypto.randomUUID(), ...orderPayload }];

        if (isLiveConnection && supabase) {
          const { error } = await supabase
            .schema(cakeOrderSchema)
            .from('orders')
            .insert([orderPayload]);

          if (error) throw error;
        }

        setOrders(backupList);
        localStorage.setItem('local_cake_orders', JSON.stringify(backupList));
        showToast('🎉 Cake order recorded & synced successfully!');
      }

      resetFormInputs();

      setPreviousTab(activeTab);
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 500);

    } catch (err) {
      console.error("Order save failed:", err);
      showToast("Relational write failed. Check connection or tables.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormInputs = () => {
    setEditingOrderId(null);
    setOrderType('Regular');
    setDateTime('');
    setFlavor('');
    setQuantity('medium');
    setCustomQtyDetails('');
    setWishes('');
    setCustomerName('');
    setAdvanceAmount('');
    setTotalAmount('');
    setContactNo('');
    setDesignDetails('');
    setReferenceImage(null);
  };

  const handleCancelEdit = () => {
    resetFormInputs();
    setPreviousTab(activeTab);
    setActiveTab('dashboard');
    showToast('Edit cancelled and returned to dashboard.');
  };

  const handleDeleteOrder = (orderId) => {
    if (!orderId) return;
    const orderToDelete = orders.find(order => order.id === orderId);
    if (!orderToDelete) return;

    setDeleteConfirm({
      orderId,
      customerName: orderToDelete.customer_name || 'this customer'
    });
  };

  const confirmDeleteOrder = async () => {
    if (!deleteConfirm?.orderId) return;

    const { orderId } = deleteConfirm;
    setDeleteConfirm(null);

    try {
      const remainingOrders = orders.filter(order => order.id !== orderId);

      if (isLiveConnection && supabase) {
        const { error } = await supabase
          .schema(cakeOrderSchema)
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (error) throw error;
      }

      setOrders(remainingOrders);
      localStorage.setItem('local_cake_orders', JSON.stringify(remainingOrders));

      if (editingOrderId === orderId) {
        resetFormInputs();
      }

      showToast('Order deleted successfully.');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Could not delete the order.', 'error');
    }
  };

  const handleSeedMockData = async () => {
    const today = new Date();
    const formatDateStr = (hoursOffset) => {
      const d = new Date(today);
      d.setHours(d.getHours() + hoursOffset);
      return d.toISOString().slice(0, 16);
    };

    const mockDataset = [
      {
        order_type: 'Theme',
        date_time: formatDateStr(2),
        flavor: 'chocolate_fudge',
        quantity: 'large',
        custom_qty_details: '',
        wishes: 'Happy Birthday Ethan!',
        advance_amount: 40.00,
        balance_amount: 80.00,
        contact_no: '+1 (555) 019-1234',
        design_details: 'Cosmic stars layout on custom royal dark frosting tier.',
        image_data: null,
        created_at: new Date().toISOString()
      },
      {
        order_type: 'Regular',
        date_time: formatDateStr(4),
        flavor: 'red_velvet',
        quantity: 'medium',
        custom_qty_details: '',
        wishes: 'Warm Congratulations!',
        advance_amount: 15.00,
        balance_amount: 45.00,
        contact_no: '+1 (555) 321-7654',
        design_details: '',
        image_data: null,
        created_at: new Date().toISOString()
      },
      {
        order_type: 'Theme',
        date_time: formatDateStr(6),
        flavor: 'mango_passion',
        quantity: 'custom',
        custom_qty_details: 'Double tier tower base',
        wishes: 'Congratulations Sarah!',
        advance_amount: 120.00,
        balance_amount: 280.00,
        contact_no: '+1 (555) 789-4560',
        design_details: 'Summer floral textures, matching gold leaf details.',
        image_data: null,
        created_at: new Date().toISOString()
      }
    ];

    try {
      if (isLiveConnection && supabase) {
        showToast("Writing simulated records directly to cloud SQL...");
        const { error } = await supabase.from('orders').insert(mockDataset);
        if (error) throw error;
        showToast("Database loaded with test items!");
      } else {
        const merged = [...orders, ...mockDataset.map(d => ({ id: crypto.randomUUID(), ...d }))];
        setOrders(merged);
        localStorage.setItem('local_cake_orders', JSON.stringify(merged));
        showToast("Simulated memory rows populated!");
      }
    } catch (e) {
      console.error(e);
      showToast("Could not inject mock metrics.", "error");
    }
  };

  const handleAdminVerify = (e) => {
    e.preventDefault();
    if (passcodeInput === ADMIN_PASSCODE) {
      setIsAdmin(true);
      setPasscodeError('');
      setPasscodeInput('');
      showToast("🔒 Admin access granted. Kitchen session active.");
    } else {
      setPasscodeError("Passcode incorrect. Access denied.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    showToast("Admin dashboard locked.");
  };

  const dashboardSummary = useMemo(() => ({}), [orders]);

  const analytics = useMemo(() => {
    const flavorCounts = {};
    flavors.forEach(f => { flavorCounts[f.id] = 0; });

    orders.forEach(order => {
      const fId = order.flavor;
      if (flavorCounts[fId] !== undefined) {
        flavorCounts[fId] += 1;
      } else {
        flavorCounts[fId] = (flavorCounts[fId] || 0) + 1;
      }
    });

    const flavorAllTimeSummary = Object.keys(flavorCounts).map(id => {
      const meta = flavors.find(f => f.id === id);
      return {
        id,
        name: meta ? meta.name : id,
        count: flavorCounts[id]
      };
    }).sort((a, b) => b.count - a.count);

    // 1. Filter based on selected date
    const selectedDateStr = filterDate;
    const targetDateOrders = orders.filter(order => {
      if (!order.date_time) return false;
      const orderDateStr = order.date_time.split('T')[0];
      return orderDateStr === selectedDateStr;
    });

    // Sort order list chronological ascending
    const targetOrdersSorted = [...targetDateOrders].sort((a, b) => {
      const timeA = a.date_time.split('T')[1] || '';
      const timeB = b.date_time.split('T')[1] || '';
      return timeA.localeCompare(timeB);
    });

    const todayFlavorSizes = {};
    targetOrdersSorted.forEach(order => {
      const flv = order.flavor;
      const qty = order.quantity;

      if (!todayFlavorSizes[flv]) {
        todayFlavorSizes[flv] = { medium: 0, large: 0, custom: 0, total: 0 };
      }
      todayFlavorSizes[flv][qty] += 1;
      todayFlavorSizes[flv].total += 1;
    });

    const selectedDateSummaryData = Object.keys(todayFlavorSizes).map(flvId => {
      const meta = flavors.find(f => f.id === flvId);
      return {
        id: flvId,
        name: meta ? meta.name : flvId,
        sizes: todayFlavorSizes[flvId]
      };
    }).sort((a, b) => b.sizes.total - a.sizes.total);

    // 2. Calculate actual today's counter strictly for the tab notification badge
    const todayLocalStr = new Date().toLocaleDateString('en-CA');
    const strictlyTodayCount = orders.filter(order => {
      if (!order.date_time) return false;
      return order.date_time.split('T')[0] === todayLocalStr;
    }).length;

    return {
      totalAllTimeOrders: orders.length,
      flavorAllTimeSummary,
      todayOrders: targetOrdersSorted, // Renamed internally for compatibility but represents selected date
      todaySummaryData: selectedDateSummaryData,
      selectedDateSummaryData,
      todayCount: strictlyTodayCount,  // Strictly actual today's count for notification bubble
      selectedDateCount: targetDateOrders.length
    };
  }, [orders, flavors, filterDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 text-slate-800 font-sans">

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex items-center justify-center lg:justify-start w-full lg:w-auto">
            <div className="p-2.5 bg-white-50 text-pink-600 rounded-2xl shadow-inner w-full max-w-[220px]">
              <img src="/header-image.png" className="w-full h-auto object-contain" alt="Olive Cakes logo" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Live Indicator Chip */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isLiveConnection
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
              <Database className="w-3.5 h-3.5" />
              {isLiveConnection ? "Live Data" : "Local Data"}
            </span>

            <nav className="flex flex-wrap justify-center bg-rose-50 p-1 rounded-xl border border-rose-100/60 items-center gap-1 w-full sm:w-auto">
              {activeTab !== 'order-form' && (
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="flex items-center gap-2 px-3 py-2 mr-2 rounded-lg font-medium text-sm text-slate-600 hover:text-slate-800 hover:bg-white transition-all"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back
                </button>
              )}
              <button
                onClick={() => handleTabChange('order-form')}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${activeTab === 'order-form'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <PlusCircle className="w-4 h-4" />
                Place Order
              </button>
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 relative ${activeTab === 'dashboard'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
                {analytics.todayCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                    {analytics.todayCount}
                  </span>
                )}
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('manage-flavors')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'manage-flavors'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                      : 'text-pink-600 bg-pink-100 hover:bg-pink-200'
                    }`}
                >
                  <Layers className="w-4 h-4" />
                  Manage Flavors
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleTabChange('cake-count')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'cake-count'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                      : 'text-pink-600 bg-pink-100 hover:bg-pink-200'
                    }`}
                >
                  <Layers className="w-4 h-4" />
                  Cake Target
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={handleAdminLogout}
                  className="ml-2 p-1.5 bg-rose-100/70 text-rose-700 hover:bg-rose-200 rounded-lg text-xs"
                  title="Lock admin session"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* TOAST PANEL */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`p-4 rounded-xl shadow-lg flex items-center gap-3 border ${toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-rose-100 p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Delete order?</h3>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-slate-700 mb-6">
              Are you sure you want to delete the order for <span className="font-semibold text-slate-900">{deleteConfirm.customerName}</span>?
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteOrder}
                className="px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-medium transition-all shadow-sm"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PREVIEW LIGHTBOX */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 rounded-full transition-all"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Design Specification Reference"
              className="w-full max-h-[70vh] object-contain bg-slate-50"
            />
            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <h4 className="font-bold text-slate-800">Theme Design Reference Photo</h4>
              <p className="text-xs text-slate-500 mt-1">Stored securely inside your relational schema.</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW LAYOUT PANEL */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">

        {/* VIEW 1: CAKE FORM */}
        {activeTab === 'order-form' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
            <div className="xl:col-span-8 w-full">
              <OrderForm
                orderType={orderType}
                setOrderType={setOrderType}
                dateTime={dateTime}
                setDateTime={setDateTime}
                customerName={customerName}
                setCustomerName={setCustomerName}
                contactNo={contactNo}
                setContactNo={setContactNo}
                flavor={flavor}
                setFlavor={setFlavor}
                flavors={flavors}
                quantity={quantity}
                setQuantity={setQuantity}
                customQtyDetails={customQtyDetails}
                setCustomQtyDetails={setCustomQtyDetails}
                designDetails={designDetails}
                setDesignDetails={setDesignDetails}
                wishes={wishes}
                setWishes={setWishes}
                totalAmount={totalAmount}
                setTotalAmount={setTotalAmount}
                advanceAmount={advanceAmount}
                setAdvanceAmount={setAdvanceAmount}
                balanceAmount={balanceAmount}
                referenceImage={referenceImage}
                setReferenceImage={setReferenceImage}
                handlePhotoUpload={handlePhotoUpload}
                fileInputRef={fileInputRef}
                isCompilingImage={isCompilingImage}
                handleSubmitOrder={handleSubmitOrder}
                isSubmitting={isSubmitting}
                quantities={QUANTITIES}
                isEditingOrder={Boolean(editingOrderId)}
                onCancelEdit={handleCancelEdit}
              />
            </div>

            <aside className="xl:col-span-4 w-full">
              <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-4 sm:p-5 xl:sticky xl:top-24">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Order Snapshot</h3>
                <div className="space-y-3">
                  <InfoChip label="Type" value={orderType} tone={orderType === 'Theme' ? 'amber' : 'rose'} />
                  <InfoChip label="Flavor" value={flavors.find(f => f.id === flavor)?.name || 'Not selected'} tone="slate" />
                  <InfoChip label="Quantity" value={QUANTITIES.find(q => q.id === quantity)?.name || quantity} tone="rose" />
                  <InfoChip label="Balance" value={balanceAmount > 0 ? `₹${balanceAmount.toFixed(0)}` : 'Paid in full'} tone={balanceAmount > 0 ? 'amber' : 'emerald'} />
                </div>
                <div className="mt-5 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700 mb-1">Quick reminder</p>
                  <p>Theme orders require design details and optional reference images for smoother kitchen prep.</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* VIEW 2: KITCHEN TELEMETRY DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView
            isAdmin={isAdmin}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            handleResetToToday={handleResetToToday}
            analytics={analytics}
            dashboardSummary={dashboardSummary}
            flavors={flavors}
            onPrint={handlePrintOnlyTable}
            setLightboxImage={setLightboxImage}
            onEditOrder={populateOrderForEdit}
            onDeleteOrder={handleDeleteOrder}
            passcodeInput={passcodeInput}
            setPasscodeInput={setPasscodeInput}
            passcodeError={passcodeError}
            handleAdminVerify={handleAdminVerify}
            AdminAuthCard={AdminAuthCard}
            quantities={QUANTITIES}
          />
        )}

        {/* VIEW 3: MANAGE FLAVORS (ADMIN ONLY) */}
        {activeTab === 'manage-flavors' && isAdmin && (
          <FlavorManager
            flavors={flavors}
            newFlavorName={newFlavorName}
            setNewFlavorName={setNewFlavorName}
            newFlavorPriceMedium={newFlavorPriceMedium}
            setNewFlavorPriceMedium={setNewFlavorPriceMedium}
            newFlavorPriceLarge={newFlavorPriceLarge}
            setNewFlavorPriceLarge={setNewFlavorPriceLarge}
            handleFlavorNameChange={handleFlavorNameChange}
            handleAddFlavor={handleAddFlavor}
            isSavingFlavor={isSavingFlavor}
          />
        )}

        {/* VIEW 3: MANAGE FLAVORS (ADMIN ONLY) */}
        {activeTab === 'cake-count' && isAdmin && (
          <CakeTargetManager
            targets={targets}
            flavorNameForTarget={flavorNameForTarget}
            setFlavorNameForTarget={setFlavorNameForTarget}
            kgForTarget={kgForTarget}
            setKgForTarget={setKgForTarget}
            countForTarget={countForTarget}
            setCountForTarget={setCountForTarget}
            typeForTarget={typeForTarget}
            setTypeForTarget={setTypeForTarget}
            targetTypes={TARGET_TYPE}
            remarks={remarks}
            setRemarks={setRemarks}
            handleTarget={handleTarget}
            isSavingTarget={isSavingTarget}
            onPrint={handlePrintOnlyTable}
          />
        )}

      </main>

      <footer className="mt-16 border-t border-rose-100/60 bg-white/50 py-8 text-center text-xs text-slate-400">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> for Olive Cakes © 2026.
        </p>
      </footer>

    </div>
  );
}  