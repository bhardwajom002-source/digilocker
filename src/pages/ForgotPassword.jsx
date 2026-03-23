import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = { EMAIL: 1, PIN: 2, NEW_PASSWORD: 3, SUCCESS: 4 };

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { verifyEmailForReset, resetPasswordWithPin } = useAuth();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Step 1: Verify email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email required');
    setError(''); setLoading(true);
    const result = await verifyEmailForReset(email);
    setLoading(false);
    if (result.success) {
      setMessage(result.message);
      setStep(STEPS.PIN);
    } else {
      setError(result.error);
    }
  };

  // Step 2+3: Reset with PIN + new password
  const handleReset = async (e) => {
    e.preventDefault();
    if (!pin || pin.length < 4) return setError('Enter your backup PIN');
    if (newPwd.length < 8) return setError('Password must be at least 8 characters');
    if (newPwd !== confirmPwd) return setError('Passwords do not match');
    setError(''); setLoading(true);
    const result = await resetPasswordWithPin(email, pin, newPwd);
    setLoading(false);
    if (result.success) {
      toast.success('Password reset successfully! 🎉');
      setStep(STEPS.SUCCESS);
      setTimeout(() => navigate('/', { replace: true }), 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="page-enter min-h-screen bg-white dark:bg-slate-900 flex flex-col safe-top safe-bottom">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button onClick={() => navigate('/login')}
                style={{ width:38,height:38,background:'#F8FAFC',border:'1px solid #E2E8F0',
                         borderRadius:12,display:'flex',alignItems:'center',
                         justifyContent:'center',cursor:'pointer' }}
                className="dark:bg-slate-800 dark:border-slate-600">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div>
          <h2 style={{ fontSize:18,fontWeight:800,color:'#0F172A',
                       fontFamily:"'Plus Jakarta Sans',sans-serif" }}
              className="dark:text-white">
            Reset Password
          </h2>
          <p style={{ fontSize:11,color:'#94A3B8',marginTop:1 }}>
            {step === STEPS.EMAIL && 'Enter your registered email'}
            {step === STEPS.PIN && 'Verify with your backup PIN'}
            {step === STEPS.SUCCESS && 'Password reset successful!'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display:'flex',justifyContent:'center',gap:8,marginBottom:20 }}>
        {[1,2,3].map(s => (
          <div key={s} style={{
            width: step >= s ? 20 : 6, height:6, borderRadius:3,
            background: step >= s ? '#2563EB' : '#E2E8F0',
            transition:'all 0.3s',
          }} />
        ))}
      </div>

      <div className="flex-1 px-5 pb-8">

        {/* SUCCESS */}
        {step === STEPS.SUCCESS && (
          <div style={{ textAlign:'center',paddingTop:40 }}>
            <div style={{ fontSize:64,marginBottom:16 }}>✅</div>
            <h3 style={{ fontSize:22,fontWeight:800,color:'#0F172A',
                         fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              Password Reset!
            </h3>
            <p style={{ fontSize:14,color:'#64748B',marginTop:8 }}>
              Redirecting to your vault...
            </p>
          </div>
        )}

        {/* STEP 1 — Email */}
        {step === STEPS.EMAIL && (
          <form onSubmit={handleEmailSubmit}
                style={{ display:'flex',flexDirection:'column',gap:16 }}>

            <div style={{ padding:'14px',background:'#EFF6FF',borderRadius:14,
                          border:'1px solid #DBEAFE',fontSize:13,color:'#1D4ED8' }}
                 className="dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
              💡 Enter your registered email. We'll verify using your backup PIN.
            </div>

            {error && (
              <div style={{ background:'#FEF2F2',color:'#B91C1C',
                            border:'1px solid #FCA5A5',borderRadius:12,
                            padding:'10px 14px',fontSize:13 }}
                   className="dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize:11,fontWeight:700,color:'#64748B',
                              textTransform:'uppercase',letterSpacing:'0.5px',
                              display:'block',marginBottom:6 }}
                     className="dark:text-slate-400">
                Registered Email
              </label>
              <input type="email" value={email}
                     onChange={e => setEmail(e.target.value)}
                     placeholder="your@email.com"
                     autoFocus
                     style={{ width:'100%',background:'#F8FAFC',
                              border:'1.5px solid #E2E8F0',borderRadius:14,
                              padding:'12px 14px',fontSize:14,color:'#0F172A',
                              fontFamily:'Inter,sans-serif',outline:'none' }}
                     className="dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                     onFocus={e => e.target.style.borderColor='#2563EB'}
                     onBlur={e => e.target.style.borderColor='#E2E8F0'}/>
            </div>

            <button type="submit" disabled={loading}
                    style={{ background:loading?'#93C5FD':'#2563EB',color:'#fff',
                             border:'none',borderRadius:16,padding:'14px',
                             fontSize:14,fontWeight:700,cursor:'pointer',
                             fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              {loading ? 'Verifying...' : 'Verify Email →'}
            </button>
          </form>
        )}

        {/* STEP 2+3 — PIN + New Password */}
        {step === STEPS.PIN && (
          <form onSubmit={handleReset}
                style={{ display:'flex',flexDirection:'column',gap:16 }}>

            {message && (
              <div style={{ padding:'12px 14px',background:'#F0FDF4',
                            border:'1px solid #A7F3D0',borderRadius:12,
                            fontSize:13,color:'#065F46' }}
                   className="dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                ✓ {message}
              </div>
            )}

            {error && (
              <div style={{ background:'#FEF2F2',color:'#B91C1C',
                            border:'1px solid #FCA5A5',borderRadius:12,
                            padding:'10px 14px',fontSize:13 }}
                   className="dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            {[
              { label:'Backup PIN', key:'pin', type:'password',
                placeholder:'Enter 4-6 digit PIN',
                value:pin, onChange:e=>setPin(e.target.value), maxLength:6 },
              { label:'New Password', key:'pwd', type:'password',
                placeholder:'Min 8 characters',
                value:newPwd, onChange:e=>setNewPwd(e.target.value) },
              { label:'Confirm New Password', key:'cpwd', type:'password',
                placeholder:'Repeat new password',
                value:confirmPwd, onChange:e=>setConfirmPwd(e.target.value) },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:11,fontWeight:700,color:'#64748B',
                                textTransform:'uppercase',letterSpacing:'0.5px',
                                display:'block',marginBottom:6 }}
                       className="dark:text-slate-400">
                  {f.label}
                </label>
                <input type={f.type} value={f.value}
                       onChange={f.onChange} placeholder={f.placeholder}
                       maxLength={f.maxLength}
                       style={{ width:'100%',background:'#F8FAFC',
                                border:'1.5px solid #E2E8F0',borderRadius:14,
                                padding:'12px 14px',fontSize:14,color:'#0F172A',
                                fontFamily:'Inter,sans-serif',outline:'none' }}
                       className="dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                       onFocus={e => e.target.style.borderColor='#2563EB'}
                       onBlur={e => e.target.style.borderColor='#E2E8F0'}/>
              </div>
            ))}

            <button type="submit" disabled={loading}
                    style={{ background:loading?'#93C5FD':'#2563EB',color:'#fff',
                             border:'none',borderRadius:16,padding:'14px',
                             fontSize:14,fontWeight:700,cursor:'pointer',
                             fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              {loading ? 'Resetting...' : 'Reset Password 🔐'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
