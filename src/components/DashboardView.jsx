import { BarChart3, Calendar, Clock, LayoutDashboard, Printer } from 'lucide-react';
import { StatCard } from './StatCard';
import { OrderScheduleTable } from './OrderScheduleTable';
import { OverviewStrip } from '../features/dashboard/OverviewStrip';

export function DashboardView({
  isAdmin,
  filterDate,
  setFilterDate,
  handleResetToToday,
  analytics,
  dashboardSummary,
  flavors,
  onPrint,
  setLightboxImage,
  onEditOrder,
  onDeleteOrder,
  onAdminUnlock,
  passcodeInput,
  setPasscodeInput,
  passcodeError,
  handleAdminVerify,
  AdminAuthCard,
  quantities,
  userRole,
  userLabel,
  dashboardView,
  setDashboardView
}) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white/80 backdrop-blur rounded-3xl border border-rose-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-pink-500" />
              Dashboard
            </h2>
            <p className="text-xs text-slate-400">
              {userLabel ? `${userLabel} view` : 'Viewing schedule summary logs.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-end w-full sm:w-auto">
            <div className="inline-flex rounded-2xl border border-pink-100 bg-pink-50 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setDashboardView('orders')}
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-colors ${dashboardView === 'orders' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Order Dashboard
              </button>
              <button
                type="button"
                onClick={() => setDashboardView('inventory')}
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-colors ${dashboardView === 'inventory' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Inventory Dashboard
              </button>
            </div>
            <div className="bg-pink-50/50 border border-pink-100/80 px-3 sm:px-4 py-2.5 rounded-2xl flex flex-col gap-1.5 shadow-sm w-full sm:w-auto">
              <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Select Delivery Date
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1 bg-white border border-rose-200 text-slate-700 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                {filterDate !== new Date().toLocaleDateString('en-CA') && (
                  <button
                    type="button"
                    onClick={handleResetToToday}
                    className="bg-pink-100 hover:bg-pink-200 text-pink-700 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Today
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <StatCard label="Target Date Orders" value={analytics.selectedDateCount} tone="rose" />
              <StatCard label="All-Time Orders" value={analytics.totalAllTimeOrders} tone="amber" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <OverviewStrip summary={dashboardSummary} />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-rose-100/60 shadow-lg overflow-hidden">
        <div className="p-6 bg-slate-50/60 border-b border-rose-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-500" />
              Scheduled Cakes for {new Date(filterDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
          </div>
          <button
            onClick={() => onPrint('printable-kitchen-table')}
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
          <OrderScheduleTable
            orders={analytics.todayOrders}
            flavors={flavors}
            quantities={quantities}
            onOpenImage={setLightboxImage}
            onEditOrder={onEditOrder}
            onDeleteOrder={onDeleteOrder}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100/60 shadow-md">
          <div className="flex items-center gap-2 mb-6 border-b border-rose-50 pb-3">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-lg">
              Orders & Size Breakdown for {new Date(filterDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>

          {analytics.selectedDateCount === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No orders registered for {new Date(filterDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}.
            </div>
          ) : (
            <div className="space-y-4">
              {(analytics.selectedDateSummaryData || analytics.todaySummaryData).map((item) => (
                <div key={item.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                    <span className="bg-pink-100 text-pink-700 text-xs font-extrabold px-2 py-0.5 rounded-full">
                      {item.sizes.total} order(s)
                    </span>
                  </div>

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
  );
}
