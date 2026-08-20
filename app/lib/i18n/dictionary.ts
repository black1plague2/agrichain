import type { Locale } from "./locale";

export interface Dictionary {
  common: {
    logIn: string;
    getStarted: string;
    logOut: string;
    connectWallet: string;
    connecting: string;
    processing: string;
    close: string;
    crops: { wheat: string; rice: string; cotton: string };
  };
  languagePicker: {
    heading: string;
    subheading: string;
    continueLabel: string;
  };
  languageSwitcher: {
    label: string;
  };
  home: {
    navLogIn: string;
    navGetStarted: string;
    kicker: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaRegister: string;
    ctaSample: string;
    stats: { value: string; label: string }[];
    guaranteesKicker: string;
    guaranteesTitle: string;
    promises: { title: string; body: string }[];
    processKicker: string;
    processTitle: string;
    steps: { title: string; body: string }[];
    honestKicker: string;
    honestItems: { strong: string; rest: string }[];
    footer: string;
  };
  auth: {
    brand: string;
    loginSubtitle: string;
    newHere: string;
    createAccount: string;
    registerSubtitle: string;
    alreadyHaveAccount: string;
    signIn: string;
    phoneLabel: string;
    phonePlaceholder: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    phoneHint: string;
    buyerConnectHint: string;
    logisticsConnectHint: string;
    logInButton: string;
    signingIn: string;
    registerButton: string;
    registering: string;
  };
  roleTabs: { farmer: string; buyer: string; logistics: string };
  header: { platformTag: string };
  farmerPage: {
    heading: string;
    subheading: string;
    balanceLabel: string;
    registerPanelTitle: string;
    historyPanelTitle: string;
    historyEmpty: string;
    colId: string;
    colCrop: string;
    colQuantity: string;
    colJourney: string;
    colQr: string;
  };
  buyerPage: {
    heading: string;
    subheading: string;
    availablePanelTitle: string;
    availableEmpty: string;
    noPriceSet: string;
    historyPanelTitle: string;
    historyEmpty: string;
    colBatch: string;
    colDeposit: string;
    colJourney: string;
  };
  logisticsPage: {
    heading: string;
    subheading: string;
    settledLabel: string;
    penaltyLabel: string;
    activePanelTitle: string;
    activeEmpty: string;
    kgRegistered: string;
    kgVerified: string;
    farmerPaidSuffix: string;
  };
  batchRegisterForm: {
    cropLabel: string;
    quantityLabel: string;
    quantityPlaceholder: string;
    locationLabel: string;
    locationHint: string;
    photoLabel: string;
    submit: string;
    submitting: string;
  };
  logisticsActions: {
    confirmPickup: string;
    confirmDelivery: string;
    verifyWeight: string;
    submit: string;
    releasePayment: string;
    processing: string;
    stepConfirmingPickup: string;
    stepConfirmingDelivery: string;
    stepReleasingPayment: string;
    stepCheckDevice: string;
    stepAssignDevice: string;
    stepDeviceAssigned: string;
    stepSubmitReading: string;
    actualWeightLabel: string;
  };
  openEscrow: {
    open: string;
    processing: string;
    stepConnect: string;
    stepPrice: string;
    stepApprove: string;
    stepOpen: string;
  };
  withdraw: { action: string };
  pipeline: {
    registered: string;
    escrowed: string;
    inTransit: string;
    delivered: string;
    weighed: string;
    settled: string;
  };
  status: {
    registered: string;
    inTransit: string;
    awaitingWeighIn: string;
    settled: string;
    disputed: string;
    refunded: string;
  };
  analytics: {
    panelTitle: string;
    totalBatches: string;
    totalVolume: string;
    activeEscrows: string;
    settled: string;
    totalSettledValue: string;
    penaltyRate: string;
    volumeByCrop: string;
    noBatches: string;
    pipelineFunnel: string;
  };
  activityFeed: {
    defaultTitle: string;
    live: string;
    updatesEvery: string;
    noActivity: string;
    proof: string;
    filters: {
      all: string;
      registration: string;
      pricing: string;
      logistics: string;
      weighbridge: string;
      settlement: string;
      dispute: string;
    };
    justNow: string;
    secondsAgo: (n: number) => string;
    minutesAgo: (n: number) => string;
    hoursAgo: (n: number) => string;
    statusLabels: { registered: string; inTransit: string; delivered: string; settled: string };
    events: {
      batchRegistered: (id: string, kg: string, crop: string) => string;
      batchMoved: (id: string, from: string, to: string) => string;
      priceSet: (crop: string, price: string) => string;
      priceJumpFlagged: (crop: string) => string;
      deviceAssigned: (id: string) => string;
      weightVerified: (id: string, kg: string) => string;
      escrowOpened: (id: string, amount: string) => string;
      escrowSettled: (id: string, amount: string) => string;
      penaltyApplied: (id: string, pct: string) => string;
      escrowRefunded: (id: string, amount: string) => string;
      disputeFlagged: (id: string) => string;
      disputeResolved: (id: string) => string;
      withdrawn: (amount: string, account: string) => string;
    };
  };
  verifyPage: {
    publicRecordTag: string;
    whereRightNow: string;
    batchPrefix: string;
    crop: string;
    registeredQuantity: string;
    status: string;
    weighbridgeVerified: string;
    lockedPrice: string;
    farmerPaid: string;
    deviationWarning: (pct: string) => string;
    priceSource: string;
    fullStoryTitle: string;
    viewFarmerWallet: string;
    cacheDisclaimer: string;
  };
  batchQr: { clickToEnlarge: string; scanHint: string; close: string };
}

const en: Dictionary = {
  common: {
    logIn: "Log in",
    getStarted: "Get started",
    logOut: "Log out",
    connectWallet: "Connect Wallet",
    connecting: "Connecting…",
    processing: "Processing…",
    close: "Close",
    crops: { wheat: "Wheat", rice: "Rice", cotton: "Cotton" },
  },
  languagePicker: {
    heading: "Choose your language",
    subheading: "You can change this anytime from the header.",
    continueLabel: "Continue",
  },
  languageSwitcher: { label: "Language" },
  home: {
    navLogIn: "Log in",
    navGetStarted: "Get started",
    kicker: "Blockchain-Backed Supply Chain Traceability",
    heroTitle: "End-to-end verified custody, from farm to settlement.",
    heroSubtitle:
      "Replace the chain of middlemen with a chain of blocks. Every batch, weight, and payment — written once, readable by anyone.",
    ctaRegister: "Register a batch",
    ctaSample: "View a sample record →",
    stats: [
      { value: "34/34", label: "Contract tests passing" },
      { value: "6", label: "Smart contracts, fully audited logic" },
      { value: "<200ms", label: "Page reads, cached off-chain" },
      { value: "$0", label: "Infrastructure cost to run" },
    ],
    guaranteesKicker: "Platform Guarantees",
    guaranteesTitle: "Enforced by contract, not policy.",
    promises: [
      {
        title: "Weight can't be faked",
        body: "The weighbridge signs its own reading. The server never holds that key.",
      },
      {
        title: "Price can't be argued",
        body: "Price locks on-chain the moment a buyer commits. Nobody can move it after.",
      },
      {
        title: "Payment can't be delayed",
        body: "A verified weight reading releases payment automatically. No manual step.",
      },
    ],
    processKicker: "The Process",
    processTitle: "Five steps, every one of them on-chain.",
    steps: [
      { title: "Register", body: "Producer logs crop, quantity, and location on-chain." },
      { title: "Escrow", body: "Buyer locks payment at a price frozen for this batch only." },
      { title: "Transit", body: "Logistics confirms pickup, then delivery to the buyer." },
      { title: "Weigh-In", body: "The weighbridge signs the actual delivered weight." },
      { title: "Settle", body: "Contract releases payment automatically — no manual step." },
    ],
    honestKicker: "What This Doesn't Claim",
    honestItems: [
      {
        strong: "Un-forgeable, not fraud-proof.",
        rest: " A tampered device can still misreport — a hardware problem, not a contract one.",
      },
      {
        strong: "One trusted price feed.",
        rest: " A decentralized oracle is the production path, not what's running today.",
      },
      {
        strong: "Producer wallets are custodial.",
        rest: " A tradeoff for a low-connectivity audience, not free.",
      },
      {
        strong: "AGRI is a settlement token.",
        rest: " Real currency settlement is planned, not live today.",
      },
    ],
    footer: "AgriChain · Polygon network · Built for verifiable agricultural trade",
  },
  auth: {
    brand: "AgriChain",
    loginSubtitle: "Sign in to your account",
    newHere: "New here?",
    createAccount: "Create an account",
    registerSubtitle: "Create an account",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in",
    phoneLabel: "Phone",
    phonePlaceholder: "98765 43210",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Ramesh Kumar",
    phoneHint: "Wallet is linked to this number — no seed phrase needed.",
    buyerConnectHint: "Connect your wallet to browse verified batches and open escrow.",
    logisticsConnectHint: "Connect your wallet to manage pickups and weighbridge confirmations.",
    logInButton: "Log In",
    signingIn: "Signing in…",
    registerButton: "Register",
    registering: "Registering…",
  },
  roleTabs: { farmer: "Farmer", buyer: "Buyer", logistics: "Logistics" },
  header: { platformTag: "Supply Chain Platform" },
  farmerPage: {
    heading: "Your Batches",
    subheading: "Your registered crop batches",
    balanceLabel: "Balance",
    registerPanelTitle: "Register New Batch",
    historyPanelTitle: "Batch History",
    historyEmpty: "No batches registered yet.",
    colId: "ID",
    colCrop: "Crop",
    colQuantity: "Quantity",
    colJourney: "Journey",
    colQr: "QR",
  },
  buyerPage: {
    heading: "Verified Batches",
    subheading: "Verified batches available for procurement",
    availablePanelTitle: "Available Now",
    availableEmpty: "No batches available right now.",
    noPriceSet: "no price set for this crop yet",
    historyPanelTitle: "Your Settlement History",
    historyEmpty: "No escrows opened yet.",
    colBatch: "Batch",
    colDeposit: "Deposit",
    colJourney: "Journey",
  },
  logisticsPage: {
    heading: "Pickup Queue",
    subheading: "Active shipments requiring action",
    settledLabel: "settled",
    penaltyLabel: "penalty",
    activePanelTitle: "Active Batches",
    activeEmpty: "No pickups pending.",
    kgRegistered: "kg registered",
    kgVerified: "kg verified",
    farmerPaidSuffix: "AGRI",
  },
  batchRegisterForm: {
    cropLabel: "Crop",
    quantityLabel: "Quantity (kg)",
    quantityPlaceholder: "1000",
    locationLabel: "Collection Location",
    locationHint: "Any text works for this deployment (geohash).",
    photoLabel: "Photo",
    submit: "Register Batch",
    submitting: "Registering…",
  },
  logisticsActions: {
    confirmPickup: "Confirm Pickup",
    confirmDelivery: "Confirm Delivery",
    verifyWeight: "Verify Weight",
    submit: "Submit",
    releasePayment: "Release Payment",
    processing: "Processing…",
    stepConfirmingPickup: "Confirming pickup",
    stepConfirmingDelivery: "Confirming delivery",
    stepReleasingPayment: "Releasing payment",
    stepCheckDevice: "Check assigned device",
    stepAssignDevice: "Assign weighbridge device",
    stepDeviceAssigned: "Device already assigned",
    stepSubmitReading: "Submit signed reading",
    actualWeightLabel: "Actual weight (kg)",
  },
  openEscrow: {
    open: "Open Escrow",
    processing: "Processing…",
    stepConnect: "Connect wallet",
    stepPrice: "Read live price",
    stepApprove: "Approve payment",
    stepOpen: "Open escrow",
  },
  withdraw: { action: "Withdraw" },
  pipeline: {
    registered: "Registered",
    escrowed: "Escrowed",
    inTransit: "In Transit",
    delivered: "Delivered",
    weighed: "Weighed",
    settled: "Settled",
  },
  status: {
    registered: "Registered",
    inTransit: "In Transit",
    awaitingWeighIn: "Awaiting Weigh-In",
    settled: "Settled",
    disputed: "Disputed",
    refunded: "Refunded",
  },
  analytics: {
    panelTitle: "Platform Analytics",
    totalBatches: "Total Batches",
    totalVolume: "Total Volume",
    activeEscrows: "Active Escrows",
    settled: "Settled",
    totalSettledValue: "Total Settled Value",
    penaltyRate: "Penalty Rate",
    volumeByCrop: "Volume by Crop",
    noBatches: "No batches registered yet.",
    pipelineFunnel: "Pipeline Funnel — All Batches",
  },
  activityFeed: {
    defaultTitle: "Activity Timeline",
    live: "live",
    updatesEvery: "updates every 4s",
    noActivity: "No activity in this category yet.",
    proof: "proof ↗",
    filters: {
      all: "All",
      registration: "Registration",
      pricing: "Pricing",
      logistics: "Logistics",
      weighbridge: "Weighbridge",
      settlement: "Settlement",
      dispute: "Dispute",
    },
    justNow: "just now",
    secondsAgo: (n) => `${n}s ago`,
    minutesAgo: (n) => `${n}m ago`,
    hoursAgo: (n) => `${n}h ago`,
    statusLabels: { registered: "Registered", inTransit: "In Transit", delivered: "Delivered", settled: "Settled" },
    events: {
      batchRegistered: (id, kg, crop) => `Batch #${id} registered — ${kg} kg of ${crop}`,
      batchMoved: (id, from, to) => `Batch #${id} moved from ${from} to ${to}`,
      priceSet: (crop, price) => `Price set for ${crop}: ₹${price}/kg`,
      priceJumpFlagged: (crop) => `Price jump flagged for ${crop} — moved more than 20% in one update`,
      deviceAssigned: (id) => `Weighbridge device assigned to batch #${id}`,
      weightVerified: (id, kg) => `Weight verified for batch #${id}: ${kg} kg, device-signed`,
      escrowOpened: (id, amount) => `Escrow opened on batch #${id} — ${amount} AGRI locked`,
      escrowSettled: (id, amount) => `Batch #${id} settled — farmer paid ${amount} AGRI`,
      penaltyApplied: (id, pct) => `Weight deviation penalty on batch #${id} — ${pct}%`,
      escrowRefunded: (id, amount) => `Batch #${id} escrow timed out — buyer refunded ${amount} AGRI`,
      disputeFlagged: (id) => `Batch #${id} escrow disputed — release paused`,
      disputeResolved: (id) => `Batch #${id} dispute resolved`,
      withdrawn: (amount, account) => `${amount} AGRI withdrawn to ${account}…`,
    },
  },
  verifyPage: {
    publicRecordTag: "Public Batch Record",
    whereRightNow: "Where This Batch Is Right Now",
    batchPrefix: "Batch #",
    crop: "Crop",
    registeredQuantity: "Registered Quantity",
    status: "Status",
    weighbridgeVerified: "Weighbridge Verified",
    lockedPrice: "Locked Price",
    farmerPaid: "Farmer Paid",
    deviationWarning: (pct) =>
      `Delivered weight deviated ${pct}% from registered quantity — logistics penalty applied, farmer paid for verified weight only.`,
    priceSource: "Price source:",
    fullStoryTitle: "This Batch's Full Story, In Order",
    viewFarmerWallet: "View farmer wallet on explorer ↗",
    cacheDisclaimer:
      "Reads shown here are cached for speed. This deployment doesn't yet run a live on-chain cross-check on every page load — planned as a future integrity feature.",
  },
  batchQr: {
    clickToEnlarge: "Click to enlarge",
    scanHint: "Scan to open the public verification record for this batch.",
    close: "Close",
  },
};

const hi: Dictionary = {
  common: {
    logIn: "लॉग इन करें",
    getStarted: "शुरू करें",
    logOut: "लॉग आउट",
    connectWallet: "वॉलेट जोड़ें",
    connecting: "जोड़ रहे हैं…",
    processing: "प्रोसेस हो रहा है…",
    close: "बंद करें",
    crops: { wheat: "गेहूं", rice: "चावल", cotton: "कपास" },
  },
  languagePicker: {
    heading: "अपनी भाषा चुनें",
    subheading: "आप इसे बाद में भी हेडर से बदल सकते हैं।",
    continueLabel: "जारी रखें",
  },
  languageSwitcher: { label: "भाषा" },
  home: {
    navLogIn: "लॉग इन करें",
    navGetStarted: "शुरू करें",
    kicker: "ब्लॉकचेन-आधारित सप्लाई चेन ट्रेसेबिलिटी",
    heroTitle: "खेत से भुगतान तक, हर कदम प्रमाणित।",
    heroSubtitle:
      "बिचौलियों की कड़ी को ब्लॉक की कड़ी से बदलें। हर बैच, हर वज़न, हर भुगतान — एक बार दर्ज, हर कोई देख सकता है।",
    ctaRegister: "बैच दर्ज करें",
    ctaSample: "एक नमूना रिकॉर्ड देखें →",
    stats: [
      { value: "34/34", label: "कॉन्ट्रैक्ट टेस्ट पास" },
      { value: "6", label: "स्मार्ट कॉन्ट्रैक्ट, पूरी तरह ऑडिट किए गए" },
      { value: "<200ms", label: "पेज लोड, ऑफ-चेन कैश से" },
      { value: "$0", label: "चलाने की इन्फ्रास्ट्रक्चर लागत" },
    ],
    guaranteesKicker: "प्लेटफ़ॉर्म की गारंटी",
    guaranteesTitle: "नियम से नहीं, कॉन्ट्रैक्ट से लागू।",
    promises: [
      {
        title: "वज़न में धोखा नहीं",
        body: "वेब्रिज खुद अपनी रीडिंग साइन करता है। सर्वर के पास वह चाबी कभी नहीं होती।",
      },
      {
        title: "दाम पर बहस नहीं",
        body: "खरीदार के कमिट करते ही दाम चेन पर लॉक हो जाता है। बाद में कोई इसे बदल नहीं सकता।",
      },
      {
        title: "भुगतान में देरी नहीं",
        body: "प्रमाणित वज़न रीडिंग मिलते ही भुगतान अपने आप हो जाता है। कोई मैनुअल कदम नहीं।",
      },
    ],
    processKicker: "प्रक्रिया",
    processTitle: "पांच चरण, हर एक चेन पर दर्ज।",
    steps: [
      { title: "पंजीकरण", body: "किसान फसल, मात्रा और स्थान चेन पर दर्ज करता है।" },
      { title: "एस्क्रो", body: "खरीदार इसी बैच के लिए तय दाम पर भुगतान लॉक करता है।" },
      { title: "परिवहन", body: "लॉजिस्टिक्स पिकअप और फिर खरीदार तक डिलीवरी की पुष्टि करता है।" },
      { title: "वज़न जांच", body: "वेब्रिज असली डिलीवर किए गए वज़न पर साइन करता है।" },
      { title: "निपटान", body: "कॉन्ट्रैक्ट अपने आप भुगतान जारी करता है — कोई मैनुअल कदम नहीं।" },
    ],
    honestKicker: "यह क्या दावा नहीं करता",
    honestItems: [
      {
        strong: "जालसाजी-रोधी, पर धोखे से पूरी तरह मुक्त नहीं।",
        rest: " छेड़छाड़ किया गया डिवाइस फिर भी गलत रीडिंग दे सकता है — यह हार्डवेयर की समस्या है, कॉन्ट्रैक्ट की नहीं।",
      },
      {
        strong: "फ़िलहाल एक ही भरोसेमंद प्राइस फ़ीड।",
        rest: " विकेंद्रीकृत ऑरेकल आगे का रास्ता है, आज जो चल रहा है वह नहीं।",
      },
      {
        strong: "किसान के वॉलेट कस्टोडियल हैं।",
        rest: " कम कनेक्टिविटी वाले उपयोगकर्ताओं के लिए यह एक सोचा-समझा समझौता है, मुफ़्त नहीं।",
      },
      {
        strong: "AGRI एक सेटलमेंट टोकन है।",
        rest: " असली मुद्रा में भुगतान की योजना है, आज वह लाइव नहीं है।",
      },
    ],
    footer: "AgriChain · Polygon नेटवर्क · सत्यापित कृषि व्यापार के लिए बनाया गया",
  },
  auth: {
    brand: "AgriChain",
    loginSubtitle: "अपने खाते में साइन इन करें",
    newHere: "यहां नए हैं?",
    createAccount: "खाता बनाएं",
    registerSubtitle: "खाता बनाएं",
    alreadyHaveAccount: "पहले से खाता है?",
    signIn: "साइन इन करें",
    phoneLabel: "फ़ोन नंबर",
    phonePlaceholder: "98765 43210",
    fullNameLabel: "पूरा नाम",
    fullNamePlaceholder: "रमेश कुमार",
    phoneHint: "वॉलेट इसी नंबर से जुड़ा है — सीड फ़्रेज़ की ज़रूरत नहीं।",
    buyerConnectHint: "सत्यापित बैच देखने और एस्क्रो खोलने के लिए अपना वॉलेट जोड़ें।",
    logisticsConnectHint: "पिकअप और वेब्रिज पुष्टि प्रबंधित करने के लिए अपना वॉलेट जोड़ें।",
    logInButton: "लॉग इन करें",
    signingIn: "साइन इन हो रहा है…",
    registerButton: "पंजीकरण करें",
    registering: "पंजीकरण हो रहा है…",
  },
  roleTabs: { farmer: "किसान", buyer: "खरीदार", logistics: "परिवहन" },
  header: { platformTag: "सप्लाई चेन प्लेटफ़ॉर्म" },
  farmerPage: {
    heading: "आपके बैच",
    subheading: "आपके दर्ज किए गए फसल बैच",
    balanceLabel: "बैलेंस",
    registerPanelTitle: "नया बैच दर्ज करें",
    historyPanelTitle: "बैच इतिहास",
    historyEmpty: "अभी तक कोई बैच दर्ज नहीं हुआ।",
    colId: "ID",
    colCrop: "फसल",
    colQuantity: "मात्रा",
    colJourney: "यात्रा",
    colQr: "QR",
  },
  buyerPage: {
    heading: "सत्यापित बैच",
    subheading: "खरीद के लिए उपलब्ध सत्यापित बैच",
    availablePanelTitle: "अभी उपलब्ध",
    availableEmpty: "अभी कोई बैच उपलब्ध नहीं है।",
    noPriceSet: "इस फसल के लिए अभी दाम तय नहीं हुआ",
    historyPanelTitle: "आपका निपटान इतिहास",
    historyEmpty: "अभी तक कोई एस्क्रो नहीं खोला गया।",
    colBatch: "बैच",
    colDeposit: "जमा",
    colJourney: "यात्रा",
  },
  logisticsPage: {
    heading: "पिकअप सूची",
    subheading: "कार्रवाई की प्रतीक्षा में सक्रिय शिपमेंट",
    settledLabel: "निपटाए गए",
    penaltyLabel: "जुर्माना",
    activePanelTitle: "सक्रिय बैच",
    activeEmpty: "कोई पिकअप लंबित नहीं है।",
    kgRegistered: "kg दर्ज",
    kgVerified: "kg सत्यापित",
    farmerPaidSuffix: "AGRI",
  },
  batchRegisterForm: {
    cropLabel: "फसल",
    quantityLabel: "मात्रा (kg)",
    quantityPlaceholder: "1000",
    locationLabel: "संग्रह स्थान",
    locationHint: "इस डेमो के लिए कोई भी टेक्स्ट चलेगा (geohash)।",
    photoLabel: "फ़ोटो",
    submit: "बैच दर्ज करें",
    submitting: "दर्ज हो रहा है…",
  },
  logisticsActions: {
    confirmPickup: "पिकअप की पुष्टि करें",
    confirmDelivery: "डिलीवरी की पुष्टि करें",
    verifyWeight: "वज़न सत्यापित करें",
    submit: "जमा करें",
    releasePayment: "भुगतान जारी करें",
    processing: "प्रोसेस हो रहा है…",
    stepConfirmingPickup: "पिकअप की पुष्टि हो रही है",
    stepConfirmingDelivery: "डिलीवरी की पुष्टि हो रही है",
    stepReleasingPayment: "भुगतान जारी हो रहा है",
    stepCheckDevice: "जुड़ा हुआ डिवाइस जांचा जा रहा है",
    stepAssignDevice: "वेब्रिज डिवाइस असाइन हो रहा है",
    stepDeviceAssigned: "डिवाइस पहले से असाइन है",
    stepSubmitReading: "साइन की गई रीडिंग जमा हो रही है",
    actualWeightLabel: "असली वज़न (kg)",
  },
  openEscrow: {
    open: "एस्क्रो खोलें",
    processing: "प्रोसेस हो रहा है…",
    stepConnect: "वॉलेट जोड़ें",
    stepPrice: "लाइव दाम पढ़ें",
    stepApprove: "भुगतान स्वीकृत करें",
    stepOpen: "एस्क्रो खोलें",
  },
  withdraw: { action: "निकासी करें" },
  pipeline: {
    registered: "दर्ज",
    escrowed: "दाम लॉक",
    inTransit: "पिकअप हो गया",
    delivered: "पहुंच गया",
    weighed: "वज़न सत्यापित",
    settled: "भुगतान हो गया",
  },
  status: {
    registered: "दर्ज",
    inTransit: "पिकअप हो गया",
    awaitingWeighIn: "वज़न जांच बाकी",
    settled: "निपटाया गया",
    disputed: "विवादित",
    refunded: "वापस किया गया",
  },
  analytics: {
    panelTitle: "प्लेटफ़ॉर्म आंकड़े",
    totalBatches: "कुल बैच",
    totalVolume: "कुल मात्रा",
    activeEscrows: "सक्रिय एस्क्रो",
    settled: "निपटाए गए",
    totalSettledValue: "कुल निपटान मूल्य",
    penaltyRate: "जुर्माना दर",
    volumeByCrop: "फसल अनुसार मात्रा",
    noBatches: "अभी तक कोई बैच दर्ज नहीं हुआ।",
    pipelineFunnel: "पाइपलाइन फ़नल — सभी बैच",
  },
  activityFeed: {
    defaultTitle: "गतिविधि समयरेखा",
    live: "लाइव",
    updatesEvery: "हर 4 सेकंड में अपडेट",
    noActivity: "इस श्रेणी में अभी कोई गतिविधि नहीं है।",
    proof: "प्रमाण ↗",
    filters: {
      all: "सभी",
      registration: "पंजीकरण",
      pricing: "मूल्य निर्धारण",
      logistics: "परिवहन",
      weighbridge: "वेब्रिज",
      settlement: "निपटान",
      dispute: "विवाद",
    },
    justNow: "अभी-अभी",
    secondsAgo: (n) => `${n} सेकंड पहले`,
    minutesAgo: (n) => `${n} मिनट पहले`,
    hoursAgo: (n) => `${n} घंटे पहले`,
    statusLabels: { registered: "दर्ज", inTransit: "पिकअप हो गया", delivered: "पहुंच गया", settled: "निपटाया गया" },
    events: {
      batchRegistered: (id, kg, crop) => `बैच #${id} दर्ज हुआ — ${crop} की ${kg} kg`,
      batchMoved: (id, from, to) => `बैच #${id} की स्थिति ${from} से बदलकर ${to} हुई`,
      priceSet: (crop, price) => `${crop} का दाम तय हुआ: ₹${price}/kg`,
      priceJumpFlagged: (crop) => `${crop} में दाम में उछाल — एक ही अपडेट में 20% से ज़्यादा बदलाव फ़्लैग हुआ`,
      deviceAssigned: (id) => `बैच #${id} को वेब्रिज डिवाइस असाइन हुआ`,
      weightVerified: (id, kg) => `बैच #${id} का वज़न सत्यापित हुआ: ${kg} kg, डिवाइस-साइन्ड`,
      escrowOpened: (id, amount) => `बैच #${id} पर एस्क्रो खुला — ${amount} AGRI लॉक हुआ`,
      escrowSettled: (id, amount) => `बैच #${id} का निपटान हुआ — किसान को ${amount} AGRI मिला`,
      penaltyApplied: (id, pct) => `बैच #${id} पर वज़न अंतर का जुर्माना — ${pct}%`,
      escrowRefunded: (id, amount) => `बैच #${id} का एस्क्रो समय पूरा होने पर बंद हुआ — खरीदार को ${amount} AGRI वापस मिला`,
      disputeFlagged: (id) => `बैच #${id} का एस्क्रो विवादित — भुगतान रोका गया`,
      disputeResolved: (id) => `बैच #${id} का विवाद सुलझा`,
      withdrawn: (amount, account) => `${amount} AGRI ${account}… को निकाला गया`,
    },
  },
  verifyPage: {
    publicRecordTag: "सार्वजनिक बैच रिकॉर्ड",
    whereRightNow: "यह बैच अभी कहां है",
    batchPrefix: "बैच #",
    crop: "फसल",
    registeredQuantity: "दर्ज मात्रा",
    status: "स्थिति",
    weighbridgeVerified: "वेब्रिज सत्यापित",
    lockedPrice: "लॉक किया गया दाम",
    farmerPaid: "किसान को भुगतान",
    deviationWarning: (pct) =>
      `दर्ज मात्रा से डिलीवर किए गए वज़न में ${pct}% का अंतर — लॉजिस्टिक्स पर जुर्माना लगाया गया, किसान को केवल सत्यापित वज़न का भुगतान हुआ।`,
    priceSource: "दाम का स्रोत:",
    fullStoryTitle: "इस बैच की पूरी कहानी, क्रम में",
    viewFarmerWallet: "एक्सप्लोरर पर किसान का वॉलेट देखें ↗",
    cacheDisclaimer:
      "यहां दिखाई गई जानकारी तेज़ी के लिए कैश की गई है। यह डिप्लॉयमेंट अभी हर पेज लोड पर लाइव ऑन-चेन क्रॉस-चेक नहीं करता — यह आगे जोड़ा जाने वाला फ़ीचर है।",
  },
  batchQr: {
    clickToEnlarge: "बड़ा करने के लिए क्लिक करें",
    scanHint: "इस बैच के सार्वजनिक सत्यापन रिकॉर्ड को खोलने के लिए स्कैन करें।",
    close: "बंद करें",
  },
};

const ta: Dictionary = {
  common: {
    logIn: "உள்நுழையவும்",
    getStarted: "தொடங்குங்கள்",
    logOut: "வெளியேறு",
    connectWallet: "வாலட்டை இணைக்கவும்",
    connecting: "இணைக்கிறது…",
    processing: "செயல்படுத்துகிறது…",
    close: "மூடு",
    crops: { wheat: "கோதுமை", rice: "அரிசி", cotton: "பருத்தி" },
  },
  languagePicker: {
    heading: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    subheading: "இதை நீங்கள் பின்னரும் ஹெடரில் இருந்து மாற்றலாம்.",
    continueLabel: "தொடரவும்",
  },
  languageSwitcher: { label: "மொழி" },
  home: {
    navLogIn: "உள்நுழையவும்",
    navGetStarted: "தொடங்குங்கள்",
    kicker: "பிளாக்செயின் அடிப்படையிலான விநியோகச் சங்கிலி கண்காணிப்பு",
    heroTitle: "பண்ணையிலிருந்து பணம் செலுத்தும் வரை, முழுவதும் சரிபார்க்கப்பட்டது.",
    heroSubtitle:
      "இடைத்தரகர் சங்கிலியை பிளாக் சங்கிலியால் மாற்றுங்கள். ஒவ்வொரு பேட்ச், எடை, பணம் செலுத்துதல் — ஒருமுறை பதிவு செய்யப்பட்டு, யாரும் படிக்கக்கூடியது.",
    ctaRegister: "பேட்ச் பதிவு செய்யவும்",
    ctaSample: "மாதிரி பதிவைப் பார்க்கவும் →",
    stats: [
      { value: "34/34", label: "ஒப்பந்த சோதனைகள் தேர்ச்சி" },
      { value: "6", label: "ஸ்மார்ட் ஒப்பந்தங்கள், முழுமையாக தணிக்கை செய்யப்பட்டவை" },
      { value: "<200ms", label: "பேஜ் ரீட், ஆஃப்-செயினில் கேச் செய்யப்பட்டது" },
      { value: "$0", label: "இயக்குவதற்கான உள்கட்டமைப்பு செலவு" },
    ],
    guaranteesKicker: "தளத்தின் உத்தரவாதங்கள்",
    guaranteesTitle: "கொள்கையால் அல்ல, ஒப்பந்தத்தால் அமல்படுத்தப்படுகிறது.",
    promises: [
      {
        title: "எடையை ஏமாற்ற முடியாது",
        body: "எடைப்பாலம் தன் சொந்த வாசிப்பில் கையொப்பமிடுகிறது. சர்வர் அந்த சாவியை ஒருபோதும் வைத்திருக்காது.",
      },
      {
        title: "விலையில் வாதம் இல்லை",
        body: "வாங்குபவர் உறுதிசெய்த உடனேயே விலை செயினில் பூட்டப்படுகிறது. பின்னர் யாராலும் அதை மாற்ற முடியாது.",
      },
      {
        title: "பணம் செலுத்துதல் தாமதிக்காது",
        body: "சரிபார்க்கப்பட்ட எடை வாசிப்பு பணம் செலுத்துதலை தானாகவே வெளியிடுகிறது. கைமுறை படி இல்லை.",
      },
    ],
    processKicker: "செயல்முறை",
    processTitle: "ஐந்து படிகள், ஒவ்வொன்றும் செயினில்.",
    steps: [
      { title: "பதிவு", body: "விவசாயி பயிர், அளவு, இடத்தை செயினில் பதிவு செய்கிறார்." },
      { title: "எஸ்க்ரோ", body: "வாங்குபவர் இந்த பேட்சுக்கு மட்டும் நிர்ணயிக்கப்பட்ட விலையில் பணத்தை பூட்டுகிறார்." },
      { title: "போக்குவரத்து", body: "லாஜிஸ்டிக்ஸ் எடுப்பு, பின்னர் வாங்குபவருக்கு டெலிவரியை உறுதிப்படுத்துகிறது." },
      { title: "எடை சரிபார்ப்பு", body: "எடைப்பாலம் உண்மையில் வழங்கப்பட்ட எடையில் கையொப்பமிடுகிறது." },
      { title: "தீர்வு", body: "ஒப்பந்தம் தானாகவே பணத்தை வெளியிடுகிறது — கைமுறை படி இல்லை." },
    ],
    honestKicker: "இது எதை உறுதிப்படுத்தவில்லை",
    honestItems: [
      {
        strong: "பொய்யாக்க முடியாதது, ஆனால் மோசடியிலிருந்து முழுமையாக பாதுகாக்கப்படவில்லை.",
        rest: " கையாளப்பட்ட சாதனம் இன்னும் தவறாக தெரிவிக்க முடியும் — இது ஒரு வன்பொருள் பிரச்சனை, ஒப்பந்த பிரச்சனை அல்ல.",
      },
      {
        strong: "தற்போது ஒரே நம்பகமான விலை ஊட்டம்.",
        rest: " பரவலாக்கப்பட்ட ஆரக்கிள் என்பது எதிர்கால திட்டம், இன்று இயங்குவது அல்ல.",
      },
      {
        strong: "விவசாயியின் வாலட் காப்பகமாக்கப்பட்டுள்ளது.",
        rest: " குறைந்த இணைப்புள்ள பயனர்களுக்கான ஒரு நோக்கமான சமரசம், இலவசம் அல்ல.",
      },
      {
        strong: "AGRI ஒரு தீர்வு டோக்கன்.",
        rest: " உண்மையான நாணய தீர்வு திட்டமிடப்பட்டுள்ளது, இன்று செயலில் இல்லை.",
      },
    ],
    footer: "AgriChain · Polygon நெட்வொர்க் · சரிபார்க்கக்கூடிய விவசாய வர்த்தகத்திற்காக உருவாக்கப்பட்டது",
  },
  auth: {
    brand: "AgriChain",
    loginSubtitle: "உங்கள் கணக்கில் உள்நுழையவும்",
    newHere: "புதியவரா?",
    createAccount: "கணக்கு உருவாக்கவும்",
    registerSubtitle: "கணக்கு உருவாக்கவும்",
    alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    signIn: "உள்நுழையவும்",
    phoneLabel: "தொலைபேசி எண்",
    phonePlaceholder: "98765 43210",
    fullNameLabel: "முழு பெயர்",
    fullNamePlaceholder: "ரமேஷ் குமார்",
    phoneHint: "வாலட் இந்த எண்ணுடன் இணைக்கப்பட்டுள்ளது — சீட் ஃப்ரேஸ் தேவையில்லை.",
    buyerConnectHint: "சரிபார்க்கப்பட்ட பேட்சுகளைப் பார்க்கவும், எஸ்க்ரோ திறக்கவும் உங்கள் வாலட்டை இணைக்கவும்.",
    logisticsConnectHint: "எடுப்பு மற்றும் எடைப்பாலம் உறுதிப்படுத்தல்களை நிர்வகிக்க உங்கள் வாலட்டை இணைக்கவும்.",
    logInButton: "உள்நுழையவும்",
    signingIn: "உள்நுழைகிறது…",
    registerButton: "பதிவு செய்யவும்",
    registering: "பதிவு செய்கிறது…",
  },
  roleTabs: { farmer: "விவசாயி", buyer: "வாங்குபவர்", logistics: "போக்குவரத்து" },
  header: { platformTag: "விநியோகச் சங்கிலி தளம்" },
  farmerPage: {
    heading: "உங்கள் பேட்சுகள்",
    subheading: "நீங்கள் பதிவு செய்த பயிர் பேட்சுகள்",
    balanceLabel: "இருப்பு",
    registerPanelTitle: "புதிய பேட்ச் பதிவு செய்யவும்",
    historyPanelTitle: "பேட்ச் வரலாறு",
    historyEmpty: "இதுவரை பேட்சுகள் எதுவும் பதிவு செய்யப்படவில்லை.",
    colId: "ID",
    colCrop: "பயிர்",
    colQuantity: "அளவு",
    colJourney: "பயணம்",
    colQr: "QR",
  },
  buyerPage: {
    heading: "சரிபார்க்கப்பட்ட பேட்சுகள்",
    subheading: "கொள்முதலுக்கு கிடைக்கும் சரிபார்க்கப்பட்ட பேட்சுகள்",
    availablePanelTitle: "இப்போது கிடைக்கும்",
    availableEmpty: "இப்போது எந்த பேட்சும் கிடைக்கவில்லை.",
    noPriceSet: "இந்த பயிருக்கு இன்னும் விலை நிர்ணயிக்கப்படவில்லை",
    historyPanelTitle: "உங்கள் தீர்வு வரலாறு",
    historyEmpty: "இதுவரை எஸ்க்ரோ எதுவும் திறக்கப்படவில்லை.",
    colBatch: "பேட்ச்",
    colDeposit: "வைப்பு",
    colJourney: "பயணம்",
  },
  logisticsPage: {
    heading: "எடுப்பு வரிசை",
    subheading: "நடவடிக்கை தேவைப்படும் செயலில் உள்ள அனுப்புகைகள்",
    settledLabel: "தீர்க்கப்பட்டவை",
    penaltyLabel: "அபராதம்",
    activePanelTitle: "செயலில் உள்ள பேட்சுகள்",
    activeEmpty: "எந்த எடுப்பும் நிலுவையில் இல்லை.",
    kgRegistered: "kg பதிவு செய்யப்பட்டது",
    kgVerified: "kg சரிபார்க்கப்பட்டது",
    farmerPaidSuffix: "AGRI",
  },
  batchRegisterForm: {
    cropLabel: "பயிர்",
    quantityLabel: "அளவு (kg)",
    quantityPlaceholder: "1000",
    locationLabel: "சேகரிப்பு இடம்",
    locationHint: "இந்த டெமோவிற்கு எந்த உரையும் செயல்படும் (geohash).",
    photoLabel: "புகைப்படம்",
    submit: "பேட்ச் பதிவு செய்யவும்",
    submitting: "பதிவு செய்கிறது…",
  },
  logisticsActions: {
    confirmPickup: "எடுப்பை உறுதிப்படுத்தவும்",
    confirmDelivery: "டெலிவரியை உறுதிப்படுத்தவும்",
    verifyWeight: "எடையை சரிபார்க்கவும்",
    submit: "சமர்ப்பிக்கவும்",
    releasePayment: "பணத்தை வெளியிடவும்",
    processing: "செயல்படுத்துகிறது…",
    stepConfirmingPickup: "எடுப்பு உறுதிப்படுத்தப்படுகிறது",
    stepConfirmingDelivery: "டெலிவரி உறுதிப்படுத்தப்படுகிறது",
    stepReleasingPayment: "பணம் வெளியிடப்படுகிறது",
    stepCheckDevice: "ஒதுக்கப்பட்ட சாதனத்தை சரிபார்க்கிறது",
    stepAssignDevice: "எடைப்பாலம் சாதனத்தை ஒதுக்குகிறது",
    stepDeviceAssigned: "சாதனம் ஏற்கனவே ஒதுக்கப்பட்டது",
    stepSubmitReading: "கையொப்பமிடப்பட்ட வாசிப்பு சமர்ப்பிக்கப்படுகிறது",
    actualWeightLabel: "உண்மையான எடை (kg)",
  },
  openEscrow: {
    open: "எஸ்க்ரோ திறக்கவும்",
    processing: "செயல்படுத்துகிறது…",
    stepConnect: "வாலட்டை இணைக்கவும்",
    stepPrice: "நேரடி விலையைப் படிக்கவும்",
    stepApprove: "பணம் செலுத்துதலை அங்கீகரிக்கவும்",
    stepOpen: "எஸ்க்ரோ திறக்கவும்",
  },
  withdraw: { action: "திரும்பப் பெறவும்" },
  pipeline: {
    registered: "பதிவு செய்யப்பட்டது",
    escrowed: "விலை பூட்டப்பட்டது",
    inTransit: "எடுக்கப்பட்டது",
    delivered: "வழங்கப்பட்டது",
    weighed: "எடை சரிபார்க்கப்பட்டது",
    settled: "தீர்க்கப்பட்டது",
  },
  status: {
    registered: "பதிவு செய்யப்பட்டது",
    inTransit: "எடுக்கப்பட்டது",
    awaitingWeighIn: "எடை சரிபார்ப்பு நிலுவையில்",
    settled: "தீர்க்கப்பட்டது",
    disputed: "தகராறு",
    refunded: "திரும்பச் செலுத்தப்பட்டது",
  },
  analytics: {
    panelTitle: "தள பகுப்பாய்வு",
    totalBatches: "மொத்த பேட்சுகள்",
    totalVolume: "மொத்த அளவு",
    activeEscrows: "செயலில் உள்ள எஸ்க்ரோக்கள்",
    settled: "தீர்க்கப்பட்டவை",
    totalSettledValue: "மொத்த தீர்வு மதிப்பு",
    penaltyRate: "அபராத விகிதம்",
    volumeByCrop: "பயிர் வாரியான அளவு",
    noBatches: "இதுவரை பேட்சுகள் எதுவும் பதிவு செய்யப்படவில்லை.",
    pipelineFunnel: "பைப்லைன் ஃபனல் — அனைத்து பேட்சுகள்",
  },
  activityFeed: {
    defaultTitle: "செயல்பாட்டு காலவரிசை",
    live: "நேரலை",
    updatesEvery: "ஒவ்வொரு 4 வினாடிக்கும் புதுப்பிக்கும்",
    noActivity: "இந்த வகையில் இதுவரை செயல்பாடு இல்லை.",
    proof: "சான்று ↗",
    filters: {
      all: "அனைத்தும்",
      registration: "பதிவு",
      pricing: "விலை நிர்ணயம்",
      logistics: "போக்குவரத்து",
      weighbridge: "எடைப்பாலம்",
      settlement: "தீர்வு",
      dispute: "தகராறு",
    },
    justNow: "இப்போதுதான்",
    secondsAgo: (n) => `${n} வினாடிகளுக்கு முன்`,
    minutesAgo: (n) => `${n} நிமிடங்களுக்கு முன்`,
    hoursAgo: (n) => `${n} மணி நேரத்திற்கு முன்`,
    statusLabels: {
      registered: "பதிவு செய்யப்பட்டது",
      inTransit: "எடுக்கப்பட்டது",
      delivered: "வழங்கப்பட்டது",
      settled: "தீர்க்கப்பட்டது",
    },
    events: {
      batchRegistered: (id, kg, crop) => `பேட்ச் #${id} பதிவு செய்யப்பட்டது — ${crop} ${kg} kg`,
      batchMoved: (id, from, to) => `பேட்ச் #${id} ${from} இலிருந்து ${to} க்கு மாறியது`,
      priceSet: (crop, price) => `${crop}க்கான விலை நிர்ணயிக்கப்பட்டது: ₹${price}/kg`,
      priceJumpFlagged: (crop) => `${crop}இல் விலை உயர்வு கண்டறியப்பட்டது — ஒரே புதுப்பிப்பில் 20%க்கும் அதிகமான மாற்றம்`,
      deviceAssigned: (id) => `பேட்ச் #${id}க்கு எடைப்பாலம் சாதனம் ஒதுக்கப்பட்டது`,
      weightVerified: (id, kg) => `பேட்ச் #${id}இன் எடை சரிபார்க்கப்பட்டது: ${kg} kg, சாதனத்தால் கையொப்பமிடப்பட்டது`,
      escrowOpened: (id, amount) => `பேட்ச் #${id}இல் எஸ்க்ரோ திறக்கப்பட்டது — ${amount} AGRI பூட்டப்பட்டது`,
      escrowSettled: (id, amount) => `பேட்ச் #${id} தீர்க்கப்பட்டது — விவசாயிக்கு ${amount} AGRI செலுத்தப்பட்டது`,
      penaltyApplied: (id, pct) => `பேட்ச் #${id}இல் எடை வேறுபாடு அபராதம் — ${pct}%`,
      escrowRefunded: (id, amount) => `பேட்ச் #${id}இன் எஸ்க்ரோ காலாவதியானது — வாங்குபவருக்கு ${amount} AGRI திரும்பச் செலுத்தப்பட்டது`,
      disputeFlagged: (id) => `பேட்ச் #${id}இன் எஸ்க்ரோ தகராறில் — வெளியீடு நிறுத்தப்பட்டது`,
      disputeResolved: (id) => `பேட்ச் #${id}இன் தகராறு தீர்க்கப்பட்டது`,
      withdrawn: (amount, account) => `${amount} AGRI ${account}… க்கு திரும்பப் பெறப்பட்டது`,
    },
  },
  verifyPage: {
    publicRecordTag: "பொது பேட்ச் பதிவு",
    whereRightNow: "இந்த பேட்ச் இப்போது எங்கே உள்ளது",
    batchPrefix: "பேட்ச் #",
    crop: "பயிர்",
    registeredQuantity: "பதிவு செய்யப்பட்ட அளவு",
    status: "நிலை",
    weighbridgeVerified: "எடைப்பாலம் சரிபார்த்தது",
    lockedPrice: "பூட்டப்பட்ட விலை",
    farmerPaid: "விவசாயிக்கு செலுத்தப்பட்டது",
    deviationWarning: (pct) =>
      `பதிவு செய்யப்பட்ட அளவிலிருந்து வழங்கப்பட்ட எடையில் ${pct}% வேறுபாடு — லாஜிஸ்டிக்ஸுக்கு அபராதம் விதிக்கப்பட்டது, விவசாயிக்கு சரிபார்க்கப்பட்ட எடைக்கு மட்டும் பணம் செலுத்தப்பட்டது.`,
    priceSource: "விலை மூலம்:",
    fullStoryTitle: "இந்த பேட்சின் முழு கதை, வரிசையில்",
    viewFarmerWallet: "எக்ஸ்ப்ளோரரில் விவசாயியின் வாலட்டைப் பார்க்கவும் ↗",
    cacheDisclaimer:
      "இங்கே காட்டப்படும் தரவு வேகத்திற்காக கேச் செய்யப்பட்டுள்ளது. இந்த டெப்ளாய்மென்ட் இன்னும் ஒவ்வொரு பேஜ் லோடிலும் நேரடி ஆன்-செயின் குறுக்கு சரிபார்ப்பை இயக்கவில்லை — இது எதிர்கால அம்சமாக திட்டமிடப்பட்டுள்ளது.",
  },
  batchQr: {
    clickToEnlarge: "பெரிதாக்க கிளிக் செய்யவும்",
    scanHint: "இந்த பேட்சின் பொது சரிபார்ப்பு பதிவைத் திறக்க ஸ்கேன் செய்யவும்.",
    close: "மூடு",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, hi, ta };

export function dict(locale: Locale): Dictionary {
  return dictionaries[locale];
}
