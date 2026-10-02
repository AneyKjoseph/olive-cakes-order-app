import { Layers, PlusCircle, Tag } from 'lucide-react';

export function FlavorManager({
  flavors,
  newFlavorName,
  setNewFlavorName,
  newFlavorPriceMedium,
  setNewFlavorPriceMedium,
  newFlavorPriceLarge,
  setNewFlavorPriceLarge,
  handleFlavorNameChange,
  handleAddFlavor,
  isSavingFlavor
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
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
                ₹ Medium Price
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
                ₹ Large Price
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
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{flv.name}</td>
                  <td className="py-3.5 px-4">
                    <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">{flv.id}</code>
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
  );
}
