import { Layers, PlusCircle, Printer, Tag } from 'lucide-react';

export function CakeTargetManager({
  targets,
  flavorNameForTarget,
  setFlavorNameForTarget,
  kgForTarget,
  setKgForTarget,
  countForTarget,
  setCountForTarget,
  typeForTarget,
  setTypeForTarget,
  targetTypes,
  remarks,
  setRemarks,
  handleTarget,
  isSavingTarget,
  onPrint
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kg</label>
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Count</label>
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Type</label>
              <select
                required
                value={typeForTarget}
                onChange={(e) => setTypeForTarget(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-500 focus:ring focus:ring-pink-500/20 bg-white"
              >
                <option value="" disabled hidden>-- Select an option --</option>
                {targetTypes.map((q) => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks</label>
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

      <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-rose-100 p-6">
        <div className="border-b border-rose-100 pb-3 mb-5 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-pink-500" />
              Targets For Session ({targets.length})
            </h3>
          </div>
          <button
            onClick={() => onPrint('target-table')}
            className="no-print bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 text-xs self-end sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            Print to PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="target-table">
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
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{flv.flavor}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{flv.type}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{flv.kg}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{flv.count}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{flv.remarks}</td>
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
  );
}
