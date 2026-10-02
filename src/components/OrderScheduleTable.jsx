import { Clock, PencilLine, Phone, Trash2, User2Icon } from 'lucide-react';

export function OrderScheduleTable({
  orders,
  flavors,
  quantities,
  onOpenImage,
  onEditOrder,
  onDeleteOrder,
  tableId = 'printable-kitchen-table'
}) {
  if (!orders.length) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        No cake orders scheduled for this date.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse" id={tableId}>
        <thead>
          <tr className="bg-slate-50/30 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <th className="py-2 px-4">Due Time</th>
            <th className="py-4 px-6">Cake details</th>
            <th className="py-4 px-6">Writing</th>
            <th className="py-4 px-6">Customer Name</th>
            <th className="py-4 px-6">Contact Phone</th>
            <th className="py-4 px-6 text-right">Amount (Total/ Paid / Due)</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order, i) => {
            const flavorName = flavors.find((f) => f.id === order.flavor)?.name || order.flavor;
            const qtyLabel = quantities.find((q) => q.id === order.quantity)?.name.split(' (')[0] || order.quantity;

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
                          {order.design_details || 'No specifications provided'}
                        </div>

                        {order.image_data && (
                          <button
                            type="button"
                            onClick={() => onOpenImage(order.image_data)}
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
                  <div className="text-slate-600 hover:text-pink-600 font-medium inline-flex items-center gap-1 text-xs">
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
                    <div>Total: ₹{Number(order.total_amount).toFixed(2)}</div>
                    <div className="text-emerald-600 font-semibold">Adv: ₹{Number(order.advance_amount).toFixed(2)}</div>
                    <div className="text-slate-400">Due: ₹{Number(order.balance_amount).toFixed(2)}</div>
                  </div>
                </td>

                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditOrder(order)}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      <PencilLine className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteOrder(order.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
