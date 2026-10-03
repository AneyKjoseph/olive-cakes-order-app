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
const CUSTOM_SESSION_KEY = 'olive_order_custom_session';
const SUPER_ADMIN_FALLBACK = {
  userId: 'superadmin',
  password: 'Olive@2026'
};
const SHOP_TABLE = 'shops';
const SHOP_INVENTORY_TABLE = 'shop_inventory';
const SHOP_SALES_TABLE = 'shop_sales';
const USER_ROLE_LABELS = {
  super_admin: 'Super Admin',
  kitchen_admin: 'Kitchen Admin',
  shop_manager: 'Shop Manager'
};

const normalizeShopInventory = (item = {}) => ({
  id: item.id ?? crypto.randomUUID(),
  shop_id: item.shop_id ?? item.shopId ?? null,
  flavor_id: item.flavor_id ?? item.flavorId ?? null,
  flavor: item.flavor ?? item.flavor_name ?? item.flavors?.name ?? '',
  quantity: item.quantity ?? '1 kg',
  count: Number(item.count ?? item.assigned_count ?? 0),
  sold: Number(item.sold ?? 0),
  status: item.status ?? 'pending',
  received_at: item.received_at ?? item.receivedAt ?? null,
  sales: Array.isArray(item.sales) ? item.sales : []
});

const normalizeShopRecord = (shop = {}, inventoryRows = []) => ({
  id: shop.id,
  name: shop.name ?? 'Shop',
  inventory: (inventoryRows || []).map((item) => normalizeShopInventory(item))
});

export default function App() {
  const [activeTab, setActiveTab] = useState('order-form');
  const [previousTab, setPreviousTab] = useState('order-form');
  const [dashboardView, setDashboardView] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Supabase client reference

  const [isLiveConnection, setIsLiveConnection] = useState(true);

  // Admin Security session validation
  const [isAdmin, setIsAdmin] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // JWT-based shared login flow
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [assignedShopIds, setAssignedShopIds] = useState([]);
  const [authForm, setAuthForm] = useState({ userId: '', password: '' });
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Toast System banner
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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

  const [shops, setShops] = useState([]);
  const [newShopName, setNewShopName] = useState('');
  const [newShopManagerId, setNewShopManagerId] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [newAssignmentFlavor, setNewAssignmentFlavor] = useState('');
  const [newAssignmentQuantity, setNewAssignmentQuantity] = useState('medium');
  const [newAssignmentCustomQuantity, setNewAssignmentCustomQuantity] = useState('');
  const [newAssignmentCount, setNewAssignmentCount] = useState('1');
  const [inventoryViewDate, setInventoryViewDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [kitchenSessionName, setKitchenSessionName] = useState('');
  const [newSessionFlavor, setNewSessionFlavor] = useState('');
  const [newSessionQuantity, setNewSessionQuantity] = useState('medium');
  const [newSessionCustomQuantity, setNewSessionCustomQuantity] = useState('');
  const [newSessionCount, setNewSessionCount] = useState('1');
  const [kitchenSessionDraftItems, setKitchenSessionDraftItems] = useState([]);
  const [kitchenSessions, setKitchenSessions] = useState([]);
  const [loggedInShopId, setLoggedInShopId] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('shop_manager');
  const [shopManagers, setShopManagers] = useState([]);

  // Full Screen Lightbox parameters
  const [lightboxImage, setLightboxImage] = useState(null);

  const persistCustomSession = (user, role, shopIds = []) => {
    const payload = {
      session: {
        access_token: 'custom-user-token',
        expires_at: Date.now() + 60 * 60 * 1000,
        user
      },
      currentUser: user,
      userRole: role,
      assignedShopIds: shopIds
    };

    localStorage.setItem(CUSTOM_SESSION_KEY, JSON.stringify(payload));
  };

  const clearCustomSession = () => {
    localStorage.removeItem(CUSTOM_SESSION_KEY);
  };

  const fetchUserRoleAndAccess = async (user) => {
    if (!user) {
      setCurrentUser(null);
      setUserRole('');
      setAssignedShopIds([]);
      return { role: '', shopIds: [] };
    }

    const lookupKey = user.user_id || user.id;
    const profileQuery = supabase
      .schema(cakeOrderSchema)
      .from('user_profiles')
      .select('*');

    const { data: profile, error: profileError } = await (
      lookupKey && (user.id || user.user_id)
        ? profileQuery.or(`id.eq.${user.id || 'null'},user_id.eq.${user.user_id || lookupKey}`).maybeSingle()
        : profileQuery.eq('user_id', lookupKey).maybeSingle()
    );

    if (profileError || !profile) {
      setUserRole('');
      setAssignedShopIds([]);
      setAuthError('User profile not found in the database.');
      return { role: '', shopIds: [] };
    }

    setCurrentUser({ ...user, id: profile.id || user.id, user_id: profile.user_id || user.user_id, role: profile.role || user.role });
    setUserRole(profile.role || user.role || '');

    let shopIds = [];

    if (profile.role === 'shop_manager') {
      const { data: accessRows, error: accessError } = await supabase
        .schema(cakeOrderSchema)
        .from('user_shop_access')
        .select('shop_id')
        .eq('user_id', profile.id || user.id);

      if (!accessError) {
        shopIds = (accessRows || []).map((entry) => entry.shop_id).filter(Boolean);
        setAssignedShopIds(shopIds);
        if (shopIds.length > 0) {
          setLoggedInShopId(shopIds[0]);
        }
      }
    } else {
      setAssignedShopIds([]);
      setLoggedInShopId(null);
    }

    return { role: profile.role || user.role || '', shopIds };
  };

  const handleJWTLogin = async (e) => {
    e.preventDefault();
    if (!authForm.userId || !authForm.password) {
      setAuthError('User ID and password are required.');
      return;
    }

    const trimmedUserId = authForm.userId.trim();
    const password = authForm.password;

    if (
      trimmedUserId.toLowerCase() === SUPER_ADMIN_FALLBACK.userId.toLowerCase() &&
      password === SUPER_ADMIN_FALLBACK.password
    ) {
      const fallbackUser = {
        id: 'super-admin-fallback',
        user_id: 'superadmin'
      };

      const fallbackSession = {
        access_token: 'local-super-admin-token',
        user: fallbackUser
      };

      setCurrentUser(fallbackUser);
      setUserRole('super_admin');
      setAssignedShopIds([]);
      setSession(fallbackSession);
      persistCustomSession(fallbackUser, 'super_admin', []);
      setAuthError('');
      setIsAdmin(false);
      setPasscodeError('');
      setPasscodeInput('');
      setAuthLoading(false);
      return;
    }

    try {
      setAuthLoading(true);
      const { data, error } = await supabase
        .schema(cakeOrderSchema)
        .from('user_profiles')
        .select('*')
        .eq('user_id', trimmedUserId)
        .maybeSingle();

      if (error) throw error;

      if (!data || data.password !== password) {
        setAuthError('Invalid User ID or password.');
        return;
      }

      const dbUser = {
        id: data.id || data.user_id,
        user_id: data.user_id,
        full_name: data.full_name,
        role: data.role
      };

      const nextSession = {
        access_token: 'db-user-token',
        user: dbUser
      };

      const { role, shopIds } = await fetchUserRoleAndAccess(dbUser);
      setSession(nextSession);
      persistCustomSession(dbUser, role || data.role || '', shopIds);
      setAuthError('');
      setIsAdmin(false);
      setPasscodeError('');
      setPasscodeInput('');
    } catch (error) {
      console.error('User ID login failed:', error);
      setAuthError(error.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleJWTLogout = async () => {
    clearCustomSession();
    setSession(null);
    setCurrentUser(null);
    setUserRole('');
    setAssignedShopIds([]);
    setAuthError('');
    setLoggedInShopId(null);
    setIsAdmin(false);
  };

  const effectiveIsAdmin = userRole === 'super_admin' || userRole === 'kitchen_admin' || isAdmin;
  const effectiveUserLabel = USER_ROLE_LABELS[userRole] || 'User';

  const loadShopManagers = async () => {
    if (!effectiveIsAdmin) return;

    const { data, error } = await supabase
      .schema(cakeOrderSchema)
      .from('user_profiles')
      .select('id, full_name, role')
      .eq('role', 'shop_manager');

    if (!error) {
      setShopManagers(data || []);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const normalizedUserId = newUserEmail.trim();

    if (!normalizedUserId || !newUserPassword || !newUserName) {
      showToast('Name, user ID and password are required.', 'error');
      return;
    }

    if (!/^[A-Za-z0-9_-]+$/.test(normalizedUserId)) {
      showToast('User ID must be alphanumeric with optional underscore or hyphen.', 'error');
      return;
    }

    try {
      const { data: existingUser, error: duplicateCheckError } = await supabase
        .schema(cakeOrderSchema)
        .from('user_profiles')
        .select('id')
        .eq('user_id', normalizedUserId)
        .maybeSingle();

      if (duplicateCheckError) throw duplicateCheckError;

      if (existingUser) {
        showToast('This User ID already exists. Please choose another one.', 'error');
        return;
      }

      const { data, error: profileError } = await supabase
        .schema(cakeOrderSchema)
        .from('user_profiles')
        .insert([{
          user_id: normalizedUserId,
          full_name: newUserName.trim(),
          phone: newUserPhone.trim(),
          role: newUserRole,
          password: newUserPassword,
          is_active: true
        }])
        .select();

      if (profileError) throw profileError;

      showToast(`${newUserName} created successfully.`);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserPhone('');
      setNewUserRole('shop_manager');
      await loadShopManagers();
      console.log('Created user profile:', data);
    } catch (error) {
      console.error('User creation failed:', error);
      showToast(error.message || 'Could not create user.', 'error');
    }
  };

  const handleResetToToday = () => {
    setFilterDate(new Date().toLocaleDateString('en-CA'));
  };

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;
    setPreviousTab(activeTab);
    setActiveTab(nextTab);
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
    const initSession = async () => {
      try {
        const storedSession = localStorage.getItem(CUSTOM_SESSION_KEY);
        if (!storedSession) {
          setSession(null);
          setCurrentUser(null);
          setUserRole('');
          setAssignedShopIds([]);
          setAuthLoading(false);
          return;
        }

        const parsed = JSON.parse(storedSession);
        const storedUser = parsed?.currentUser;

        if (!storedUser) {
          clearCustomSession();
          setSession(null);
          setCurrentUser(null);
          setUserRole('');
          setAssignedShopIds([]);
          setAuthLoading(false);
          return;
        }

        setSession(parsed?.session || { access_token: 'custom-user-token', user: storedUser });
        setCurrentUser(storedUser);
        setUserRole(parsed?.userRole || '');
        setAssignedShopIds(parsed?.assignedShopIds || []);
        if (parsed?.assignedShopIds?.length) {
          setLoggedInShopId(parsed.assignedShopIds[0]);
        }
      } catch (error) {
        console.error('Custom session restore failed:', error);
        clearCustomSession();
        setSession(null);
        setCurrentUser(null);
        setUserRole('');
        setAssignedShopIds([]);
      } finally {
        setAuthLoading(false);
      }
    };

    initSession();
  }, []);

  useEffect(() => {
    if (effectiveIsAdmin) {
      loadShopManagers();
    }
  }, [effectiveIsAdmin]);

  useEffect(() => {
    if (!currentUser || !userRole) return;
    if (isLiveConnection && supabase) {
      loadKitchenSessionsFromSupabase();
    }
  }, [currentUser, userRole, isLiveConnection, flavors]);

  useEffect(() => {
    const savedShops = localStorage.getItem('local_cake_shops');
    if (savedShops) {
      setShops(JSON.parse(savedShops));
    }

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
    loadShopsFromSupabase();

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

  const loadShopsFromSupabase = async () => {
    if (!isLiveConnection || !supabase) {
      const savedShops = localStorage.getItem('local_cake_shops');
      if (savedShops) {
        setShops(JSON.parse(savedShops));
      }
      return;
    }

    try {
      const { data: shopRows, error: shopsError } = await supabase
        .schema(cakeOrderSchema)
        .from(SHOP_TABLE)
        .select('*')
        .order('created_at', { ascending: true });

      if (shopsError) throw shopsError;

      const { data: inventoryRows, error: inventoryError } = await supabase
        .schema(cakeOrderSchema)
        .from(SHOP_INVENTORY_TABLE)
        .select('*, flavors!flavor_id(id, name)')
        .order('created_at', { ascending: true });

      if (inventoryError) throw inventoryError;

      const { data: salesRows, error: salesError } = await supabase
        .schema(cakeOrderSchema)
        .from(SHOP_SALES_TABLE)
        .select('*')
        .order('created_at', { ascending: true });

      if (salesError) throw salesError;

      const inventoryByShop = (inventoryRows || []).reduce((acc, item) => {
        const key = item.shop_id ?? item.shopId;
        if (!key) return acc;
        acc[key] = [...(acc[key] || []), normalizeShopInventory({
          ...item,
          flavor: item.flavors?.name || item.flavor || '',
          flavor_id: item.flavor_id ?? item.flavorId ?? null,
          sales: []
        })];
        return acc;
      }, {});

      (salesRows || []).forEach((sale) => {
        const shopKey = Number(sale.shop_id ?? 0);
        if (!shopKey) return;

        const matchingItems = inventoryByShop[shopKey] || [];
        const targetItem = matchingItems.find((item) => {
          const sameFlavor = String(item.flavor_id ?? '') === String(sale.flavor_id ?? '');
          const sameQuantity = !sale.quantity || String(item.quantity ?? '') === String(sale.quantity ?? '');
          return sameFlavor && sameQuantity;
        });

        if (!targetItem) return;

        targetItem.sales = [
          ...(targetItem.sales || []),
          {
            id: sale.id,
            channel: sale.sale_type,
            quantity: Number(sale.units || 0),
            date: sale.sale_date || sale.created_at
          }
        ];
      });

      const nextShops = (shopRows || []).map((shop) =>
        normalizeShopRecord(shop, inventoryByShop[shop.id] || [])
      );

      setShops(nextShops);
      localStorage.setItem('local_cake_shops', JSON.stringify(nextShops));
    } catch (error) {
      console.warn('Failed to load shops from Supabase, using local fallback.', error);
      const savedShops = localStorage.getItem('local_cake_shops');
      if (savedShops) {
        setShops(JSON.parse(savedShops));
      }
    }
  };

  const persistShops = (nextShops) => {
    setShops(nextShops);
    localStorage.setItem('local_cake_shops', JSON.stringify(nextShops));
  };

  const loadKitchenSessionsFromSupabase = async () => {
    if (!isLiveConnection || !supabase) {
      const storedSessions = localStorage.getItem('local_kitchen_sessions');
      if (storedSessions) {
        setKitchenSessions(JSON.parse(storedSessions));
      }
      return;
    }

    try {
      const { data: sessionRows, error: sessionError } = await supabase
        .schema(cakeOrderSchema)
        .from('kitchen_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionError) throw sessionError;

      const { data: itemRows, error: itemError } = await supabase
        .schema(cakeOrderSchema)
        .from('kitchen_session_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (itemError) throw itemError;

      const itemMap = {};
      (itemRows || []).forEach((item) => {
        const sessionId = item.session_id;
        const flavorName = flavors.find((flavor) => String(flavor.id) === String(item.flavor_id))?.name || item.flavor_id;
        itemMap[sessionId] = [
          ...(itemMap[sessionId] || []),
          {
            id: item.id,
            flavorId: String(item.flavor_id),
            flavorName,
            quantity: item.quantity,
            count: Number(item.count || 0),
            approved: Boolean(item.approved),
            shopId: Number(item.shop_id ?? 0),
            validatedAt: item.approved_at,
            sessionId
          }
        ];
      });

      const nextSessions = (sessionRows || []).map((session) => {
        const sessionItems = itemMap[session.id] || [];
        const firstItem = sessionItems[0];
        return {
          id: session.id,
          name: session.name || 'Session batch',
          shopId: Number(firstItem?.shopId ?? 0),
          date: session.session_date || (session.created_at ? new Date(session.created_at).toISOString().slice(0, 10) : inventoryViewDate),
          created_at: session.created_at,
          items: sessionItems
        };
      });

      setKitchenSessions(nextSessions);
      localStorage.setItem('local_kitchen_sessions', JSON.stringify(nextSessions));
    } catch (error) {
      console.warn('Failed to load kitchen sessions from Supabase.', error);
      const savedSessions = localStorage.getItem('local_kitchen_sessions');
      if (savedSessions) {
        setKitchenSessions(JSON.parse(savedSessions));
      }
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    const shopName = newShopName.trim();

    if (!shopName) {
      return showToast('Shop name is required.', 'error');
    }

    if (!newShopManagerId) {
      return showToast('Select a manager to assign this shop to.', 'error');
    }

    const payload = {
      name: shopName,
      created_at: new Date().toISOString()
    };

    try {
      let createdShopId = null;

      if (isLiveConnection && supabase) {
        const { data: createdShop, error: shopError } = await supabase
          .schema(cakeOrderSchema)
          .from(SHOP_TABLE)
          .insert([payload])
          .select('id, name, created_at')
          .single();

        if (shopError) throw shopError;
        createdShopId = createdShop?.id;
      } else {
        const fallbackShop = {
          ...payload,
          id: crypto.randomUUID()
        };
        const nextShops = [...shops, normalizeShopRecord(fallbackShop, [])];
        persistShops(nextShops);
        createdShopId = fallbackShop.id;
      }

      if (createdShopId && isLiveConnection && supabase) {
        const { error: accessError } = await supabase
          .schema(cakeOrderSchema)
          .from('user_shop_access')
          .insert([
            {
              user_id: Number(newShopManagerId),
              shop_id: Number(createdShopId)
            }
          ]);

        if (accessError) throw accessError;
      }

      const nextShops = [...shops];
      if (createdShopId && !isLiveConnection) {
        const fallbackShop = {
          id: createdShopId,
          name: shopName,
          inventory: []
        };
        nextShops.push(normalizeShopRecord(fallbackShop, []));
      }

      if (isLiveConnection && supabase) {
        await loadShopsFromSupabase();
      } else {
        persistShops(nextShops);
      }

      setNewShopName('');
      setNewShopManagerId('');
      setSelectedShopId(String(createdShopId || ''));
      showToast(`Shop "${shopName}" created and assigned successfully.`);
    } catch (error) {
      console.error('Create shop failed:', error);
      showToast('Unable to create shop and assign manager.', 'error');
    }
  };

  const handleAddShopInventory = async (e) => {
    e.preventDefault();
    if (!selectedShopId) {
      return showToast('Select a shop first.', 'error');
    }

    const normalizedFlavorValue = String(newAssignmentFlavor ?? '').trim();
    const selectedFlavor = flavors.find((flavor) => String(flavor.id) === normalizedFlavorValue);
    const flavorId = Number(selectedFlavor?.id ?? normalizedFlavorValue);
    const flavorName = selectedFlavor?.name || normalizedFlavorValue || '';
    const normalizedQuantityValue = String(newAssignmentQuantity ?? '').trim();
    const normalizedCustomQty = String(newAssignmentCustomQuantity ?? '').trim();
    const quantity = normalizedQuantityValue === 'custom' ? normalizedCustomQty : normalizedQuantityValue;
    const count = Number(newAssignmentCount);

    if (!normalizedFlavorValue || !Number.isFinite(flavorId) || flavorId <= 0) {
      return showToast('Please select a flavor before assigning stock.', 'error');
    }

    if (!quantity || (normalizedQuantityValue === 'custom' && !normalizedCustomQty)) {
      return showToast('Please enter a valid quantity before assigning stock.', 'error');
    }

    if (!Number.isFinite(count) || count <= 0) {
      return showToast('Flavor, quantity, and count are required.', 'error');
    }

    try {
      const currentShop = shops.find((shop) => shop.id === selectedShopId);
      const existingItem = currentShop?.inventory.find((item) =>
        Number(item.flavor_id ?? item.flavorId ?? 0) === flavorId && item.quantity === quantity
      );

      if (isLiveConnection && supabase) {
        const payload = {
          shop_id: Number(selectedShopId),
          flavor_id: flavorId,
          quantity,
          count: existingItem ? Number(existingItem.count || 0) + count : count,
          sold: Number(existingItem?.sold || 0),
          status: existingItem?.status === 'sold_out' ? 'verified' : existingItem?.status || 'pending',
          received_at: existingItem?.received_at ?? null,
          created_at: new Date().toISOString()
        };

        const { error } = await supabase
          .schema(cakeOrderSchema)
          .from(SHOP_INVENTORY_TABLE)
          .upsert([payload], { onConflict: 'shop_id,flavor_id,quantity' });

        if (error) throw error;
      }

      const nextShops = shops.map((shop) => {
        if (shop.id !== selectedShopId) return shop;

        const existingIndex = shop.inventory.findIndex((item) =>
          Number(item.flavor_id ?? item.flavorId ?? 0) === flavorId && item.quantity === quantity
        );

        if (existingIndex >= 0) {
          const updatedInventory = [...shop.inventory];
          updatedInventory[existingIndex] = {
            ...updatedInventory[existingIndex],
            count: Number(updatedInventory[existingIndex].count || 0) + count,
            sold: Number(updatedInventory[existingIndex].sold || 0),
            status: updatedInventory[existingIndex].status === 'sold_out' ? 'verified' : updatedInventory[existingIndex].status,
            received_at: updatedInventory[existingIndex].received_at ?? null
          };
          return { ...shop, inventory: updatedInventory };
        }

        return {
          ...shop,
          inventory: [...shop.inventory, normalizeShopInventory({
            id: crypto.randomUUID(),
            shop_id: selectedShopId,
            flavor_id: flavorId,
            flavor: flavorName,
            quantity,
            count,
            sold: 0,
            status: 'pending',
            received_at: null,
            sales: []
          })]
        };
      });

      persistShops(nextShops);
      setShops(nextShops);
      setNewAssignmentFlavor('');
      setNewAssignmentQuantity('medium');
      setNewAssignmentCustomQuantity('');
      setNewAssignmentCount('1');
      showToast('Inventory assigned to shop successfully.');
      if (isLiveConnection && supabase) {
        await loadShopsFromSupabase();
      }
    } catch (error) {
      console.error('Inventory assignment failed:', error);
      showToast('Inventory assignment could not be saved.', 'error');
    }
  };

  const handleAddSessionDraftItem = () => {
    if (!selectedShopId) {
      showToast('Choose a shop before adding inventory items.', 'error');
      return;
    }

    
    const flavor = newSessionFlavor.trim();
    const quantity = newSessionQuantity === 'custom' ? newSessionCustomQuantity : newSessionQuantity;
    const count = Number(newSessionCount);

    if (!flavor) {
      showToast('Select a flavor for the kitchen session.', 'error');
      return;
    }

    if (!quantity) {
      showToast('Enter a valid quantity for the session item.', 'error');
      return;
    }

    if (!Number.isFinite(count) || count <= 0) {
      showToast('Session count must be greater than zero.', 'error');
      return;
    }

    const flavorName = flavors.find((entry) => String(entry.id) === String(flavor))?.name || flavor;

    setKitchenSessionDraftItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        flavorId: flavor,
        flavorName,
        quantity,
        count,
        date: inventoryViewDate
      }
    ]);

    setNewSessionFlavor('');
    setNewSessionQuantity('medium');
    setNewSessionCustomQuantity('');
    setNewSessionCount('1');
    showToast('Flavor added to the kitchen session draft.');
  };

  const handleCreateKitchenSession = async (e) => {
    e.preventDefault();

    if (!selectedShopId) {
      showToast('Choose a shop before saving inventory.', 'error');
      return;
    }

    if (!kitchenSessionDraftItems.length) {
      showToast('Add at least one flavor before saving inventory.', 'error');
      return;
    }

    const sessionName = kitchenSessionName.trim() || `Inventory ${new Date().toLocaleDateString('en-CA')}`;

    try {
      let sessionId = crypto.randomUUID();
      const nextSessionItems = kitchenSessionDraftItems.map((item) => ({
        id: crypto.randomUUID(),
        flavorId: String(item.flavorId),
        flavorName: item.flavorName || item.flavorId,
        quantity: String(item.quantity || 'medium'),
        count: Number(item.count || 0),
        approved: false,
        shopId: Number(selectedShopId),
        validatedAt: null
      }));

      const pendingInventoryRows = kitchenSessionDraftItems.map((item) => ({
        shop_id: Number(selectedShopId),
        flavor_id: String(item.flavorId),
        quantity: String(item.quantity || 'medium'),
        count: Number(item.count || 0),
        sold: 0,
        status: 'pending',
        received_at: null,
        created_at: new Date().toISOString()
      }));

      if (isLiveConnection && supabase) {
        const { data: sessionData, error: sessionError } = await supabase
          .schema(cakeOrderSchema)
          .from('kitchen_sessions')
          .insert([
            {
              name: sessionName,
              session_date: inventoryViewDate,
              created_by: currentUser?.id ?? null
            }
          ])
          .select('id')
          .single();

        if (sessionError) throw sessionError;
        sessionId = sessionData?.id || sessionId;

        const itemRows = kitchenSessionDraftItems.map((item) => ({
          session_id: sessionId,
          shop_id: Number(selectedShopId),
          flavor_id: String(item.flavorId),
          quantity: String(item.quantity || 'medium'),
          count: Number(item.count || 0),
          approved: false,
          approved_by: null,
          approved_at: null
        }));

        const { error: itemError } = await supabase
          .schema(cakeOrderSchema)
          .from('kitchen_session_items')
          .insert(itemRows);

        if (itemError) throw itemError;

        const { error: inventoryError } = await supabase
          .schema(cakeOrderSchema)
          .from(SHOP_INVENTORY_TABLE)
          .upsert(pendingInventoryRows, { onConflict: 'shop_id,flavor_id,quantity' });

        if (inventoryError) throw inventoryError;
      }

      const nextShops = shops.map((shop) => {
        if (shop.id !== Number(selectedShopId)) return shop;

        const mergedInventory = [...shop.inventory];

        pendingInventoryRows.forEach((inventoryRow) => {
          const existingIndex = mergedInventory.findIndex((item) =>
            String(item.flavor_id ?? item.flavorId ?? '') === String(inventoryRow.flavor_id) &&
            String(item.quantity ?? '') === String(inventoryRow.quantity)
          );

          if (existingIndex >= 0) {
            const currentItem = mergedInventory[existingIndex];
            mergedInventory[existingIndex] = {
              ...currentItem,
              count: Number(currentItem.count || 0) + Number(inventoryRow.count || 0),
              sold: Number(currentItem.sold || 0),
              status: currentItem.status === 'sold_out' ? 'verified' : 'pending',
              received_at: currentItem.received_at ?? null
            };
            return;
          }

          const selectedFlavor = flavors.find((flavor) => String(flavor.id) === String(inventoryRow.flavor_id));
          mergedInventory.push(normalizeShopInventory({
            id: crypto.randomUUID(),
            shop_id: inventoryRow.shop_id,
            flavor_id: inventoryRow.flavor_id,
            flavor: selectedFlavor?.name || inventoryRow.flavor_id,
            quantity: inventoryRow.quantity,
            count: inventoryRow.count,
            sold: 0,
            status: 'pending',
            received_at: null,
            sales: []
          }));
        });

        return { ...shop, inventory: mergedInventory };
      });

      persistShops(nextShops);
      setShops(nextShops);

      const nextSession = {
        id: sessionId,
        name: sessionName,
        shopId: Number(selectedShopId),
        date: inventoryViewDate,
        created_at: new Date().toISOString(),
        items: nextSessionItems
      };

      setKitchenSessions((prev) => [nextSession, ...prev]);
      setKitchenSessionName('');
      setKitchenSessionDraftItems([]);
      setNewSessionFlavor('');
      setNewSessionQuantity('medium');
      setNewSessionCustomQuantity('');
      setNewSessionCount('1');
      showToast('Kitchen session saved and shop inventory marked as pending.');
    } catch (error) {
      console.error('Inventory save failed:', error);
      showToast('Unable to save inventory batch to the kitchen session tables.', 'error');
    }
  };

  const handleApproveKitchenSessionItem = async (sessionId, itemId) => {
    const session = kitchenSessions.find((entry) => entry.id === sessionId);
    const item = session?.items.find((entry) => entry.id === itemId);

    if (!item) {
      showToast('Session item not found.', 'error');
      return;
    }

    const targetShopId = loggedInShopId || selectedShopId;
    if (!targetShopId) {
      showToast('Select a shop before validating the session item.', 'error');
      return;
    }

    try {
      const inventoryPayload = {
        shop_id: Number(targetShopId),
        flavor_id: String(item.flavorId),
        quantity: String(item.quantity || 'medium'),
        count: Number(item.count || 0),
        sold: 0,
        status: 'verified',
        received_at: session?.date || inventoryViewDate,
        created_at: new Date().toISOString()
      };

      if (isLiveConnection && supabase) {
        const { error: inventoryError } = await supabase
          .schema(cakeOrderSchema)
          .from(SHOP_INVENTORY_TABLE)
          .upsert([inventoryPayload], { onConflict: 'shop_id,flavor_id,quantity' });

        if (inventoryError) throw inventoryError;

        const { error: itemUpdateError } = await supabase
          .schema(cakeOrderSchema)
          .from('kitchen_session_items')
          .update({
            approved: true,
            approved_by: currentUser?.id ?? null,
            approved_at: new Date().toISOString()
          })
          .eq('id', itemId);

        if (itemUpdateError) throw itemUpdateError;

        const { data: existingInventoryRows, error: inventoryFetchError } = await supabase
          .schema(cakeOrderSchema)
          .from(SHOP_INVENTORY_TABLE)
          .select('*')
          .eq('shop_id', Number(targetShopId))
          .eq('flavor_id', String(item.flavorId))
          .eq('quantity', String(item.quantity || 'medium'))
          .maybeSingle();

        if (inventoryFetchError) throw inventoryFetchError;

        if (existingInventoryRows) {
          const nextCount = Number(existingInventoryRows.count || 0) + Number(item.count || 0);
          const { error: inventoryStatusError } = await supabase
            .schema(cakeOrderSchema)
            .from(SHOP_INVENTORY_TABLE)
            .update({
              count: nextCount,
              status: 'verified',
              received_at: new Date().toISOString()
            })
            .eq('id', existingInventoryRows.id);

          if (inventoryStatusError) throw inventoryStatusError;
        }
      }

      const nextShops = shops.map((shop) => {
        if (shop.id !== targetShopId) return shop;

        const existingIndex = shop.inventory.findIndex((inventoryItem) =>
          String(inventoryItem.flavor_id ?? inventoryItem.flavorId ?? '') === String(item.flavorId) &&
          String(inventoryItem.quantity ?? '') === String(item.quantity)
        );

        if (existingIndex >= 0) {
          const updatedInventory = [...shop.inventory];
          updatedInventory[existingIndex] = {
            ...updatedInventory[existingIndex],
            count: Number(updatedInventory[existingIndex].count || 0) + Number(item.count || 0),
            sold: Number(updatedInventory[existingIndex].sold || 0),
            status: 'verified',
            received_at: updatedInventory[existingIndex].received_at ?? (session?.date || inventoryViewDate)
          };
          return { ...shop, inventory: updatedInventory };
        }

        return {
          ...shop,
          inventory: [...shop.inventory, normalizeShopInventory({
            id: crypto.randomUUID(),
            shop_id: targetShopId,
            flavor_id: item.flavorId,
            flavor: item.flavorName,
            quantity: item.quantity,
            count: item.count,
            sold: 0,
            status: 'verified',
            received_at: session?.date || inventoryViewDate,
            sales: []
          })]
        };
      });

      persistShops(nextShops);
      setShops(nextShops);
      setKitchenSessions((prev) => prev.map((entry) => entry.id === sessionId ? {
        ...entry,
        items: entry.items.map((sessionItem) => sessionItem.id === itemId ? {
          ...sessionItem,
          approved: true,
          shopId: targetShopId,
          validatedAt: new Date().toISOString()
        } : sessionItem)
      } : entry));

      showToast(`Session item "${item.flavorName}" was validated and marked as verified.`);
    } catch (error) {
      console.error('Approve kitchen session item failed:', error);
      showToast('Unable to validate this inventory item.', 'error');
    }
  };

  const handleMarkInventoryReceived = async (shopId, itemId) => {
    try {
      if (isLiveConnection && supabase) {
        const { error } = await supabase
          .schema(cakeOrderSchema)
          .from(SHOP_INVENTORY_TABLE)
          .update({
            status: 'verified',
            received_at: new Date().toISOString()
          })
          .eq('id', itemId);

        if (error) throw error;
      }

      const nextShops = shops.map((shop) => {
        if (shop.id !== shopId) return shop;
        return {
          ...shop,
          inventory: shop.inventory.map((item) =>
            item.id === itemId
              ? { ...item, status: 'verified', received_at: new Date().toISOString() }
              : item
          )
        };
      });

      persistShops(nextShops);
      showToast('Inventory marked as received and verified.');
      if (isLiveConnection && supabase) {
        await loadShopsFromSupabase();
      }
    } catch (error) {
      console.error('Received update failed:', error);
      showToast('Unable to mark inventory as received.', 'error');
    }
  };

  const handleMarkSale = async (shopId, itemId, channel) => {
    try {
      const shop = shops.find((entry) => entry.id === shopId);
      const item = shop?.inventory.find((inventoryItem) => inventoryItem.id === itemId);

      if (!item) {
        showToast('Inventory item not found.', 'error');
        return;
      }

      const assignedCount = Number(item.count || 0);
      const updatedSold = Number(item.sold || 0) + 1;
      if (updatedSold > assignedCount) {
        showToast('Sales cannot exceed the assigned stock.', 'error');
        return;
      }

      if (isLiveConnection && supabase) {
        const { error: salesError } = await supabase
          .schema(cakeOrderSchema)
          .from(SHOP_SALES_TABLE)
          .insert([{
            shop_id: Number(shopId),
            flavor_id: String(item.flavor_id ?? item.flavorId ?? ''),
            sale_type: channel,
            quantity: String(item.quantity || 'medium'),
            units: 1,
            amount: 0,
            sale_date: new Date().toISOString().slice(0, 10),
            created_by: currentUser?.id ?? null
          }]);

        if (salesError) throw salesError;

        const { error: inventoryError } = await supabase
          .schema(cakeOrderSchema)
          .from(SHOP_INVENTORY_TABLE)
          .update({
            sold: updatedSold,
            status: updatedSold >= assignedCount ? 'sold_out' : 'verified'
          })
          .eq('id', itemId);

        if (inventoryError) throw inventoryError;
      }

      const nextShops = shops.map((entry) => {
        if (entry.id !== shopId) return entry;

        return {
          ...entry,
          inventory: entry.inventory.map((inventoryItem) => {
            if (inventoryItem.id !== itemId) return inventoryItem;
            const nextSold = Number(inventoryItem.sold || 0) + 1;
            return {
              ...inventoryItem,
              sold: nextSold,
              status: nextSold >= Number(inventoryItem.count || 0) ? 'sold_out' : 'verified',
              sales: [
                ...(inventoryItem.sales || []),
                {
                  id: crypto.randomUUID(),
                  date: new Date().toISOString(),
                  channel,
                  quantity: 1
                }
              ]
            };
          })
        };
      });

      persistShops(nextShops);
      showToast(`Sale recorded via ${channel}.`);
      if (isLiveConnection && supabase) {
        await loadShopsFromSupabase();
      }
    } catch (error) {
      console.error('Sales update failed:', error);
      showToast('Could not record the sale.', 'error');
    }
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
      created_by: currentUser?.id ?? null,
      shop_id: loggedInShopId || selectedShopId || assignedShopIds[0] || null,
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

  const handleAdminVerify = (e) => {
    e.preventDefault();

    const trimmedCode = passcodeInput.trim();

    if (trimmedCode === ADMIN_PASSCODE) {
      setIsAdmin(true);
      setLoggedInShopId(null);
      setPasscodeError('');
      setPasscodeInput('');
      showToast("🔒 Admin access granted. Kitchen session active.");
      return;
    }

    setPasscodeError("Passcode incorrect. Access denied.");
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setLoggedInShopId(null);
    showToast("Admin dashboard locked.");
  };

  const visibleOrders = useMemo(() => {
    if (!userRole) return orders;
    if (userRole === 'super_admin' || userRole === 'kitchen_admin' || isAdmin) return orders;

    const managerShopIds = new Set(
      assignedShopIds
        .map((shopId) => Number(shopId))
        .filter((shopId) => Number.isFinite(shopId) && shopId > 0)
    );

    return orders.filter((order) => {
      const orderShopId = Number(order.shop_id ?? 0);
      const createdByCurrentUser = currentUser && (
        String(order.created_by ?? '') === String(currentUser.id ?? '') ||
        String(order.user_id ?? '') === String(currentUser.id ?? '')
      );
      const assignedShopMatch = managerShopIds.has(orderShopId);
      const legacyLocalOrderMatch = !orderShopId && createdByCurrentUser;
      return createdByCurrentUser || assignedShopMatch || legacyLocalOrderMatch;
    });
  }, [orders, userRole, currentUser, assignedShopIds, isAdmin]);

  const dashboardSummary = useMemo(() => ({
    visibleOrders: visibleOrders.length,
    userRole: userRole || 'guest',
    assignedShops: assignedShopIds.length
  }), [visibleOrders, userRole, assignedShopIds]);

  const analytics = useMemo(() => {
    const flavorCounts = {};
    flavors.forEach(f => { flavorCounts[f.id] = 0; });

    visibleOrders.forEach(order => {
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
    const targetDateOrders = visibleOrders.filter(order => {
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
    const strictlyTodayCount = visibleOrders.filter(order => {
      if (!order.date_time) return false;
      return order.date_time.split('T')[0] === todayLocalStr;
    }).length;

    return {
      totalAllTimeOrders: visibleOrders.length,
      flavorAllTimeSummary,
      todayOrders: targetOrdersSorted, // Renamed internally for compatibility but represents selected date
      todaySummaryData: selectedDateSummaryData,
      selectedDateSummaryData,
      todayCount: strictlyTodayCount,  // Strictly actual today's count for notification bubble
      selectedDateCount: targetDateOrders.length
    };
  }, [visibleOrders, flavors, filterDate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 text-slate-700">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl px-8 py-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-200 border-t-pink-500 mx-auto mb-3" />
          <p className="font-semibold">Checking session…</p>
        </div>
      </div>
    );
  }

  if (!session || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-7">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center shadow-inner">
              <Cake className="w-10 h-10 text-pink-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Olive Cakes</h1>
            <p className="text-sm text-slate-500 mt-1">Shared user login</p>
          </div>

          <form onSubmit={handleJWTLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">User ID</label>
              <input
                type="text"
                required
                value={authForm.userId}
                onChange={(e) => setAuthForm({ ...authForm, userId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                placeholder="superadmin"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                placeholder="Enter your password"
              />
            </div>

            {authError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-xl shadow-md hover:from-pink-700 hover:to-rose-600 transition-all disabled:opacity-60"
            >
              {authLoading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600">
            Temporary super admin login: User ID <span className="font-bold">superadmin</span> / Password <span className="font-bold">Olive@2026</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 text-slate-800 font-sans">

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex items-center justify-center lg:justify-start w-full lg:w-auto">
            <div className="p-2.5 bg-white-50 text-pink-600 rounded-2xl shadow-inner w-full max-w-[220px]">
              <img src="/header-image.png" className="w-full h-auto object-contain" alt="Olive Cakes logo" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto lg:justify-start">
            <nav className="flex flex-wrap justify-center bg-rose-50 p-1 rounded-xl border border-rose-100/60 items-center gap-1 w-full sm:w-auto">
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

              {effectiveIsAdmin && (
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
              {userRole === 'super_admin' && (
                <button
                  onClick={() => handleTabChange('super-admin')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'super-admin'
                      ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-sm'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                    }`}
                >
                  <User2Icon className="w-4 h-4" />
                  Users & Shops
                </button>
              )}

              {(effectiveIsAdmin || loggedInShopId || userRole === 'shop_manager') && (
                <button
                  onClick={() => handleTabChange('cake-count')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'cake-count'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                      : 'text-pink-600 bg-pink-100 hover:bg-pink-200'
                    }`}
                >
                  <Layers className="w-4 h-4" />
                  Manage inventory
                </button>
              )}
            </nav>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white/90 px-3 py-2 shadow-sm text-left transition-all hover:border-rose-200 hover:bg-rose-50"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white font-black text-sm shadow-sm">
                  {(currentUser?.full_name || currentUser?.user_id || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Profile</p>
                  <p className="text-sm font-bold text-slate-800 truncate max-w-[140px]">{currentUser?.full_name || currentUser?.user_id || 'User'}</p>
                  <p className="text-[10px] text-slate-500">{USER_ROLE_LABELS[userRole] || userRole || 'Guest'}</p>
                </div>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Signed in as</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 truncate">{currentUser?.full_name || currentUser?.user_id || 'User'}</p>
                    <p className="text-xs text-slate-500">{USER_ROLE_LABELS[userRole] || userRole || 'Guest'}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleJWTLogout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"
                  >
                    <Lock className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
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
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            <span className="font-medium text-sm">{toast.message}</span>
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
        {activeTab === 'dashboard' && dashboardView === 'inventory' ? (
          <CakeTargetManager
            isAdmin={effectiveIsAdmin}
            shops={shops}
            flavors={flavors}
            quantityOptions={QUANTITIES}
            onCreateShop={handleCreateShop}
            onCreateAssignment={handleAddShopInventory}
            onMarkReceived={handleMarkInventoryReceived}
            onMarkSale={handleMarkSale}
            onCreateKitchenSession={handleCreateKitchenSession}
            onAddSessionDraftItem={handleAddSessionDraftItem}
            onApproveSessionItem={handleApproveKitchenSessionItem}
            kitchenSessions={kitchenSessions}
            inventoryViewDate={inventoryViewDate}
            setInventoryViewDate={setInventoryViewDate}
            newShopName={newShopName}
            setNewShopName={setNewShopName}
            selectedShopId={selectedShopId}
            setSelectedShopId={setSelectedShopId}
            newAssignmentFlavor={newAssignmentFlavor}
            setNewAssignmentFlavor={setNewAssignmentFlavor}
            newAssignmentQuantity={newAssignmentQuantity}
            setNewAssignmentQuantity={setNewAssignmentQuantity}
            newAssignmentCustomQuantity={newAssignmentCustomQuantity}
            setNewAssignmentCustomQuantity={setNewAssignmentCustomQuantity}
            newAssignmentCount={newAssignmentCount}
            setNewAssignmentCount={setNewAssignmentCount}
            kitchenSessionName={kitchenSessionName}
            setKitchenSessionName={setKitchenSessionName}
            newSessionFlavor={newSessionFlavor}
            setNewSessionFlavor={setNewSessionFlavor}
            newSessionQuantity={newSessionQuantity}
            setNewSessionQuantity={setNewSessionQuantity}
            newSessionCustomQuantity={newSessionCustomQuantity}
            setNewSessionCustomQuantity={setNewSessionCustomQuantity}
            newSessionCount={newSessionCount}
            setNewSessionCount={setNewSessionCount}
            kitchenSessionDraftItems={kitchenSessionDraftItems}
            loggedInShopId={loggedInShopId}
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
            viewMode="dashboard"
            dashboardView={dashboardView}
            setDashboardView={setDashboardView}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            isAdmin={Boolean(userRole)}
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
            userRole={userRole}
            userLabel={effectiveUserLabel}
            dashboardView={dashboardView}
            setDashboardView={setDashboardView}
          />
        ) : null}

        {/* VIEW 3: MANAGE FLAVORS (ADMIN ONLY) */}
        {activeTab === 'super-admin' && effectiveIsAdmin && (
          <div className="mx-auto max-w-5xl grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="w-full bg-white rounded-3xl border border-rose-100 shadow-xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Create user</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full name</label>
                  <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">User ID</label>
                  <input type="text" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" placeholder="e.g. admin01 or shop_mgr_1" pattern="[A-Za-z0-9_-]+" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
                  <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone</label>
                  <input type="tel" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Role</label>
                  <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white">
                    <option value="super_admin">Super Admin</option>
                    <option value="kitchen_admin">Kitchen Admin</option>
                    <option value="shop_manager">Shop Manager</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white font-bold rounded-xl">Create user</button>
              </form>
            </div>

            <div className="w-full bg-white rounded-3xl border border-rose-100 shadow-xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Create shop</h3>
              <form onSubmit={handleCreateShop} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Shop name</label>
                  <input type="text" value={newShopName} onChange={(e) => setNewShopName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" placeholder="e.g. Main Branch" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Assign manager</label>
                  <select value={newShopManagerId} onChange={(e) => setNewShopManagerId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white" required>
                    <option value="">-- Select manager --</option>
                    {shopManagers.map((manager) => (
                      <option key={manager.id} value={manager.id}>{manager.full_name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-xl">Create shop & assign manager</button>
              </form>
            </div>

          </div>
        )}

        {activeTab === 'manage-flavors' && effectiveIsAdmin && (
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
        {activeTab === 'cake-count' && (effectiveIsAdmin || loggedInShopId || userRole === 'shop_manager') && (
          <CakeTargetManager
            isAdmin={effectiveIsAdmin}
            shops={shops}
            flavors={flavors}
            quantityOptions={QUANTITIES}
            onCreateShop={handleCreateShop}
            onCreateAssignment={handleAddShopInventory}
            onMarkReceived={handleMarkInventoryReceived}
            onMarkSale={handleMarkSale}
            onCreateKitchenSession={handleCreateKitchenSession}
            onAddSessionDraftItem={handleAddSessionDraftItem}
            onApproveSessionItem={handleApproveKitchenSessionItem}
            kitchenSessions={kitchenSessions}
            inventoryViewDate={inventoryViewDate}
            setInventoryViewDate={setInventoryViewDate}
            newShopName={newShopName}
            setNewShopName={setNewShopName}
            selectedShopId={selectedShopId}
            setSelectedShopId={setSelectedShopId}
            newAssignmentFlavor={newAssignmentFlavor}
            setNewAssignmentFlavor={setNewAssignmentFlavor}
            newAssignmentQuantity={newAssignmentQuantity}
            setNewAssignmentQuantity={setNewAssignmentQuantity}
            newAssignmentCustomQuantity={newAssignmentCustomQuantity}
            setNewAssignmentCustomQuantity={setNewAssignmentCustomQuantity}
            newAssignmentCount={newAssignmentCount}
            setNewAssignmentCount={setNewAssignmentCount}
            kitchenSessionName={kitchenSessionName}
            setKitchenSessionName={setKitchenSessionName}
            newSessionFlavor={newSessionFlavor}
            setNewSessionFlavor={setNewSessionFlavor}
            newSessionQuantity={newSessionQuantity}
            setNewSessionQuantity={setNewSessionQuantity}
            newSessionCustomQuantity={newSessionCustomQuantity}
            setNewSessionCustomQuantity={setNewSessionCustomQuantity}
            newSessionCount={newSessionCount}
            setNewSessionCount={setNewSessionCount}
            kitchenSessionDraftItems={kitchenSessionDraftItems}
            loggedInShopId={loggedInShopId}
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
            viewMode="management"
          />
        )}

        {activeTab === 'cake-count' && !effectiveIsAdmin && !loggedInShopId && userRole !== 'shop_manager' && (
          <AdminAuthCard
            passcodeInput={passcodeInput}
            setPasscodeInput={setPasscodeInput}
            passcodeError={passcodeError}
            onSubmit={handleAdminVerify}
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