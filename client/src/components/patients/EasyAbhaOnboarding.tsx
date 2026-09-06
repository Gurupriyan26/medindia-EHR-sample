import React, { useState } from 'react';
import { Patient, BloodGroup, Gender } from '../../types';
import {
  Volume2,
  VolumeX,
  Languages,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  User,
  Heart,
  QrCode,
  Printer,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  HelpCircle,
} from 'lucide-react';
import { AbhaHealthCard } from '../common/AbhaHealthCard';

type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'bn';

interface EasyAbhaOnboardingProps {
  onComplete: (patientData: Partial<Patient>) => Promise<void>;
  onCancel: () => void;
  onSwitchToClinical: () => void;
}

const TRANSLATIONS: Record<Language, {
  title: string;
  subtitle: string;
  step1Title: string;
  step1Desc: string;
  mobileLabel: string;
  sendOtp: string;
  otpLabel: string;
  verifyOtp: string;
  autoOtpDemo: string;
  step2Title: string;
  step2Desc: string;
  nameLabel: string;
  ageLabel: string;
  genderLabel: string;
  male: string;
  female: string;
  other: string;
  bloodLabel: string;
  step3Title: string;
  step3Desc: string;
  successMsg: string;
  abhaAddressLabel: string;
  abhaNumLabel: string;
  saveAndFinish: string;
  voicePromptStep1: string;
  voicePromptStep2: string;
  voicePromptStep3: string;
}> = {
  en: {
    title: 'Easy 1-Minute Health Card (ABHA)',
    subtitle: 'Simplified registration for all patients • No passwords needed',
    step1Title: 'Step 1: Mobile & OTP Verification',
    step1Desc: 'Enter your phone number to receive a secure login OTP',
    mobileLabel: '10-Digit Mobile Number',
    sendOtp: 'Send Verification OTP',
    otpLabel: 'Enter 6-Digit SMS Code',
    verifyOtp: 'Verify & Continue',
    autoOtpDemo: '⚡ 1-Tap Auto-Fill Demo OTP',
    step2Title: 'Step 2: Basic Details',
    step2Desc: 'Tell us your name and basic information',
    nameLabel: 'Full Name',
    ageLabel: 'Age in Years',
    genderLabel: 'Select Gender',
    male: 'Male (पुरुष / ஆண்)',
    female: 'Female (महिला / பெண்)',
    other: 'Other (अन्य)',
    bloodLabel: 'Select Blood Group (Optional)',
    step3Title: 'Step 3: Your Health Card is Ready!',
    step3Desc: 'Digital ABHA Card created with secure National Health ID',
    successMsg: 'Congratulations! Your digital health identity has been generated.',
    abhaAddressLabel: 'Your ABHA Address',
    abhaNumLabel: '14-Digit ABHA ID',
    saveAndFinish: 'Complete & Save Patient Profile',
    voicePromptStep1: 'Welcome to MedIndia EHR. Please enter your 10 digit mobile number and verify with OTP.',
    voicePromptStep2: 'Please tell us your full name, age, and select your gender.',
    voicePromptStep3: 'Congratulations! Your digital health card is ready. You can now save and print it.',
  },
  hi: {
    title: 'सरल 1-मिनट आयुष्मान स्वास्थ्य कार्ड',
    subtitle: 'सभी मरीजों के लिए आसान रजिस्ट्रेशन • किसी पासवर्ड की जरूरत नहीं',
    step1Title: 'चरण 1: मोबाइल और OTP सत्यापन',
    step1Desc: 'सुरक्षित कोड प्राप्त करने के लिए अपना मोबाइल नंबर दर्ज करें',
    mobileLabel: '10 अंकों का मोबाइल नंबर',
    sendOtp: 'OTP कोड भेजें',
    otpLabel: '6 अंकों का SMS कोड दर्ज करें',
    verifyOtp: 'सत्यापित करें और आगे बढ़ें',
    autoOtpDemo: '⚡ डेमो OTP भरें (123456)',
    step2Title: 'चरण 2: सामान्य जानकारी',
    step2Desc: 'कृपया अपना नाम और बुनियादी जानकारी दर्ज करें',
    nameLabel: 'पूरा नाम',
    ageLabel: 'उम्र (वर्ष)',
    genderLabel: 'लिंग चुनें',
    male: 'पुरुष (Male)',
    female: 'महिला (Female)',
    other: 'अन्य (Other)',
    bloodLabel: 'रक्त समूह (Blood Group)',
    step3Title: 'चरण 3: आपका स्वास्थ्य कार्ड तैयार है!',
    step3Desc: 'राष्ट्रीय डिजिटल स्वास्थ्य पहचान (ABHA) सफलतापूर्वक बन गया है',
    successMsg: 'बधाई हो! आपका डिजिटल स्वास्थ्य कार्ड बन चुका है।',
    abhaAddressLabel: 'आपका ABHA पता',
    abhaNumLabel: '14 अंकों का ABHA नंबर',
    saveAndFinish: 'सुरक्षित करें और अस्पताल में जोड़ें',
    voicePromptStep1: 'मेडइंडिया ईएचआर में आपका स्वागत है। कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें।',
    voicePromptStep2: 'कृपया अपना पूरा नाम, उम्र और लिंग चुनें।',
    voicePromptStep3: 'बधाई हो! आपका स्वास्थ्य कार्ड तैयार है। आप इसे सेव और प्रिंट कर सकते हैं।',
  },
  ta: {
    title: 'எளிதான 1 நிமிட சுகாதார அட்டை (ABHA)',
    subtitle: 'அனைவருக்கும் எளிய பதிவு • கடவுச்சொல் தேவையில்லை',
    step1Title: 'படி 1: மொபைல் மற்றும் OTP சரிபார்ப்பு',
    step1Desc: 'சரிபார்ப்பு குறியீட்டைப் பெற உங்கள் மொபைல் எண்ணை உள்ளிடவும்',
    mobileLabel: '10 இலக்க மொபைல் எண்',
    sendOtp: 'OTP குறியீடு அனுப்பவும்',
    otpLabel: '6 இலக்க SMS குறியீட்டை உள்ளிடவும்',
    verifyOtp: 'சரிபார்த்து தொடரவும்',
    autoOtpDemo: '⚡ டெமோ OTP நிரப்பவும் (123456)',
    step2Title: 'படி 2: அடிப்படை விவரங்கள்',
    step2Desc: 'உங்கள் பெயர் மற்றும் அடிப்படை தகவல்களை உள்ளிடவும்',
    nameLabel: 'முழு பெயர்',
    ageLabel: 'வயது',
    genderLabel: 'பாலினம் தேர்ந்தெடுக்கவும்',
    male: 'ஆண் (Male)',
    female: 'பெண் (Female)',
    other: 'மற்றவை (Other)',
    bloodLabel: 'இரத்த வகை (Blood Group)',
    step3Title: 'படி 3: உங்கள் சுகாதார அட்டை தயார்!',
    step3Desc: 'தேசிய சுகாதார அடையாள அட்டை வெற்றிகரமாக உருவாக்கப்பட்டது',
    successMsg: 'வாழ்த்துகள்! உங்கள் டிஜிட்டல் சுகாதார அட்டை உருவாக்கப்பட்டது.',
    abhaAddressLabel: 'உங்கள் ABHA முகவரி',
    abhaNumLabel: '14 இலக்க ABHA எண்',
    saveAndFinish: 'சேமித்து முடிக்கவும்',
    voicePromptStep1: 'வணக்கம்! உங்கள் 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.',
    voicePromptStep2: 'உங்கள் முழு பெயர், வயது மற்றும் பாலினத்தை தேர்ந்தெடுக்கவும்.',
    voicePromptStep3: 'வாழ்த்துகள்! உங்கள் சுகாதார அட்டை தயாராக உள்ளது.',
  },
  te: {
    title: 'సులభమైన 1-నిమిషం హెల్త్ కార్డ్ (ABHA)',
    subtitle: 'అందరికీ సులభమైన నమోదు • పాస్‌వర్డ్ అవసరం లేదు',
    step1Title: 'దశ 1: మొబైల్ & OTP ధృవీకరణ',
    step1Desc: 'ధృవీకరణ కోడ్ పొందడానికి మీ మొబైల్ నంబర్‌ను నమోదు చేయండి',
    mobileLabel: '10 అంకెల మొబైల్ నంబర్',
    sendOtp: 'OTP పంపండి',
    otpLabel: '6 అంకెల SMS కోడ్ నమోదు చేయండి',
    verifyOtp: 'ధృవీకరించి కొనసాగండి',
    autoOtpDemo: '⚡ డెమో OTP పూరించండి (123456)',
    step2Title: 'దశ 2: ప్రాథమిక వివరాలు',
    step2Desc: 'మీ పేరు మరియు సమాచారాన్ని నమోదు చేయండి',
    nameLabel: 'పూర్తి పేరు',
    ageLabel: 'వయస్సు (సంవత్సరాలు)',
    genderLabel: 'లింగం ఎంచుకోండి',
    male: 'పురుషుడు (Male)',
    female: 'స్త్రీ (Female)',
    other: 'ఇతర (Other)',
    bloodLabel: 'రక్త వర్గం (Blood Group)',
    step3Title: 'దశ 3: మీ హెల్త్ కార్డ్ సిద్ధంగా ఉంది!',
    step3Desc: 'డిజిటల్ ABHA కార్డ్ విజయవంతంగా సృష్టించబడింది',
    successMsg: 'అభినందనలు! మీ డిజిటల్ హెల్త్ కార్డ్ సిద్ధమైంది.',
    abhaAddressLabel: 'మీ ABHA చిరునామా',
    abhaNumLabel: '14 అంకెల ABHA నంబర్',
    saveAndFinish: 'సేవ్ చేసి ముగించండి',
    voicePromptStep1: 'నమస్కారం! దయచేసి మీ 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.',
    voicePromptStep2: 'దయచేసి మీ పూర్తి పేరు, వయస్సు మరియు లింగాన్ని ఎంచుకోండి.',
    voicePromptStep3: 'అభినందనలు! మీ డిజిటల్ హెల్త్ కార్డ్ సిద్ధంగా ఉంది.',
  },
  kn: {
    title: 'ಸುಲಭ 1-ನಿಮಿಷದ ಆರೋಗ್ಯ ಕಾರ್ಡ್ (ABHA)',
    subtitle: 'ಎಲ್ಲಾ ರೋಗಿಗಳಿಗೆ ಸರಳ ನೋಂದಣಿ • ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ',
    step1Title: 'ಹಂತ 1: ಮೊಬೈಲ್ & OTP ಪರಿಶೀಲನೆ',
    step1Desc: 'ಪರಿಶೀಲನಾ ಕೋಡ್ ಪಡೆಯಲು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
    mobileLabel: '10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    sendOtp: 'OTP ಕಳುಹಿಸಿ',
    otpLabel: '6 ಅಂಕಿಗಳ SMS ಕೋಡ್ ನಮೂದಿಸಿ',
    verifyOtp: 'ಪರಿಶೀಲಿಸಿ ಮುಂದುವರಿಯಿರಿ',
    autoOtpDemo: '⚡ ಡೆಮೊ OTP ತುಂಬಿ (123456)',
    step2Title: 'ಹಂತ 2: ಮೂಲ ವಿವರಗಳು',
    step2Desc: 'ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಮಾಹಿತಿಯನ್ನು ನಮೂದಿಸಿ',
    nameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
    ageLabel: 'ವಯಸ್ಸು',
    genderLabel: 'ಲಿಂಗ ಆಯ್ಕೆಮಾಡಿ',
    male: 'ಪುರುಷ (Male)',
    female: 'ಮಹಿಳೆ (Female)',
    other: 'ಇತರ (Other)',
    bloodLabel: 'ರಕ್ತದ ಗುಂಪು',
    step3Title: 'ಹಂತ 3: ನಿಮ್ಮ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಸಿದ್ಧವಾಗಿದೆ!',
    step3Desc: 'ಡಿಜಿಟಲ್ ABHA ಕಾರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ',
    successMsg: 'ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಸಿದ್ಧವಾಗಿದೆ.',
    abhaAddressLabel: 'ನಿಮ್ಮ ABHA ವಿಳಾಸ',
    abhaNumLabel: '14 ಅಂಕಿಗಳ ABHA ಸಂಖ್ಯೆ',
    saveAndFinish: 'ಉಳಿಸಿ ಮತ್ತು ಮುಗಿಸಿ',
    voicePromptStep1: 'ನಮಸ್ಕಾರ! ದಯವಿಟ್ಟು ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    voicePromptStep2: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರು, ವಯಸ್ಸು ಮತ್ತು ಲಿಂಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    voicePromptStep3: 'ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಸಿದ್ಧವಾಗಿದೆ.',
  },
  bn: {
    title: 'সহজ ১-মিনিটের স্বাস্থ্য কার্ড (ABHA)',
    subtitle: 'সকল রোগীদের জন্য সহজ নিবন্ধন • কোনো পাসওয়ার্ডের প্রয়োজন নেই',
    step1Title: 'ধাপ ১: মোবাইল এবং ওটিপি যাচাইকরণ',
    step1Desc: 'যাচাইকরণ কোড পেতে আপনার মোবাইল নম্বর লিখুন',
    mobileLabel: '১০ সংখ্যার মোবাইল নম্বর',
    sendOtp: 'OTP কোড পাঠান',
    otpLabel: '৬ সংখ্যার SMS কোড লিখুন',
    verifyOtp: 'যাচাই করুন এবং এগিয়ে যান',
    autoOtpDemo: '⚡ ডেমো ওটিপি পূরণ করুন (123456)',
    step2Title: 'ধাপ ২: প্রাথমিক তথ্য',
    step2Desc: 'আপনার নাম এবং সাধারণ তথ্য প্রদান করুন',
    nameLabel: 'সম্পূর্ণ নাম',
    ageLabel: 'বয়স (বছর)',
    genderLabel: 'লিঙ্গ নির্বাচন করুন',
    male: 'পুরুষ (Male)',
    female: 'মহিলা (Female)',
    other: 'অন্যান্য (Other)',
    bloodLabel: 'রক্তের গ্রুপ (Blood Group)',
    step3Title: 'ধাপ ৩: আপনার স্বাস্থ্য কার্ড প্রস্তুত!',
    step3Desc: 'ডিজিটাল স্বাস্থ্য কার্ড সফলভাবে তৈরি হয়েছে',
    successMsg: 'অভিনন্দন! আপনার ডিজিটাল স্বাস্থ্য কার্ড তৈরি হয়েছে।',
    abhaAddressLabel: 'আপনার ABHA ঠিকানা',
    abhaNumLabel: '১৪ সংখ্যার ABHA আইডি',
    saveAndFinish: 'সংরক্ষণ করুন এবং শেষ করুন',
    voicePromptStep1: 'নমস্কার! অনুগ্রহ করে আপনার ১০ সংখ্যার মোবাইল নম্বর লিখুন।',
    voicePromptStep2: 'অনুগ্রহ করে আপনার পুরো নাম, বয়স এবং লিঙ্গ নির্বাচন করুন।',
    voicePromptStep3: 'অভিনন্দন! আপনার স্বাস্থ্য কার্ড প্রস্তুত।',
  },
};

const BLOOD_GROUPS: BloodGroup[] = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

export const EasyAbhaOnboarding: React.FC<EasyAbhaOnboardingProps> = ({
  onComplete,
  onCancel,
  onSwitchToClinical,
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Step 1 Form
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Step 2 Form
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('Male');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');

  // Step 3 Generated ABHA
  const [generatedAbhaId, setGeneratedAbhaId] = useState('');
  const [generatedAbhaAddress, setGeneratedAbhaAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const t = TRANSLATIONS[lang];

  // Voice narration helper using Web Speech API
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt language voice matching
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'ta') utterance.lang = 'ta-IN';
    else if (lang === 'te') utterance.lang = 'te-IN';
    else if (lang === 'bn') utterance.lang = 'bn-IN';
    else if (lang === 'kn') utterance.lang = 'kn-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      setError('Please enter the OTP code');
      return;
    }
    setError('');
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setStep(2);
      speakText(t.voicePromptStep2);
    }, 600);
  };

  const handleAutoFillDemo = () => {
    setPhone('9876543210');
    setOtpSent(true);
    setOtp('123456');
    setError('');
  };

  const handleStep2Next = () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!age || Number(age) <= 0 || Number(age) > 120) {
      setError('Please enter a valid age');
      return;
    }
    setError('');

    // Generate ABHA ID & address
    const random14 = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.').slice(0, 15);
    const newAddress = `${cleanName}@abdm`;

    setGeneratedAbhaId(random14);
    setGeneratedAbhaAddress(newAddress);
    setStep(3);
    speakText(t.voicePromptStep3);
  };

  const handleFinalSave = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({
        name: name.trim(),
        age: Number(age),
        gender,
        bloodGroup,
        phone: phone.startsWith('+91') ? phone : `+91 ${phone.replace(/\D/g, '')}`,
        abhaId: generatedAbhaId,
        abhaAddress: generatedAbhaAddress,
        registeredDate: new Date().toISOString().split('T')[0],
        allergies: [],
        medicalHistory: [],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createdPatientObj: Patient = {
    _id: 'new-temp-id',
    id: 'new-temp-id',
    name: name || 'New Patient',
    age: Number(age) || 30,
    gender: gender || 'Male',
    bloodGroup: bloodGroup || 'B+',
    phone: phone || '+91 98765 43210',
    abhaId: generatedAbhaId || '91-4567-8901-2345',
    abhaAddress: generatedAbhaAddress || 'patient@abdm',
    allergies: [],
    medicalHistory: [],
    registeredDate: new Date().toISOString().split('T')[0],
  };

  return (
    <div className="flex flex-col">
      {/* Top Language & Accessibility Bar */}
      <div className="bg-slate-100 p-3 rounded-2xl mb-5 flex flex-wrap items-center justify-between gap-3 border border-slate-200">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-bold text-slate-700">Language / भाषा:</span>
          <div className="flex flex-wrap gap-1">
            {(
              [
                ['en', 'English'],
                ['hi', 'हिंदी'],
                ['ta', 'தமிழ்'],
                ['te', 'తెలుగు'],
                ['kn', 'ಕನ್ನಡ'],
                ['bn', 'বাংলা'],
              ] as [Language, string][]
            ).map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setLang(code);
                  speakText(TRANSLATIONS[code][`voicePromptStep${step}` as keyof typeof t] as string);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                  lang === code
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Guidance Button */}
        <button
          type="button"
          onClick={() => {
            if (isSpeaking) {
              window.speechSynthesis?.cancel();
              setIsSpeaking(false);
            } else {
              speakText(t[`voicePromptStep${step}` as keyof typeof t] as string);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isSpeaking
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-white text-brand-700 hover:bg-brand-50 border border-brand-200 shadow-sm'
          }`}
          title="Listen in your language"
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-brand-600" />}
          <span>{isSpeaking ? 'Stop Voice' : '🗣️ बोलकर सुनें (Voice)'}</span>
        </button>
      </div>

      {/* Visual Step Progress Bar */}
      <div className="flex items-center justify-between mb-6 px-2">
        {[
          { num: 1, title: '1. Phone & OTP' },
          { num: 2, title: '2. Name & Age' },
          { num: 3, title: '3. Health Card' },
        ].map(item => (
          <div key={item.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step === item.num
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-md'
                  : step > item.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step > item.num ? <CheckCircle2 className="w-4 h-4" /> : item.num}
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === item.num ? 'text-brand-700' : 'text-slate-500'}`}>
              {item.title}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── STEP 1: Phone & OTP ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-600" />
              {t.step1Title}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">{t.step1Desc}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.mobileLabel}</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">🇮🇳 +91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-16 pr-3 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none tracking-wider"
                />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                {otpSent ? 'Resend' : t.sendOtp}
              </button>
            </div>
          </div>

          {otpSent && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-fadeIn">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                {t.otpLabel}
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full py-2.5 text-center text-lg font-mono font-bold tracking-widest bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-2.5 py-1.5 rounded-lg border border-brand-200"
                >
                  {t.autoOtpDemo}
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || !otp}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifyingOtp ? 'Verifying...' : t.verifyOtp}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {!otpSent && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleAutoFillDemo}
                className="px-4 py-2 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-300 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.autoOtpDemo}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Basic Info (Visual Cards) ───────────────────────── */}
      {step === 2 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              {t.step2Title}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">{t.step2Desc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.nameLabel} *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.ageLabel} *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="35"
                  value={age}
                  onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <div className="flex gap-1">
                  {[25, 45, 60].map(quickAge => (
                    <button
                      key={quickAge}
                      type="button"
                      onClick={() => setAge(quickAge)}
                      className="px-2.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                    >
                      {quickAge}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Gender Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">{t.genderLabel} *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: 'Male' as Gender, icon: '👨', label: t.male },
                { val: 'Female' as Gender, icon: '👩', label: t.female },
                { val: 'Other' as Gender, icon: '⚧', label: t.other },
              ].map(item => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setGender(item.val)}
                  className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                    gender === item.val
                      ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-sm ring-2 ring-brand-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Blood Group Badges */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              {t.bloodLabel}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  className={`py-2 px-1 text-center font-bold text-xs rounded-xl border transition-all ${
                    bloodGroup === bg
                      ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <button
              type="button"
              onClick={handleStep2Next}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              Next: Generate Health Card
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Instant ABHA Card Generated ─────────────────────── */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{t.step3Title}</h4>
              <p className="text-xs text-emerald-800 font-medium">{t.successMsg}</p>
            </div>
          </div>

          {/* Render Digital ABHA Card */}
          <div className="py-2">
            <AbhaHealthCard patient={createdPatientObj} />
          </div>

          {/* Complete & Save Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Edit Details
            </button>

            <button
              type="button"
              onClick={handleFinalSave}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5" />
              {isSubmitting ? 'Saving...' : t.saveAndFinish}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Switcher to Full Clinical Mode */}
      <div className="mt-6 pt-4 border-t border-slate-200 text-center">
        <button
          type="button"
          onClick={onSwitchToClinical}
          className="text-xs text-slate-500 hover:text-brand-600 font-semibold inline-flex items-center gap-1 underline underline-offset-4"
        >
          Are you a Doctor / Desk Staff? Switch to Detailed Clinical Form →
        </button>
      </div>
    </div>
  );
};
