import { AlertCircle, KeyRound, Lock, Unlock } from 'lucide-react';

export function AdminAuthCard({
  passcodeInput,
  setPasscodeInput,
  passcodeError,
  onSubmit
}) {
  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-3xl shadow-xl border border-rose-100 p-8 text-center">
      <div className="w-16 h-16 bg-rose-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
        <Lock className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800">Admin Authentication Required</h3>
      <p className="text-sm text-slate-400 mt-2 mb-6">
        Only authorized Users can view live Dashboard.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
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
  );
}
