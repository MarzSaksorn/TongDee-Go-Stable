import React, { useState } from "react";
import {
  AlertTriangle,
  Mail,
  Lock, 
  User, 
  LockKeyhole, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  Smartphone,
  Info
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import ThongdeeGoLogo from "./ThongdeeGoLogo";

interface AuthScreensProps {
  currentScreen: number; // 17 (Welcome), 18 (Login), 19 (Register), 20 (Forgot)
  onNavigate: (screen: number) => void;
  onLoginSuccess: (userData: { name: string; emailOrPhone: string; isGuest: boolean }) => void;
  onRegisterSuccess: (userData: { name: string; emailOrPhone: string; isGuest: boolean }) => void;
  onContinueAsGuest: () => void;
}

export default function AuthScreens({
  currentScreen,
  onNavigate,
  onLoginSuccess,
  onRegisterSuccess,
  onContinueAsGuest
}: AuthScreensProps) {
  // Common states for auth forms
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear states when transitioning
  const changeScreen = (screen: number) => {
    setErrorText("");
    setSuccessText("");
    setIsSubmitting(false);
    onNavigate(screen);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    
    if (!emailOrPhone.trim()) {
      setErrorText("กรุณากรอกอีเมลหรือเบอร์โทรศัพท์");
      return;
    }
    if (!password) {
      setErrorText("กรุณากรอกรหัสผ่าน");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailOrPhone.trim(),
        password: password,
      });

      if (authError) {
        setErrorText("อีเมล/เบอร์โทรศัพท์ หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      if (authData.user) {
        // Profile is loaded by the App-level onAuthStateChange listener;
        // fetching here duplicates that query and races the listener.
        onLoginSuccess({
          name: "นักท่องเที่ยว",
          emailOrPhone: authData.user.email || emailOrPhone,
          isGuest: false
        });
      }
    } catch (err) {
      console.error(err);
      setErrorText("ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!displayName.trim()) {
      setErrorText("กรุณากรอกชื่อที่จะแสดงในแอป");
      return;
    }
    if (!emailOrPhone.trim()) {
      setErrorText("กรุณากรอกอีเมล");
      return;
    }
    if (!password) {
      setErrorText("กรุณากรอกรหัสผ่าน");
      return;
    }
    if (password !== confirmPassword) {
      setErrorText("รหัสผ่านกับการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    if (password.length < 6) {
      setErrorText("เพื่อความปลอดภัย รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailOrPhone.trim(),
        password: password,
      });

      if (authError) {
        setErrorText(authError.message === "User already registered" ? "ผู้ใช้บัญชีนี้ได้ทำการสมัครสมาชิกแล้ว" : "การสมัครสมาชิกล้มเหลว");
        return;
      }

      if (authData.user) {
        // Create row in profiles
        const { error: profileError } = await supabase.from("profiles").insert({
          owner_id: authData.user.id,
          display_name: displayName.trim(),
          phone: !emailOrPhone.includes("@") ? emailOrPhone.trim() : null,
          role: "tourist"
        });

        if (profileError) console.error("Profile creation error:", profileError);

        // Create row in user_settings
        const { error: settingsError } = await supabase.from("user_settings").insert({
          user_id: authData.user.id,
          language: "TH",
          safety_mode: true,
          primary_accent: "blue",
          custom_primary_color: null,
          use_custom_primary_color: false,
          ui_scale: "compact"
        });

        if (settingsError) console.error("Settings creation error:", settingsError);

        onRegisterSuccess({
          name: displayName.trim(),
          emailOrPhone: emailOrPhone.trim(),
          isGuest: false
        });
      }
    } catch (err) {
      console.error(err);
      setErrorText("ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    if (!emailOrPhone.trim()) {
      setErrorText("กรุณากรอกอีเมล");
      return;
    }

    if (!emailOrPhone.includes("@")) {
      setErrorText("ตอนนี้รองรับการรีเซ็ตรหัสผ่านผ่านอีเมลเท่านั้น");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailOrPhone.trim());
      if (error) {
        setErrorText("ไม่สามารถทำรายการได้ กรุณาตรวจสอบอีเมลอีกครั้ง");
      } else {
        setSuccessText(`ส่งลิงก์ตั้งค่ารหัสผ่านใหม่ไปยัง ${emailOrPhone} เรียบร้อยแล้ว!`);
      }
    } catch (err) {
      setErrorText("เกิดข้อผิดพลาดในการกู้คืนรหัสผ่าน");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-y-auto px-6 py-8 relative justify-between animate-fade-in-up">
      
      {/* 17: WELCOME SCREEN */}
      {currentScreen === 17 && (
        <div className="flex flex-col justify-between h-full w-full my-auto py-4">
          {/* Top Design Elements */}
          <div className="flex justify-center items-center mt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-150/10 text-primary rounded-full text-xs font-medium">
              
            </div>
          </div>

          <div className="flex flex-col items-center text-center my-8">
            {/* Super friendly app custom logo */}
            <ThongdeeGoLogo size={120} showBg={true} className="mb-6 rounded-2xl border-4 border-amber-400/80" />

            <h1 className="text-2xl font-extrabold tracking-wider font-sans mb-2 drop-shadow-md text-primary">
              ทองดี <span className="text-amber-300 drop-shadow-none">โก</span>
            </h1>
            
            <p className="text-xs font-semibold text-muted-foreground mt-2 tracking-wide">
              วิถีเมืองรองแห่งวีรบุรุษดาบหัก พิชัย อุตรดิตถ์
            </p>

            <div className="mt-5 max-w-[290px] bg-primary/8 px-4 py-3.5 rounded-2xl border border-primary/10 text-center">
              <p className="text-[12px] font-bold text-primary leading-relaxed">
                "เที่ยวพิชัยแบบสนุก ปลอดภัย และมีเรื่องเล่า"
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1 font-normal">
                สแกนยอนยุค ตราประทับดิจิทัลนำเดินทาง และ OTOP ท้องถิ่น
              </p>
            </div>
          </div>

          {/* Action core buttons */}
          <div className="flex flex-col gap-3.5 w-full max-w-sm mx-auto">
            <button 
              onClick={() => changeScreen(18)}
              className="w-full h-13 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>เข้าสู่ระบบ (Log In)</span>
            </button>

            <button 
              onClick={() => changeScreen(19)}
              className="w-full h-13 bg-white hover:bg-muted border-2 border-border text-primary active:scale-[0.98] text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>สมัครสมาชิกใหม่ (Register)</span>
            </button>

            <button 
              onClick={onContinueAsGuest}
              className="w-full py-3 hover:text-muted-foreground active:scale-95 text-muted-foreground/60 text-xs font-bold transition-all text-center underline cursor-pointer"
            >
              ใช้งานแบบไม่เข้าสู่ระบบ (ใช้งานทั่วไป)
            </button>
          </div>

          <div className="text-center text-[9px] text-muted-foreground/60 select-none mt-6">
            (c) 2026 โครงการนำร่องส่งเสริมการท่องเที่ยวเมืองรองด้วย AI และประวัติศาสตร์อัจฉริยะ
          </div>
        </div>
      )}

      {/* 18: LOGIN SCREEN */}
      {currentScreen === 18 && (
        <div className="flex flex-col h-full w-full justify-between py-2">
          {/* Back button */}
          <button 
            onClick={() => changeScreen(17)}
            className="self-start p-1.5 bg-white border border-border/60 rounded-xl text-foreground hover:text-slate-900 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับ</span>
          </button>

          <div className="my-auto py-4">
            <div className="text-left mb-6">
              <span className="text-xs font-medium text-gray-500 pl-0.5">ยินดีต้อนรับกลับมา</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">เข้าสู่ระบบท่องเที่ยว</h2>
              <p className="text-[11px] text-muted-foreground/60 font-medium">เข้าเพื่อซิงค์ข้อมูล แสตมป์ คูปอง OTOP และประวัติเมืองรองของคุณ</p>
            </div>

            {errorText && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold mb-4 leading-relaxed animate-shake">
                ข้อผิดพลาด: {errorText}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Field 1: Email or Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 pl-1">
                  อีเมลหรือเบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <input 
                    type="text" 
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="example@email.com หรือ 0812345678"
                    className="w-full text-xs h-12 pl-10.5 pr-4 bg-card border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-all font-medium"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-medium text-gray-500 pl-1">
                    รหัสผ่าน
                  </label>
                  <button 
                    type="button"
                    onClick={() => changeScreen(20)}
                    className="text-[10px] font-extrabold text-primary hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    className="w-full text-xs h-12 pl-10.5 pr-10 bg-card border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-all font-mono font-bold"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground/60 hover:text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* LogIn core submit button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 mt-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                ) : (
                  <span>เข้าสู่ระบบอย่างปลอดภัย</span>
                )}
              </button>
            </form>

          </div>

          {/* Prompt switch to register */}
          <p className="text-xs text-center text-muted-foreground mt-2 select-none">
            ยังไม่มีบัญชีสมาชิกเหรอคะ?{" "}
            <button 
              onClick={() => changeScreen(19)}
              className="font-extrabold text-primary hover:underline cursor-pointer"
            >
              สมัครสมาชิกฟรี
            </button>
          </p>
        </div>
      )}

      {/* 19: REGISTER SCREEN */}
      {currentScreen === 19 && (
        <div className="flex flex-col h-full w-full justify-between py-2">
          {/* Back button */}
          <button 
            onClick={() => changeScreen(17)}
            className="self-start p-1.5 bg-white border border-border/60 rounded-xl text-foreground hover:text-slate-900 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับ</span>
          </button>

          <div className="my-auto py-3">
            <div className="text-left mb-4">
              <span className="text-xs font-medium text-gray-500 pl-0.5">รับพาสปอร์ตดิจิทัลใบใหม่</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">สมัครสมาชิก Thong dee Go</h2>
              <p className="text-[11px] text-muted-foreground/60 font-medium">เพื่อเริ่มต้นไต่เวลารับเหรียญสะสมและแฮปปี้กับดีลท้องถิ่น</p>
            </div>

            {errorText && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold mb-3.5 leading-relaxed flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
              {/* Field 1: Display Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 pl-1">
                  ชื่อที่แสดงในแอป (แฮนเดิล)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น คุณเหมียว เดินชิล"
                    className="w-full text-xs h-11 pl-10.5 pr-4 bg-card border border-border rounded-lg focus:border-primary outline-none text-foreground transition-all font-medium"
                  />
                </div>
              </div>

              {/* Field 2: Email or Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 pl-1">
                  อีเมลหรือเบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <input 
                    type="text" 
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="example@email.com หรือเบอร์มือถือ"
                    className="w-full text-xs h-11 pl-10.5 pr-4 bg-card border border-border rounded-lg focus:border-primary outline-none text-foreground transition-all font-medium"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 pl-1">
                  รหัสผ่าน (6 ตัวอักษรขึ้นไป)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LockKeyhole className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ตั้งรหัสผ่านที่จำง่าย"
                    className="w-full text-xs h-11 pl-10.5 pr-10 bg-card border border-border rounded-lg focus:border-primary outline-none text-foreground transition-all font-sans"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 4: Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 pl-1">
                  ยืนยันรหัสผ่านอีกครั้ง
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="กรอกให้ตรงรหัสผ่านตะกี้"
                    className="w-full text-xs h-11 pl-10.5 pr-4 bg-card border border-border rounded-lg focus:border-primary outline-none text-foreground transition-all font-sans"
                  />
                </div>
              </div>

              {/* Dynamic registration tip */}
              <div className="flex items-start gap-2 bg-primary/5 p-2.5 rounded-xl border border-primary/10 text-muted-foreground select-none text-[10px] leading-normal font-medium mt-1">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  สมาชิกใหม่จะได้รับยศเริ่มต้น <strong>Level 1 Explorer</strong>, <strong>โหมดช่วยเหลือฉุกเฉินเปิดเป็นมาตรฐาน</strong> และพาสปอร์ตเปล่าเตรียมรับแสตมป์รอบเมืองพิชัยชิ้นแรกพร้อมๆ กันค่ะ
                </span>
              </div>

              {/* Submit Registration */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 mt-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                ) : (
                  <span>สมัครรับพาสปอร์ตเลย</span>
                )}
              </button>
            </form>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-2 select-none">
            มีบัญชีแล้ว?{" "}
            <button 
              onClick={() => changeScreen(18)}
              className="font-extrabold text-primary hover:underline cursor-pointer"
            >
              เข้าสู่ระบบที่นี่
            </button>
          </p>
        </div>
      )}

      {/* 20: FORGOT PASSWORD SCREEN */}
      {currentScreen === 20 && (
        <div className="flex flex-col h-full w-full justify-between py-2">
          {/* Back to Login */}
          <button 
            onClick={() => changeScreen(18)}
            className="self-start p-1.5 bg-white border border-border/60 rounded-xl text-foreground hover:text-slate-900 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปเข้าสู่ระบบ</span>
          </button>

          <div className="my-auto py-4">
            <div className="text-left mb-6">
              <span className="text-xs font-medium text-gray-500 pl-0.5">ลืมการเข้าถึงบัญชี</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">กู้คืนรหัสผ่านของคุณ</h2>
              <p className="text-[11px] text-muted-foreground/60 font-medium">กรอกชื่อเบอร์หรืออีเมล เพื่อส่งรหัส OTP หรือลิงก์กู้คืนระบบความปลอดภัยของคุณ</p>
            </div>

            {errorText && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold mb-4 leading-relaxed flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            {successText && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-[11px] font-semibold mb-6 leading-relaxed">
                สำเร็จ: {successText}
              </div>
            )}

            <form onSubmit={handleForgot} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 pl-1">
                  อีเมลหรือเบอร์โทรศัพท์มือถือที่ใช้สมัคร
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Smartphone className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <input 
                    type="text" 
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="ตัวอย่าง example@email.com หรือ 081-xxxx-xxx"
                    className="w-full text-xs h-12 pl-10.5 pr-4 bg-card border border-border rounded-lg focus:border-primary outline-none text-foreground transition-all font-medium"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/40 border border-blue-100/50 rounded-xl text-blue-900 text-[11px] leading-relaxed font-normal select-none mb-2">
                <strong>ข้อความช่วยเหลือฉุกเฉิน:</strong> เราจะส่งรหัสยืนยัน (OTP) 6 หลักเพื่อให้คุณตั้งรหัสผ่านใหม่ได้อย่างสะดวกสบายสูงสุดบนรถโดยสารหรือขี่เดินสำรวจตลาดโบราณค่ะ
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                ) : (
                  <span>ส่งรหัสยืนยันตั้งรหัสผ่านใหม่</span>
                )}
              </button>
            </form>
          </div>

          <div className="text-center">
            <button 
              onClick={() => changeScreen(18)}
              className="text-xs font-bold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              ยกเลิกและย้อนกลับ
            </button>
          </div>
        </div>
      )}

    </div>
  );

}
