import { useEffect, useState } from 'react';
import {
  WalletCards, Check, Gift, ArrowRight, Loader2, Sparkles,
  CreditCard, QrCode, Ticket, Zap, ShieldCheck, Star,
} from 'lucide-react';
import { supabase, type DonationPackage, type Donation } from '../lib/supabase';

type PaymentMethod = 'qris' | 'dana' | 'gopay' | 'ovo' | 'voucher' | 'bank';

const paymentMethods: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: 'qris', label: 'QRIS', icon: QrCode, desc: 'Scan & pay instantly' },
  { id: 'dana', label: 'DANA', icon: WalletCards, desc: 'E-wallet transfer' },
  { id: 'gopay', label: 'GoPay', icon: WalletCards, desc: 'Gojek e-wallet' },
  { id: 'ovo', label: 'OVO', icon: WalletCards, desc: 'OVO e-wallet' },
  { id: 'voucher', label: 'Voucher', icon: Ticket, desc: 'Redeem a code' },
  { id: 'bank', label: 'Bank Transfer', icon: CreditCard, desc: 'Manual transfer' },
];

export default function TopUpPage() {
  const [packages, setPackages] = useState<DonationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<DonationPackage | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('qris');
  const [voucherCode, setVoucherCode] = useState('');
  const [characterName, setCharacterName] = useState('Saki_Valentine');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [notice, setNotice] = useState('');

  const showNotice = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 3000); };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: pkgData }, { data: donData }] = await Promise.all([
        supabase.from('donation_packages').select('*').order('display_order'),
        supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      if (pkgData) setPackages(pkgData as DonationPackage[]);
      if (donData) setRecentDonations(donData as Donation[]);
      setLoading(false);
    })();
  }, []);

  const formatRupiah = (amount: number) => {
    return 'Rp ' + amount.toLocaleString('id-ID');
  };

  const processDonation = async () => {
    if (!selectedPkg) { showNotice('Please select a package first.'); return; }
    if (!characterName.trim()) { showNotice('Character name is required.'); return; }
    if (method === 'voucher' && !voucherCode.trim()) { showNotice('Please enter your voucher code.'); return; }

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { error } = await supabase.from('donations').insert({
      character_name: characterName.trim(),
      amount: selectedPkg.amount,
      credits: selectedPkg.credits,
      payment_method: method,
      voucher_code: method === 'voucher' ? voucherCode.trim() : null,
      status: 'completed',
    });

    setProcessing(false);

    if (error) { showNotice('Transaction failed. Please try again.'); return; }

    setSuccess(true);
    showNotice(`${selectedPkg.credits} credits added to ${characterName.replace('_', ' ')}!`);
    window.setTimeout(() => setSuccess(false), 4000);

    // Refresh recent donations
    const { data: donData } = await supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(5);
    if (donData) setRecentDonations(donData as Donation[]);

    if (method === 'voucher') setVoucherCode('');
  };

  if (loading) return <div className="page-status">Loading top-up packages…</div>;

  return (
    <div className="page-enter">
      {notice && <div className="toast"><Sparkles size={16} />{notice}</div>}

      <div className="page-header-row">
        <div>
          <p className="eyebrow"><span className="pulse-dot" /> TRIBE CREDITS</p>
          <h1>Top Up & Donate</h1>
          <p className="page-sub">Support the server and get credits to spend in-game.</p>
        </div>
        <div className="topup-balance">
          <WalletCards size={20} />
          <div><small>Current Balance</small><strong>12,450 credits</strong></div>
        </div>
      </div>

      <div className="topup-layout">
        <div className="topup-main">
          {/* Step 1: Select package */}
          <div className="topup-step">
            <div className="step-header"><span className="step-num">1</span><h2>Choose a Package</h2></div>
            <div className="package-grid">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  className={`package-card ${selectedPkg?.id === pkg.id ? 'selected' : ''} ${pkg.is_popular ? 'popular' : ''}`}
                  onClick={() => setSelectedPkg(pkg)}
                >
                  {pkg.is_popular && <span className="popular-badge"><Star size={11} /> POPULAR</span>}
                  <h3>{pkg.label}</h3>
                  <div className="package-credits">{pkg.credits.toLocaleString()} <small>credits</small></div>
                  <div className="package-price">{formatRupiah(pkg.amount)}</div>
                  {selectedPkg?.id === pkg.id && <div className="package-check"><Check size={16} /></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Payment method */}
          <div className="topup-step">
            <div className="step-header"><span className="step-num">2</span><h2>Payment Method</h2></div>
            <div className="payment-grid">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  className={`payment-card ${method === pm.id ? 'selected' : ''}`}
                  onClick={() => setMethod(pm.id)}
                >
                  <pm.icon size={20} />
                  <div><strong>{pm.label}</strong><span>{pm.desc}</span></div>
                  {method === pm.id && <Check size={16} className="pm-check" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Character & voucher */}
          <div className="topup-step">
            <div className="step-header"><span className="step-num">3</span><h2>Confirm Details</h2></div>
            <div className="confirm-section">
              <div className="profile-form-group">
                <label>Character Name</label>
                <input className="profile-input" value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Firstname_Lastname" />
              </div>
              {method === 'voucher' && (
                <div className="profile-form-group">
                  <label>Voucher Code</label>
                  <input className="profile-input" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder="Enter your voucher code" />
                </div>
              )}
            </div>
          </div>

          {/* Summary & pay */}
          <div className="topup-summary">
            <div className="summary-row">
              <span>Package</span><strong>{selectedPkg ? selectedPkg.label : '—'}</strong>
            </div>
            <div className="summary-row">
              <span>Credits</span><strong>{selectedPkg ? selectedPkg.credits.toLocaleString() : '—'}</strong>
            </div>
            <div className="summary-row">
              <span>Payment</span><strong>{paymentMethods.find((pm) => pm.id === method)?.label ?? '—'}</strong>
            </div>
            <div className="summary-row total">
              <span>Total</span><strong>{selectedPkg ? formatRupiah(selectedPkg.amount) : '—'}</strong>
            </div>
            <button className="primary-button pay-button" onClick={processDonation} disabled={processing || !selectedPkg}>
              {processing ? <Loader2 size={18} className="spin" /> : <Zap size={18} />}
              {processing ? 'Processing…' : `Pay ${selectedPkg ? formatRupiah(selectedPkg.amount) : ''}`}
              {!processing && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="topup-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-card-head"><ShieldCheck size={18} /><h3>Secure Payments</h3></div>
            <p>All transactions are encrypted and processed securely. Credits are delivered instantly after payment confirmation.</p>
          </div>
          <div className="sidebar-card">
            <div className="sidebar-card-head"><Gift size={18} /><h3>Voucher Rewards</h3></div>
            <p>Got a voucher code? Select the Voucher payment method and enter your code to redeem credits instantly.</p>
          </div>
          <div className="sidebar-card recent-donations-card">
            <div className="sidebar-card-head"><Sparkles size={18} /><h3>Recent Top-ups</h3></div>
            {recentDonations.length === 0 ? <p className="no-recent">No recent transactions.</p> : (
              <div className="recent-list">
                {recentDonations.map((don) => (
                  <div key={don.id} className="recent-item">
                    <div className="recent-avatar">{don.character_name.slice(0, 2).toUpperCase()}</div>
                    <div><strong>{don.character_name.replace('_', ' ')}</strong><span>{don.credits.toLocaleString()} credits</span></div>
                    <span className="recent-status">{don.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success overlay */}
      {success && (
        <div className="success-overlay" onClick={() => setSuccess(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon"><Check size={48} /></div>
            <h2>Payment Successful!</h2>
            <p>{selectedPkg?.credits.toLocaleString()} credits have been added to <strong>{characterName.replace('_', ' ')}</strong>.</p>
            <button className="primary-button" onClick={() => setSuccess(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
