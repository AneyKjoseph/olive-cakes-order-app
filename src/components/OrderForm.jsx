import {
  Cake,
  Calendar,
  Clock,
  FileText,
  IndianRupee,
  Phone,
  Sparkles,
  Upload,
  X
} from 'lucide-react';

export function OrderForm({
  orderType,
  setOrderType,
  dateTime,
  setDateTime,
  customerName,
  setCustomerName,
  contactNo,
  setContactNo,
  flavor,
  setFlavor,
  flavors,
  quantity,
  setQuantity,
  customQtyDetails,
  setCustomQtyDetails,
  designDetails,
  setDesignDetails,
  wishes,
  setWishes,
  totalAmount,
  setTotalAmount,
  advanceAmount,
  setAdvanceAmount,
  balanceAmount,
  referenceImage,
  setReferenceImage,
  handlePhotoUpload,
  fileInputRef,
  isCompilingImage,
  handleSubmitOrder,
  isSubmitting,
  quantities,
  isEditingOrder,
  onCancelEdit
}) {
  return (
    <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-rose-100/60 p-6 sm:p-8">
      <div className="border-b border-rose-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Cake className="w-5 h-5 text-pink-500" />
          Place Your Cake Order
        </h2>
        <p className="text-xs text-slate-400 mt-1">Fields marked * are required.</p>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="Enter Customer Name"
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
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 outline-none"
            />
          </div>
        </div>

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
              {flavors.map((f) => (
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
              {quantities.map((q) => (
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
              />
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
                    {isCompilingImage ? 'Scaling & Compressing File...' : 'Attach Image'}
                  </button>
                </div>

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
              onChange={(e) => setTotalAmount(e.target.value)}
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

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-55"
          >
            <Cake className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : isEditingOrder ? 'Update Cake Order' : 'Submit Cake Order'}
          </button>

          {isEditingOrder && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="sm:w-auto px-5 py-4 border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
