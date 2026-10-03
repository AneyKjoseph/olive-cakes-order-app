import React, { useState } from 'react';
import { Layers, PlusCircle, Printer, Tag, PackageCheck, ShieldCheck, Calendar, AlertTriangle } from 'lucide-react';

export function CakeTargetManager({
  isAdmin,
  shops,
  flavors = [],
  quantityOptions = [],
  onCreateAssignment,
  onMarkReceived,
  onMarkSale,
  onCreateKitchenSession,
  onAddSessionDraftItem,
  onApproveSessionItem,
  kitchenSessions = [],
  inventoryViewDate,
  setInventoryViewDate,
  selectedShopId,
  setSelectedShopId,
  newAssignmentFlavor,
  setNewAssignmentFlavor,
  newAssignmentQuantity,
  setNewAssignmentQuantity,
  newAssignmentCustomQuantity,
  setNewAssignmentCustomQuantity,
  newAssignmentCount,
  setNewAssignmentCount,
  kitchenSessionName,
  setKitchenSessionName,
  newSessionFlavor,
  setNewSessionFlavor,
  newSessionQuantity,
  setNewSessionQuantity,
  newSessionCustomQuantity,
  setNewSessionCustomQuantity,
  newSessionCount,
  setNewSessionCount,
  kitchenSessionDraftItems = [],
  loggedInShopId,
  onPrint,
  viewMode = 'dashboard'
}) {
  const [saleChannels, setSaleChannels] = useState({});
  const visibleShops = isAdmin ? shops : shops.filter((shop) => shop.id === loggedInShopId);
  const currentShop = visibleShops[0] || null;
  const targetShopId = Number(loggedInShopId || currentShop?.id || 0);

  const selectedDayKey = inventoryViewDate || new Date().toLocaleDateString('en-CA');
  const selectedDayAssigned = visibleShops.reduce(
    (sum, shop) => sum + shop.inventory.reduce((shopTotal, item) => {
      const itemDate = item.received_at ? new Date(item.received_at).toISOString().slice(0, 10) : item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : null;
      return shopTotal + (itemDate && itemDate === selectedDayKey ? Number(item.count || 0) : 0);
    }, 0),
    0
  );

  const totalAssigned = visibleShops.reduce(
    (sum, shop) => sum + shop.inventory.reduce((shopTotal, item) => shopTotal + Number(item.count || 0), 0),
    0
  );

  const totalSold = visibleShops.reduce(
    (sum, shop) => sum + shop.inventory.reduce((shopTotal, item) => shopTotal + Number(item.sold || 0), 0),
    0
  );

  const channelSalesSummary = visibleShops.reduce((summary, shop) => {
    shop.inventory.forEach((item) => {
      const sales = Array.isArray(item.sales) ? item.sales : [];
      sales.forEach((sale) => {
        const channel = String(sale.channel || 'direct').toLowerCase();
        if (channel === 'direct' || channel === 'swiggy' || channel === 'zomato') {
          summary[channel] += Number(sale.quantity || 1);
        }
      });
    });
    return summary;
  }, { direct: 0, swiggy: 0, zomato: 0 });

  const shopChannelSummary = visibleShops.map((shop) => ({
    shopId: shop.id,
    shopName: shop.name,
    direct: shop.inventory.reduce((sum, item) => sum + (Array.isArray(item.sales) ? item.sales.filter((sale) => String(sale.channel || 'direct').toLowerCase() === 'direct').reduce((inner, sale) => inner + Number(sale.quantity || 1), 0) : 0), 0),
    swiggy: shop.inventory.reduce((sum, item) => sum + (Array.isArray(item.sales) ? item.sales.filter((sale) => String(sale.channel || 'direct').toLowerCase() === 'swiggy').reduce((inner, sale) => inner + Number(sale.quantity || 1), 0) : 0), 0),
    zomato: shop.inventory.reduce((sum, item) => sum + (Array.isArray(item.sales) ? item.sales.filter((sale) => String(sale.channel || 'direct').toLowerCase() === 'zomato').reduce((inner, sale) => inner + Number(sale.quantity || 1), 0) : 0), 0),
    total: shop.inventory.reduce((sum, item) => sum + Number(item.sold || 0), 0)
  }));

  const activeShopSessionItems = kitchenSessions.filter((session) => {
    const sessionShopId = Number(session.shopId ?? session.items?.[0]?.shopId ?? 0);
    const targetShopId = Number(loggedInShopId || currentShop?.id || 0);
    return sessionShopId === targetShopId && session.items?.some((item) => Number(item.shopId ?? session.shopId ?? 0) === targetShopId);
  }).flatMap((session) => session.items.filter((item) => Number(item.shopId ?? session.shopId ?? 0) === Number(loggedInShopId || currentShop?.id || 0)));

  const activeSessionGroups = !isAdmin ? kitchenSessions
    .filter((session) => session.items?.some((item) => Number(item.shopId ?? session.shopId ?? 0) === targetShopId && !item.approved))
    .map((session) => ({
      id: session.id,
      name: session.name || 'Session batch',
      date: session.date || session.session_date || inventoryViewDate,
      items: (session.items || []).filter((item) => Number(item.shopId ?? session.shopId ?? 0) === targetShopId && !item.approved)
    }))
    : [];

  const flavorSizeSummary = Object.values(
    visibleShops.reduce((summaryMap, shop) => {
      shop.inventory.forEach((item) => {
        if (!['verified', 'sold_out'].includes(item.status || 'pending')) return;

        const flavorName = item.flavor || 'Unknown';
        const match = summaryMap[flavorName] || { name: flavorName, medium: 0, large: 0, custom: 0, total: 0 };
        const sizeKey = item.quantity === 'medium' ? 'medium' : item.quantity === 'large' ? 'large' : 'custom';

        match[sizeKey] += Number(item.count || 0);
        match.total += Number(item.count || 0);
        summaryMap[flavorName] = match;
      });
      return summaryMap;
    }, {})
  ).sort((a, b) => b.total - a.total);

  const activeStockByShop = isAdmin ? visibleShops.map((shop) => {
    const groupedItems = shop.inventory
      .filter((item) => (item.status === 'verified' || item.status === 'sold_out') && Number(item.count || 0) > 0)
      .reduce((map, item) => {
        const flavorName = item.flavor || 'Unknown';
        const sizeKey = String(item.quantity || 'medium').toLowerCase();

        if (!map[flavorName]) {
          map[flavorName] = {
            id: `${shop.id}-${flavorName}`,
            flavor: flavorName,
            counts: { medium: 0, large: 0, custom: 0 },
            assigned: 0,
            sold: 0,
            balance: 0
          };
        }

        const assigned = Number(item.count || 0);
        const sold = Number(item.sold || 0);
        const balance = Math.max(assigned - sold, 0);

        map[flavorName].counts[sizeKey] = (map[flavorName].counts[sizeKey] || 0) + assigned;
        map[flavorName].assigned += assigned;
        map[flavorName].sold += sold;
        map[flavorName].balance += balance;

        return map;
      }, {});

    return {
      shopId: shop.id,
      shopName: shop.name,
      items: Object.values(groupedItems)
        .map((entry) => ({
          id: entry.id,
          flavor: entry.flavor,
          assigned: entry.assigned,
          sold: entry.sold,
          balance: entry.balance,
          quantityBreakdown: Object.entries(entry.counts)
            .filter(([, count]) => count > 0)
            .map(([size, count]) => ({
              size: size.charAt(0).toUpperCase() + size.slice(1),
              count,
              isLowStock: entry.balance <= 2
            }))
          
        }))
        .sort((a, b) => {
          if (a.isLowStock !== b.isLowStock) return Number(b.isLowStock) - Number(a.isLowStock);
          return b.balance - a.balance;
        })
    };
  }) : [];

  const lowStockAlerts = activeStockByShop.flatMap((shop) =>
    shop.items
      .filter((item) => item.quantityBreakdown.some((entry) => entry.isLowStock))
      .map((item) => ({ ...item, shopName: shop.shopName }))
  );

  console.log(lowStockAlerts);
  const isDashboardView = viewMode === 'dashboard';
  const isManagementView = viewMode === 'management';

  return (
    <div className="space-y-8 animate-fadeIn">
      {isDashboardView && (
        <>
          <div className="bg-white/80 backdrop-blur rounded-3xl border border-rose-100 p-6 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-6 h-6 text-pink-500" />
                  Inventory Dashboard
                </h2>
                <p className="text-xs text-slate-400 mt-1">Operational overview for assigned stock, sales, and remaining active inventory.</p>
              </div>
              

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="bg-pink-50/60 border border-pink-100 px-3 sm:px-4 py-2.5 rounded-2xl shadow-sm">
                  <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date filter
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="date"
                      value={inventoryViewDate}
                      onChange={(e) => setInventoryViewDate(e.target.value)}
                      className="w-full sm:w-auto px-3 py-1 bg-white border border-rose-200 text-slate-700 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                    {inventoryViewDate !== new Date().toLocaleDateString('en-CA') && (
                      <button
                        type="button"
                        onClick={() => setInventoryViewDate(new Date().toLocaleDateString('en-CA'))}
                        className="bg-pink-100 hover:bg-pink-200 text-pink-700 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Today
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2 min-w-[120px]">
                    <p className="text-[10px] uppercase tracking-wider text-rose-600 font-bold">Selected day</p>
                    <p className="mt-1 text-sm font-black text-slate-800">{selectedDayAssigned}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2 min-w-[120px]">
                    <p className="text-[10px] uppercase tracking-wider text-amber-600 font-bold">Low stock</p>
                    <p className="mt-1 text-sm font-black text-slate-800">{lowStockAlerts.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl border border-rose-100 shadow-lg p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">{isAdmin ? 'Total shops' : 'Current shop'}</p>
              <h3 className="mt-2 text-3xl font-black text-slate-800">{isAdmin ? visibleShops.length : currentShop?.name || '—'}</h3>
            </div>
            <div className="bg-white rounded-3xl border border-rose-100 shadow-lg p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Assigned stock ({selectedDayKey})</p>
              <h3 className="mt-2 text-3xl font-black text-slate-800">{selectedDayAssigned}</h3>
            </div>
            <div className="bg-white rounded-3xl border border-rose-100 shadow-lg p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">All time stock</p>
              <h3 className="mt-2 text-3xl font-black text-slate-800">{totalAssigned}</h3>
            </div>
            <div className="bg-white rounded-3xl border border-rose-100 shadow-lg p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Sold units</p>
              <h3 className="mt-2 text-3xl font-black text-slate-800">{totalSold}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-bold text-slate-800 text-lg">Sales by channel</h3>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">All shops</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-rose-600 font-bold">Direct</p>
                <h4 className="mt-2 text-2xl font-black text-slate-800">{channelSalesSummary.direct}</h4>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">Swiggy</p>
                <h4 className="mt-2 text-2xl font-black text-slate-800">{channelSalesSummary.swiggy}</h4>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-sky-600 font-bold">Zomato</p>
                <h4 className="mt-2 text-2xl font-black text-slate-800">{channelSalesSummary.zomato}</h4>
              </div>
            </div>
          </div>

          {lowStockAlerts.length > 0 && (
            <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Restock soon
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Watchlist</span>
              </div>

              <div className="space-y-3">
                {lowStockAlerts.map((item) => ( item.quantityBreakdown.map((entry) => ( entry.isLowStock && (
                  <div key={`${item.shopName}-${item.id}`} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-slate-800 text-sm">{item.shopName}</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full">Low stock</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                      <span className="bg-white text-slate-700 px-2 py-1 rounded-lg border border-amber-100">{item.flavor}</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100">{entry.size}</span>
                      <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-lg border border-rose-100">Available: {entry.count}</span>
                    </div>
                  </div>)))
                ))}
              </div>
            </div>
          )}

          {shopChannelSummary.length > 0 && (
            <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-bold text-slate-800 text-lg">Shop-wise sales</h3>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">By channel</span>
              </div>

              <div className="space-y-3">
                {shopChannelSummary.map((shop) => (
                  <div key={shop.shopId} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="font-bold text-slate-800 text-sm">{shop.shopName}</span>
                      <span className="bg-pink-100 text-pink-700 text-[10px] font-extrabold px-2 py-1 rounded-full">{shop.total} sold</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-rose-100">Direct: {shop.direct}</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100">Swiggy: {shop.swiggy}</span>
                      <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-sky-100">Zomato: {shop.zomato}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAdmin && activeStockByShop.length > 0 && (
            <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-pink-500" />
                  Active stock by shop & flavor
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Remaining stock</span>
              </div>

              <div className="space-y-4">
                {activeStockByShop.map((shopSummary) => (
                  <div key={shopSummary.shopId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <p className="font-bold text-slate-800 text-sm">{shopSummary.shopName}</p>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{shopSummary.items.length} flavor rows</span>
                    </div>

                    {shopSummary.items.length === 0 ? (
                      <p className="text-sm text-slate-400">No active stock available for this shop.</p>
                    ) : (
                      <div className="space-y-2">
                        {shopSummary.items.map((item) => (
                          <div key={`${shopSummary.shopId}-${item.id}`} className={`rounded-xl border p-3 ${item.isLowStock ? 'border-amber-200 bg-amber-50/60' : 'border-rose-100 bg-white'}`}>
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="font-bold text-slate-800 text-sm">{item.flavor}</span>
                              <div className="flex items-center gap-2">
                                {item.isLowStock && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full">Restock soon</span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-[10px] mb-2">
                              {item.quantityBreakdown.map((entry) => (
                                <span key={`${item.flavor}-${entry.size}`} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100">
                                  {entry.size}: {entry.count}
                                </span>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-2 text-[10px]">
                              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200">Assigned: {item.assigned}</span>
                              <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100">Sold: {item.sold}</span>
                              <span className={`px-2 py-1 rounded-lg border ${item.isLowStock ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                Available: {item.balance}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {isManagementView && (
        <>
          {isAdmin && (
            <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-6">
              <div className="border-b border-rose-100 pb-3 mb-5">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-pink-500" />
                  Assign inventory
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Create a batch session, add multiple flavors, then validate the items at the shop level.</p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select shop</label>
                    <select
                      value={selectedShopId}
                      onChange={(e) => setSelectedShopId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 bg-white"
                    >
                      <option value="">-- Choose shop --</option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Session date</label>
                    <input
                      type="date"
                      value={inventoryViewDate}
                      onChange={(e) => setInventoryViewDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Session name</label>
                  <input
                    type="text"
                    value={kitchenSessionName}
                    onChange={(e) => setKitchenSessionName(e.target.value)}
                    placeholder="e.g. Morning batch / Main Branch"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1.2fr_0.8fr_52px] gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flavor</label>
                    <select
                      value={newSessionFlavor}
                      onChange={(e) => setNewSessionFlavor(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 bg-white"
                    >
                      <option value="">-- Choose flavor --</option>
                      {flavors.map((flavor) => (
                        <option key={flavor.id} value={flavor.id}>{flavor.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Qty</label>
                    <div className={newSessionQuantity === 'custom' ? 'grid grid-cols-1 sm:grid-cols-[1fr_1.1fr] gap-3' : ''}>
                      <select
                        value={newSessionQuantity}
                        onChange={(e) => setNewSessionQuantity(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 bg-white"
                      >
                        {quantityOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>

                      {newSessionQuantity === 'custom' && (
                        <input
                          type="text"
                          placeholder="e.g. 7 kg"
                          value={newSessionCustomQuantity}
                          onChange={(e) => setNewSessionCustomQuantity(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">No.</label>
                    <input
                      type="number"
                      min="1"
                      value={newSessionCount}
                      onChange={(e) => setNewSessionCount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onAddSessionDraftItem}
                    className="h-[46px] w-[52px] flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-all"
                    title="Add flavor"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex justify-center">
                  <button type="button" onClick={onCreateKitchenSession} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold shadow-sm min-w-[140px]">Save</button>
                </div>

                {kitchenSessionDraftItems.length > 0 && (
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-3">Added Cakes</p>
                    <div className="space-y-2">
                      {kitchenSessionDraftItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center rounded-xl bg-white border border-indigo-100 px-3 py-2 text-sm">
                          <span className="font-semibold text-slate-700">{item.flavorId}</span>
                          <span className="text-slate-500">{item.quantity} × {item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isAdmin && currentShop && (
            <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-pink-500" />
                    Assigned shop access
                  </h3>
                  <p className="text-sm text-slate-500">Viewing inventory for {currentShop.name}</p>
                </div>
              </div>
            </div>
          )}

          {activeSessionGroups.length > 0 && !isAdmin ? (
            <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6">
              <div className="border-b border-rose-100 pb-3 mb-5">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-pink-500" />
                  Active session validation
                </h3>
              </div>

              <div className="space-y-4">
                {activeSessionGroups.map((session) => (
                  <div key={session.id} className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="font-bold text-slate-800">{session.name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{session.date}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => session.items.forEach((item) => onApproveSessionItem(session.id, item.id))}
                        className="text-[11px] font-bold px-3 py-2 rounded-lg bg-emerald-500 text-white"
                      >
                        Validate session
                      </button>
                    </div>

                    <div className="space-y-2">
                      {session.items.map((item) => (
                        <div key={`${session.id}-${item.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-white border border-rose-100 px-3 py-2 text-sm">
                          <div>
                            <p className="font-semibold text-slate-800">{item.flavorName || item.flavorId}</p>
                            <p className="text-slate-500">{item.quantity} × {item.count}</p>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-amber-700 bg-amber-100 rounded-full px-2 py-1 font-bold">Pending</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6">
            <div className="border-b border-rose-100 pb-3 mb-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-pink-500" />
                  {isAdmin ? 'All shops inventory overview' : `${currentShop?.name || 'Shop'} inventory`}
                </h3>
              </div>
              <button
                onClick={() => onPrint('inventory-summary-table')}
                className="no-print bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 text-xs self-end sm:self-auto"
              >
                <Printer className="w-4 h-4" />
                Print overview
              </button>
            </div>

            {flavorSizeSummary.length > 0 && (
              <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-sm font-bold text-slate-800">Flavor-wise size summary</p>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total assigned stock</span>
                </div>
                <div className="space-y-3">
                  {flavorSizeSummary.map((item) => (
                    <div key={item.name} className="rounded-xl border border-rose-100 bg-white p-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                        <span className="bg-pink-100 text-pink-700 text-[10px] font-extrabold px-2 py-1 rounded-full">{item.total} total</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.medium > 0 && (
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-indigo-100">
                            Medium: {item.medium}
                          </span>
                        )}
                        {item.large > 0 && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100">
                            Large: {item.large}
                          </span>
                        )}
                        {item.custom > 0 && (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-amber-100">
                            Custom: {item.custom}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              {visibleShops.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">No inventory is available for this account.</div>
              )}

              {visibleShops.map((shop) => (
                <div key={shop.id} className="rounded-2xl border border-rose-100 bg-slate-50 p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                    <div>
                      <p className="text-lg font-bold text-slate-800">{shop.name} Sales Tracker</p>
                    </div>
                    <div className="text-xs bg-white border border-rose-100 rounded-full px-3 py-1 text-slate-600">
                      {shop.inventory.length} item(s)
                    </div>
                  </div>

                  {shop.inventory.length === 0 ? (
                    <p className="text-sm text-slate-400">No assigned cakes yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm" id={isAdmin ? `inventory-summary-table-${shop.id}` : 'inventory-summary-table'}>
                        <thead>
                          <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                            <th className="py-2 pr-4">Flavor</th>
                            <th className="py-2 pr-4">Qty</th>
                            <th className="py-2 pr-4">Assigned</th>
                            <th className="py-2 pr-4">Sold</th>
                            <th className="py-2 pr-4">Balance</th>
                            <th className="py-2 pr-4">Status</th>
                            {!isAdmin && <th className="py-2 pr-4">Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {shop.inventory.map((item) => {
                            const assigned = Number(item.count || 0);
                            const sold = Number(item.sold || 0);
                            const balance = Math.max(assigned - sold, 0);
                            const soldOut = balance <= 0;

                            return (
                              <tr key={item.id} className="border-t border-slate-200">
                                <td className="py-2 pr-4 font-semibold text-slate-800">{item.flavor}</td>
                                <td className="py-2 pr-4">{item.quantity}</td>
                                <td className="py-2 pr-4">{assigned}</td>
                                <td className="py-2 pr-4">{sold}</td>
                                <td className="py-2 pr-4 font-bold text-slate-700">{balance}</td>
                                <td className="py-2 pr-4">
                                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : item.status === 'sold_out' || soldOut ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {item.status === 'sold_out' || soldOut ? 'sold_out' : item.status || 'pending'}
                                  </span>
                                </td>
                                {!isAdmin && (
                                  <td className="py-2 pr-4">
                                    <div className="flex flex-col gap-2">
                                      <div className="flex flex-col gap-2">
                                        <select
                                          value={saleChannels[item.id] ?? 'direct'}
                                          onChange={(e) => setSaleChannels((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                          className="px-2 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white text-slate-700"
                                          disabled={soldOut || item.status !== 'verified'}
                                        >
                                          <option value="direct">Direct</option>
                                          <option value="swiggy">Swiggy</option>
                                          <option value="zomato">Zomato</option>
                                        </select>
                                        <button
                                          type="button"
                                          onClick={() => onMarkSale(shop.id, item.id, saleChannels[item.id] ?? 'direct')}
                                          disabled={soldOut || item.status !== 'verified'}
                                          className="px-2.5 py-1.5 text-[11px] rounded-lg bg-pink-500 text-white disabled:opacity-40"
                                        >
                                          Mark as Sold
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
