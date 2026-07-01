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


  // Full Screen Lightbox parameters
  const [lightboxImage, setLightboxImage] = useState(null);

  const handleResetToToday = () => {
    setFilterDate(new Date().toLocaleDateString('en-CA'));
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

    // Create custom invisible iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    
    // Inject clean high-fidelity formatting styles & Tailwind classes inside the sandbox
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Olive Cakes Schedule - ${filterDate}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              padding: 24px;
              background-color: #ffffff;
              color: #1e293b;
            }
            /* High-fidelity layout corrections for tables on physical paper */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-top: 16px;
            }
            th, td {
              border: 1px solid #e2e8f0 !important;
              padding: 10px 14px !important;
              font-size: 14px !important;
              text-align: left !important;
              word-break: break-word !important;
            }
            th {
              background-color: #f8fafc !important;
              color: #475569 !important;
              font-weight: 700 !important;
              text-transform: uppercase !important;
              font-size: 14px !important;
              letter-spacing: 0.05em !important;
            }
            .text-right {
              text-align: right !important;
            }
            .font-mono {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
            }
            /* Hidden utilities for interactive buttons/components inside print content */
            .no-print {
              display: none !important;
            }
            @media print {
              tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
              }
              thead {
                display: table-header-group !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="flex items-center justify-between border-b border-rose-100 pb-4 mb-4">
            <div>
              <h2 class="text-xl font-bold text-pink-600">Olive Cakes</h2>
              <p class="text-xs text-slate-500 mt-1">
                Scheduled Orders Summary • ${new Date(filterDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div class="text-right text-xs text-slate-400">
              Generated: ${new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          <div class="overflow-x-auto">
            ${tableElement.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Trigger printed preview after elements render completely inside iframe
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 550);
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

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!dateTime) return showToast("Please select Order date and time.", "error");
    if (!flavor) return showToast("Please select a flavor.", "error");
    if (!contactNo) return showToast("Please input customer contact number.", "error");
    if (!customerName) return showToast("Please input customer name.", "error");
    if (orderType === 'Theme' && !designDetails.trim()) {
      return showToast("Please describe the design specifications for your Theme Cake.", "error");
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
      if (isLiveConnection && supabase) {
        // Insert clean rows directly to hosted cloud PostgreSQL
        const { error } = await supabase
          .schema(cakeOrderSchema)
          .from('orders')
          .insert([orderPayload]);

        if (error) throw error;
      } else {
        // Safe mock local storage backup fallback
        const backupList = [...orders, { id: crypto.randomUUID(), ...orderPayload }];
        setOrders(backupList);
        localStorage.setItem('local_cake_orders', JSON.stringify(backupList));
      }

      showToast("🎉 Cake order recorded & synced successfully!");
      resetFormInputs();

      setTimeout(() => {
        setActiveTab('dashboard');
      }, 1000);

    } catch (err) {
      console.error("PostgreSQL Insert Failed:", err);
      showToast("Relational write failed. Check connection or tables.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormInputs = () => {
    setOrderType('Regular');
    setDateTime('');
    setFlavor('');
    setQuantity('medium');
    setCustomQtyDetails('');
    setWishes('');
    setCustomerName('');
    setAdvanceAmount('');
    setContactNo('');
    setDesignDetails('');
    setReferenceImage(null);
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

    const todaySummaryData = Object.keys(todayFlavorSizes).map(flvId => {
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
      todaySummaryData,
      todayCount: strictlyTodayCount,  // Strictly actual today's count for notification bubble
      selectedDateCount: targetDateOrders.length
    };
  }, [orders, flavors, filterDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 text-slate-800 font-sans">

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white-50 text-pink-600 rounded-2xl shadow-inner">
              <img src="/header-image.png" className="w-55 h-15" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator Chip */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isLiveConnection
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
              <Database className="w-3.5 h-3.5" />
              {isLiveConnection ? "Live Data" : "Local Data"}
            </span>

            <nav className="flex bg-rose-50 p-1 rounded-xl border border-rose-100/60 items-center">
              <button
                onClick={() => setActiveTab('order-form')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'order-form'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <PlusCircle className="w-4 h-4" />
                Place Order
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 relative ${activeTab === 'dashboard'
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
                  onClick={() => setActiveTab('cake-count')}
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
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* VIEW 1: CAKE FORM */}
        {activeTab === 'order-form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* FORM COMPONENT */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-rose-100/60 p-6 sm:p-8">
              <div className="border-b border-rose-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Cake className="w-5 h-5 text-pink-500" />
                  Place Your Cake Order
                </h2>
                <p className="text-xs text-slate-400 mt-1">Fields marked * are required.</p>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-6">

                {/* 1. ORDER SELECTOR TYPE */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Type *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setOrderType('Regular');
                        setReferenceImage(null);
                      }}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm border transition-all ${orderType === 'Regular'
                          ? 'bg-rose-50/50 border-pink-500 text-pink-700 ring-2 ring-pink-500/10'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      🍰 Regular Cake
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('Theme')}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm border transition-all ${orderType === 'Theme'
                          ? 'bg-rose-50/50 border-pink-500 text-pink-700 ring-2 ring-pink-500/10'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      ✨ Theme/Designer Cake
                    </button>
                  </div>
                </div>

                {/* 2. DATETIME & CONTACT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder='Enter Customer Name'
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Order Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Contact Phone No *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder=""
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* 3. FLAVORS AND QUANTITY SELECTORS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Choose Cake Flavor *
                    </label>
                    <select
                      required
                      value={flavor}
                      onChange={(e) => setFlavor(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 bg-white"
                    >
                      <option value="">-- Choose flavor --</option>
                      {flavors.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Select Quantity / Size *
                    </label>
                    <select
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 bg-white"
                    >
                      {QUANTITIES.map(q => (
                        <option key={q.id} value={q.id}>{q.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {quantity === 'custom' && (
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 animate-fadeIn">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Custom Size Details *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. enter tier, shape, quantity etc"
                      value={customQtyDetails}
                      onChange={(e) => setCustomQtyDetails(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>
                )}

                {/* THEME SPECIFIC BLOCK WITH REFERENCE PHOTO UPLOAD */}
                {orderType === 'Theme' && (
                  <div className="bg-pink-50/40 p-5 rounded-2xl border border-pink-100 space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-bold text-pink-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Theme Design Specifications *
                      </label>
                      <textarea
                        rows="3"
                        required
                        placeholder="Specify design, topper specifications, reference sketches, or theme guidelines..."
                        value={designDetails}
                        onChange={(e) => setDesignDetails(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-pink-700 uppercase tracking-wider mb-2">
                        Attached Design Reference Image
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="md:col-span-2">
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isCompilingImage}
                            className="w-full py-4 border-2 border-dashed border-pink-200 hover:border-pink-400 bg-white text-pink-600 font-medium text-xs rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            <Upload className="w-5 h-5 text-pink-400" />
                            {isCompilingImage ? "Scaling & Compressing File..." : "Attach Image"}
                          </button>
                        </div>

                        {/* MINI UPLOAD COMPONENT PREVIEW */}
                        <div className="flex justify-center">
                          {referenceImage ? (
                            <div className="relative group rounded-xl overflow-hidden border border-pink-200 w-24 h-24 bg-slate-50 shadow-sm">
                              <img src={referenceImage} alt="Reference Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setReferenceImage(null)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="border border-dashed border-slate-200 w-24 h-24 rounded-xl flex flex-col items-center justify-center text-slate-300 text-[10px]">
                              <Upload className="w-5 h-5 mb-1" />
                              No Image
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. WISHES / MESSAGE ON CAKE */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Wishes Written on Cake (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder='e.g., "Happy 10th Birthday Olive!"'
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                  />
                </div>

                {/* 5. FINANCES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      Total Amount (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      step="0.01"
                      placeholder="0.00"
                      value={totalAmount}
                      onChange={(e) =>
                        setTotalAmount(e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      Advance Paid (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>
                  {(totalAmount !== '' && advanceAmount !== '') && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      {balanceAmount > 0 ? (
                        <p className="text-red-600 font-bold">Balance Due: ₹{balanceAmount.toFixed(0)}</p>
                      ) : (
                        <p className="text-emerald-600 font-bold">Full amount paid!</p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-55"
                >
                  <Cake className="w-5 h-5" />
                  {isSubmitting ? 'Saving...' : 'Submit Cake Order'}
                </button>

              </form>
            </div>
          </div>
        )}

        {/* VIEW 2: KITCHEN TELEMETRY DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">

            {!isAdmin ? (
              <div className="max-w-md mx-auto my-12 bg-white rounded-3xl shadow-xl border border-rose-100 p-8 text-center">
                <div className="w-16 h-16 bg-rose-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Admin Authentication Required</h3>
                <p className="text-sm text-slate-400 mt-2 mb-6">
                  Only authorized Users can view live Dashboard.
                </p>

                <form onSubmit={handleAdminVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      Enter Secure Passcode
                    </label>
                    <input
                      type="password"
                      placeholder="password"
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center tracking-widest text-lg font-bold focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>

                  {passcodeError && (
                    <p className="text-xs text-rose-500 font-semibold flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {passcodeError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    Unlock Dashboard
                  </button>
                </form>
              </div>
            ) : (

              // ACTIVE METRIC METALS
              <div className="space-y-8">

                <div className="bg-white/80 backdrop-blur rounded-3xl border border-rose-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <LayoutDashboard className="w-6 h-6 text-pink-500" />
                      Orders Dashboard
                    </h2>
                    <p className="text-xs text-slate-400">Viewing schedule summary logs.</p>
                  </div>

                  <div className="flex flex-wrap gap-4 items-end">
                    {/* Interactive Date Selector Container */}
                    <div className="bg-pink-50/50 border border-pink-100/80 px-4 py-2.5 rounded-2xl flex flex-col gap-1.5 shadow-sm">
                      <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Select Delivery Date
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="px-3 py-1 bg-white border border-rose-200 text-slate-700 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                        {/* Only show "Today" shortcut if we aren't currently viewing today */}
                        {filterDate !== new Date().toLocaleDateString('en-CA') && (
                          <button
                            type="button"
                            onClick={handleResetToToday}
                            className="bg-pink-100 hover:bg-pink-200 text-pink-700 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors"
                          >
                            Today
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metric Boxes */}
                    <div className="bg-rose-100/50 border border-rose-100/80 px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
                      <span className="block text-[10px] text-rose-500 font-bold uppercase tracking-wider">Target Date Orders</span>
                      <span className="text-2xl font-black text-rose-600">{analytics.selectedDateCount}</span>
                    </div>
                    <div className="bg-amber-100/50 border border-amber-100/80 px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
                      <span className="block text-[10px] text-amber-600 font-bold uppercase tracking-wider font-semibold">All-Time Orders</span>
                      <span className="text-2xl font-black text-amber-700">{analytics.totalAllTimeOrders}</span>
                    </div>
                  </div>
                </div>


                {/* PREP SCHEDULE TABLE */}
                  <div className="bg-white rounded-3xl border border-rose-100/60 shadow-lg overflow-hidden">
                    <div className="p-6 bg-slate-50/60 border-b border-rose-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          <Clock className="w-5 h-5 text-pink-500" />
                          Scheduled Cakes for {new Date(filterDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                      </div>
                      {/* Action Button: Print to PDF */}
                      <button
                        onClick={() => handlePrintOnlyTable('printable-kitchen-table')}
                        className="no-print bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 text-xs self-end sm:self-auto"
                      >
                        <Printer className="w-4 h-4" />
                        Print to PDF
                      </button>
                    </div>



                    {analytics.selectedDateCount === 0 ? (
                      <div className="py-16 text-center text-slate-400 text-sm flex flex-col justify-center items-center gap-2">
                        <span>No cake orders scheduled for {filterDate}.</span>
                        <button
                          onClick={handleResetToToday}
                          className="text-pink-600 font-bold hover:underline text-xs"
                        >
                          Reset back to today
                        </button>
                      </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse" id="printable-kitchen-table">
                        <thead>
                          <tr className="bg-slate-50/30 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                            <th className="py-2 px-4">Due Time</th>
                            <th className="py-4 px-6">Cake details</th>
                            <th className="py-4 px-6">Writing</th>
                            <th className="py-4 px-6">Customer Name</th>
                            <th className="py-4 px-6">Contact Phone</th>
                            <th className="py-4 px-6 text-right">Amount (Total/ Paid / Due)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {analytics.todayOrders.map((order, i) => {
                            const flavorName = flavors.find(f => f.id === order.flavor)?.name || order.flavor;
                            const qtyLabel = QUANTITIES.find(q => q.id === order.quantity)?.name.split(' (')[0] || order.quantity;

                            const [datePart, timePart] = order.date_time.split('T');
                            const [h24, m] = timePart.split(':');

                            const h = parseInt(h24, 10);
                            const ampm = h >= 12 ? 'PM' : 'AM';
                            const h12 = h % 12 || 12;

                            const orderTime = `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;

                            return (
                              <tr key={order.id || i} className="hover:bg-slate-50/70 transition-colors text-sm">

                                <td className="py-2 px-4 font-bold text-pink-600 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 bg-pink-50 px-2.5 py-1 rounded-lg">
                                    <Clock className="w-3.5 h-3.5" />
                                    {orderTime}
                                  </span>
                                </td>

                                <td className="py-4 px-6 whitespace-nowrap">
                                  <div>
                                    <div className="font-semibold text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
                                      {flavorName}
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${order.order_type === 'Theme'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-indigo-100 text-indigo-800'
                                        }`}>
                                        {order.order_type}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5 capitalize">
                                      Size: {qtyLabel} {order.custom_qty_details ? `(${order.custom_qty_details})` : ''}
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4 px-6 max-w-sm">
                                  <div className="space-y-1.5">
                                    {order.wishes && (
                                      <div className="text-xs text-slate-700 bg-amber-50 border border-amber-100/50 px-2.5 py-1.5 rounded-lg">
                                        <span className="font-semibold text-amber-800 text-[10px] block uppercase">Wishes on Cake:</span>
                                        "{order.wishes}"
                                      </div>
                                    )}
                                    {order.order_type === 'Theme' && (
                                      <div className="text-xs text-slate-500 italic bg-rose-50/30 border border-rose-100/50 px-2.5 py-1.5 rounded-lg flex flex-col md:flex-row gap-3 items-start justify-between">
                                        <div>
                                          <span className="font-semibold text-pink-700 text-[10px] not-italic block uppercase">Theme Directives:</span>
                                          {order.design_details || "No specifications provided"}
                                        </div>

                                        {/* DATABASE IMAGE MINI PREVIEW IN PREP PIPELINE */}
                                        {order.image_data && (
                                          <button
                                            type="button"
                                            onClick={() => setLightboxImage(order.image_data)}
                                            className="relative flex-shrink-0 group w-12 h-12 rounded-lg overflow-hidden border border-rose-200 shadow-sm"
                                          >
                                            <img src={order.image_data} alt="Ref photo" className="w-full h-full object-cover" />
                                            <span className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center text-[8px] text-white font-bold uppercase">View</span>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="py-4 px-6 whitespace-nowrap">
                                  <div href={`tel:${order.customer_name}`} className="text-slate-600 hover:text-pink-600 font-medium inline-flex items-center gap-1 text-xs">
                                    <User2Icon className="w-3 h-3 text-slate-400" />
                                    {order.customer_name}
                                  </div>
                                </td>

                                <td className="py-4 px-6 whitespace-nowrap">
                                  <a href={`tel:${order.contact_no}`} className="text-slate-600 hover:text-pink-600 font-medium inline-flex items-center gap-1 text-xs">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    {order.contact_no}
                                  </a>
                                </td>
                            

                                <td className="py-4 px-6 text-right whitespace-nowrap">
                                  <div className="font-mono text-xs">
                                    <div className="font-mono text-xs">Total: ₹{Number(order.total_amount).toFixed(2)}</div>
                                    <div className="text-emerald-600 font-semibold">Adv: ₹{Number(order.advance_amount).toFixed(2)}</div>
                                    <div className="text-slate-400">Due: ₹{Number(order.balance_amount).toFixed(2)}</div>
                                  </div>
                                </td>

                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                  {/* PORTION & SIZE GROUPED BREAKDOWN BY ACTIVE FLAVOR TODAY */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100/60 shadow-md">
                    <div className="flex items-center gap-2 mb-6 border-b border-rose-50 pb-3">
                      <BarChart3 className="w-5 h-5 text-amber-500" />
                      <h3 className="font-bold text-slate-800 text-lg">Today's Orders & Size Breakdown per Flavor</h3>
                    </div>

                    {analytics.todayCount === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-sm">
                        No orders registered for today ({new Date().toLocaleDateString('en-CA')}).
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {analytics.todaySummaryData.map((item) => (
                          <div key={item.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                              <span className="bg-pink-100 text-pink-700 text-xs font-extrabold px-2 py-0.5 rounded-full">
                                {item.sizes.total} order(s)
                              </span>
                            </div>

                            {/* Size badge pills */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {item.sizes.medium > 0 && (
                                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-indigo-100">
                                  Medium: {item.sizes.medium}
                                </span>
                              )}
                              {item.sizes.large > 0 && (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100">
                                  Large: {item.sizes.large}
                                </span>
                              )}
                              {item.sizes.custom > 0 && (
                                <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-amber-100">
                                  Custom: {item.sizes.custom}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* VIEW 3: MANAGE FLAVORS (ADMIN ONLY) */}
        {activeTab === 'manage-flavors' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">

            {/* ADD FLAVOR FORM */}
            <div className="lg:col-span-4 bg-white rounded-3xl shadow-xl border border-rose-100 p-6">
              <div className="border-b border-rose-100 pb-3 mb-5">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-pink-500" />
                  Add New Flavor
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Define metadata and standard pricing columns.</p>
              </div>

              <form onSubmit={handleAddFlavor} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flavor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pistachio Cardamom"
                    value={newFlavorName}
                    onChange={handleFlavorNameChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      Medium Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 550"
                      value={newFlavorPriceMedium}
                      onChange={(e) => setNewFlavorPriceMedium(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      Large Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 1000"
                      value={newFlavorPriceLarge}
                      onChange={(e) => setNewFlavorPriceLarge(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingFlavor}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Layers className="w-4 h-4" />
                  {isSavingFlavor ? 'Saving...' : 'Save Flavor'}
                </button>
              </form>
            </div>

            {/* FLAVORS LIST TABLE */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-rose-100 p-6">
              <div className="border-b border-rose-100 pb-3 mb-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5 text-pink-500" />
                    Available Flavors List ({flavors.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">These directly populate the placing order drop-down menu.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3 px-4">Flavor Name</th>
                      <th className="py-3 px-4">Slug ID Key</th>
                      <th className="py-3 px-4 text-right">Medium Price</th>
                      <th className="py-3 px-4 text-right">Large Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {flavors.map((flv) => (
                      <tr key={flv.id} className="hover:bg-slate-50/70 transition-colors text-sm">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {flv.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                            {flv.id}
                          </code>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                          {flv.price_medium ? `₹${flv.price_medium}` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                          {flv.price_large ? `₹${flv.price_large}` : '—'}
                        </td>
                      </tr>
                    ))}
                    {flavors.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">
                          No flavors added yet. Use the form on the left to add flavors!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 3: MANAGE FLAVORS (ADMIN ONLY) */}
        {activeTab === 'cake-count' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">

            {/* ADD FLAVOR FORM */}
            <div className="lg:col-span-4 bg-white rounded-3xl shadow-xl border border-rose-100 p-6">
              <div className="border-b border-rose-100 pb-3 mb-5">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-pink-500" />
                  Add Target Cakes List
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Add cakes to be completed in this session.</p>
              </div>

              <form onSubmit={handleTarget} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flavor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. White Forest"
                    value={flavorNameForTarget}
                    onChange={(e) => setFlavorNameForTarget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      Kg
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter in Kgs"
                      value={kgForTarget}
                      onChange={(e) => setKgForTarget(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter count"
                      value={countForTarget}
                      onChange={(e) => setCountForTarget(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Select Type
                    </label>
                    <select
                      required
                      value={typeForTarget}
                      onChange={(e) => setTypeForTarget(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 bg-white"
                    >
                      <option value="" disabled hidden>-- Select an option --</option>
                      {TARGET_TYPE.map(q => (
                        <option key={q.id} value={q.id}>{q.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      Remarks
                    </label>
                    <input
                      type="text"
                      placeholder="Remarks if any"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingTarget}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Layers className="w-4 h-4" />
                  {isSavingTarget ? 'Saving...' : 'Save Target'}
                </button>
              </form>
            </div>

            {/* FLAVORS LIST TABLE */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-rose-100 p-6">
              <div className="border-b border-rose-100 pb-3 mb-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5 text-pink-500" />
                    Targets For Session ({targets.length})
                  </h3>
                </div>
                <button
                        onClick={() => handlePrintOnlyTable('target-table')}
                        className="no-print bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 text-xs self-end sm:self-auto"
                      >
                        <Printer className="w-4 h-4" />
                        Print to PDF
                      </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" id="target-table" >
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3 px-4">Flavor Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Kg</th>
                      <th className="py-3 px-4">Count</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {targets.map((flv) => (
                      <tr key={flv.id} className="hover:bg-slate-50/70 transition-colors text-sm">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {flv.flavor}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {flv.type}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {flv.kg}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {flv.count}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {flv.remarks}
                        </td>
                        
                      </tr>
                    ))}
                    {targets.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">
                          No flavors added yet. Use the form on the left to add flavors!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
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