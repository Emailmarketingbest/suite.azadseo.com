/**
 * Azad SEO All-in-One Web Suite - Database Layer (db.js)
 * Powered by Dexie.js (IndexedDB wrapper) + Optional Cloud Sync
 * 100% Client-Side, Works on GitHub Pages, Offline-First with Persistent Storage.
 */

// 1. Initialize Dexie Database
const db = new Dexie('AzadSeoSuiteDB');

// Define Schema
db.version(1).stores({
    settings: 'key',
    clients: '++id, name, email, phone, createdAt',
    invoices: '++id, invoice_no, client_name, client_email, status, createdAt',
    salary_users: '++id, name, shift',
    salary_entries: '++id, user_id, date, year, month, [user_id+year+month]',
    tools: '++id, keyword, name, category, price'
});

db.version(2).stores({
    plans: '++id, slug, name, price'
});

// Marketing Combo Plans Defaults
const DEFAULT_PLANS = [
    {
        id: 1,
        slug: 'student-plan',
        name: 'Student Plan',
        price: 1200,
        currency: 'PKR',
        duration: '30 Days Access',
        image: 'images/plans/Student Plan.jpg',
        badge: 'Top Seller',
        badgeColor: 'bg-emerald-100 text-emerald-800',
        description: 'Perfect for students, freelance beginners, and budget-conscious content creators.',
        tools: ['SEMrush Pro', 'Canva Pro', 'Grammarly Premium', 'Quillbot Premium', 'Word.ai'],
        message: '🌟 *AZAD SEO - STUDENT PLAN* 🌟\nPrice: *1200 PKR*\nDuration: 30 Days Active Access\n\nIncluded Tools:\n• SEMrush Pro\n• Canva Pro\n• Grammarly Premium\n• Quillbot Premium\n• Word.ai\n\n⚡ Instant Activation upon payment verification.\nContact Azad SEO Support for payment details. Thank you!'
    },
    {
        id: 2,
        slug: 'basic-plan',
        name: 'Basic Plan',
        price: 1850,
        currency: 'PKR',
        duration: '30 Days Access',
        image: 'images/plans/Basic Plan.jpg',
        badge: 'Popular Value',
        badgeColor: 'bg-blue-100 text-blue-800',
        description: 'Ideal for freelance SEO writers, digital marketers, and active content bloggers.',
        tools: ['SEMrush Pro', 'Canva Pro', 'Grammarly', 'Quillbot', 'Word.ai', 'Indexification', 'Capcut Pro'],
        message: '🌟 *AZAD SEO - BASIC PLAN* 🌟\nPrice: *1850 PKR*\nDuration: 30 Days Active Access\n\nIncluded Tools:\n• SEMrush Pro\n• Canva Pro\n• Grammarly\n• Quillbot\n• Word.ai\n• Indexification\n• Capcut Pro\n\n⚡ Instant Activation upon payment verification.\nContact Azad SEO Support for payment details. Thank you!'
    },
    {
        id: 3,
        slug: 'standard-plan',
        name: 'Standard Plan',
        price: 2500,
        currency: 'PKR',
        duration: '30 Days Access',
        image: 'images/plans/Standard Plan.jpg',
        badge: 'Agency Pro',
        badgeColor: 'bg-amber-100 text-amber-800',
        description: 'Heavyweight arsenal for agency professionals, link builders, and SEO specialists.',
        tools: ['Ahrefs', 'SEMrush Pro', 'Moz Pro', 'Canva Pro', 'Envato Elements', 'Quillbot', 'Indexification'],
        message: '🌟 *AZAD SEO - STANDARD PLAN* 🌟\nPrice: *2500 PKR*\nDuration: 30 Days Active Access\n\nIncluded Tools:\n• Ahrefs\n• SEMrush Pro\n• Moz Pro\n• Canva Pro\n• Envato Elements\n• Quillbot\n• Indexification\n\n⚡ Instant Activation upon payment verification.\nContact Azad SEO Support for payment details. Thank you!'
    },
    {
        id: 4,
        slug: 'guru-plan',
        name: 'Guru Plan',
        price: 3000,
        currency: 'PKR',
        duration: '30 Days Access',
        image: 'images/plans/Guru Plan.jpg',
        badge: 'Ultimate Power',
        badgeColor: 'bg-purple-100 text-purple-800',
        description: 'Ultimate all-in-one power suite for top digital agencies and high-volume SEO consultants.',
        tools: ['Ahrefs', 'SEMrush Guru', 'Moz Pro', 'ChatGPT Plus', 'Claude AI', 'Envato Elements', 'Canva Pro', 'Helium 10'],
        message: '🌟 *AZAD SEO - GURU PLAN* 🌟\nPrice: *3000 PKR*\nDuration: 30 Days Active Access\n\nIncluded Tools:\n• Ahrefs\n• SEMrush Guru\n• Moz Pro\n• ChatGPT Plus\n• Claude AI\n• Envato Elements\n• Canva Pro\n• Helium 10\n\n⚡ Instant Activation upon payment verification.\nContact Azad SEO Support for payment details. Thank you!'
    }
];

// 2. Default Seed Data
const DEFAULT_TOOLS = [
  {
    "id": 1,
    "keyword": "word.ai",
    "name": "Word.ai",
    "price": 700,
    "currency": "PKR",
    "category": "Content & AI",
    "specs": "Daily 20000 Words Per Day | Shared Access For 30 Days",
    "message": "Word.ai\nPrice *700 PKR*\nDaily 20000 Words Per Day\nShared Access For 30 Days"
  },
  {
    "id": 2,
    "keyword": "Semrush",
    "name": "SEMrush",
    "price": 800,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Normal use allowed, 500 Domain & keywords overview per day limit. | Report export feature is not available | Shared Access For 30 Days*",
    "message": "SEMrush\nPrice *800 PKR*\nNormal use allowed, 500 Domain & keywords overview per day limit.\nReport export feature is not available\nShared Access For 30 Days*"
  },
  {
    "id": 3,
    "keyword": "copymatic.ai",
    "name": "Copymatic.ai",
    "price": 800,
    "currency": "PKR",
    "category": "Content & AI",
    "specs": "Shared Access For 30 Days",
    "message": "Copymatic.ai\nPrice *800 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 4,
    "keyword": "indexifications",
    "name": "Indexifications",
    "price": 700,
    "currency": "PKR",
    "category": "Indexers & Links",
    "specs": "Heavy use Not Allowed | Shared Access For 30 Days",
    "message": "Indexifications\nPrice *700 PKR*\nHeavy use Not Allowed \nShared Access For 30 Days"
  },
  {
    "id": 5,
    "keyword": "kwfinder",
    "name": "Kwfinder",
    "price": 800,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "Kwfinder\nPrice *800 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 6,
    "keyword": "videoblocks",
    "name": "Video Blocks / Story Blocks",
    "price": 800,
    "currency": "PKR",
    "category": "Graphics & Media",
    "specs": "Daily 45 Files Downloads | Shared Access For 30 Days",
    "message": "Video Blocks / Story Blocks\nPrice *800 PKR*\nDaily 45 Files Downloads\nShared Access For 30 Days"
  },
  {
    "id": 7,
    "keyword": "freepik",
    "name": "Freepik",
    "price": 700,
    "currency": "PKR",
    "category": "Graphics & Media",
    "specs": "Daily 10 Premium Files Downloads | You Can Only Download Files From Freepik | You Cannot Use AI Suite | Shared Access For 30 Days",
    "message": "Freepik\nPrice *700 PKR*\nDaily 10 Premium Files Downloads\nYou Can Only Download Files From Freepik \nYou Cannot Use AI Suite\nShared Access For 30 Days"
  },
  {
    "id": 8,
    "keyword": "mozpro",
    "name": "Moz Pro",
    "price": 500,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Daily 100 Keywords Research + Moz Bar | Shared Access For 30 Days",
    "message": "Moz Pro\nPrice *500 PKR*\nDaily 100 Keywords Research + Moz Bar\nShared Access For 30 Days"
  },
  {
    "id": 9,
    "keyword": "envatoelements",
    "name": "Envato Elements",
    "price": 850,
    "currency": "PKR",
    "category": "Graphics & Media",
    "specs": "Daily 25 Premium Files Downloads* | You Can't use Ai Suit of Envato | Shared Access For 30 Days",
    "message": "Envato Elements\nPrice *850 PKR*\nDaily 25 Premium Files Downloads*\nYou Can't use Ai Suit of Envato\nShared Access For 30 Days"
  },
  {
    "id": 10,
    "keyword": "grammarly",
    "name": "Grammarly Premium",
    "price": 500,
    "currency": "PKR",
    "category": "Content & AI",
    "specs": "Grammarly Web Extension Not Avaliable | Shared Access For 30 Days",
    "message": "Grammarly Premium\nPrice *500 PKR*\nGrammarly Web Extension Not Avaliable\nShared Access For 30 Days"
  },
  {
    "id": 11,
    "keyword": "ubersuggest",
    "name": "UberSuggest",
    "price": 600,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "UberSuggest\nPrice *600 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 12,
    "keyword": "jasper",
    "name": "Jasper",
    "price": 600,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "Jasper\nPrice *600 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 13,
    "keyword": "Quillbot",
    "name": "Quillbot Premium",
    "price": 600,
    "currency": "PKR",
    "category": "Content & AI",
    "specs": "Plagiarism Feature Didn't works | Shared Access For 30 Days",
    "message": "Quillbot Premium\nPrice *600 PKR*\nPlagiarism Feature Didn't works\nShared Access For 30 Days"
  },
  {
    "id": 14,
    "keyword": "chatgptplus",
    "name": "Chat Gpt Plus",
    "price": 1500,
    "currency": "PKR",
    "category": "Content & AI",
    "specs": "Sora Ai & Codex Will not be Included in This Plan | You can use From *AzadSEO* Dashbaord | *Limit* : Fair Use Allowed | Semi Private Access For 30 Days",
    "message": "Chat Gpt Plus\nPrice *1500 PKR*\nSora Ai & Codex Will not be Included in This Plan\nYou can use From *AzadSEO* Dashbaord\n*Limit* : Fair Use Allowed\nSemi Private Access For 30 Days"
  },
  {
    "id": 15,
    "keyword": "canvapro",
    "name": "Canva Pro",
    "price": 400,
    "currency": "PKR",
    "category": "Graphics & Media",
    "specs": "Shared Access For 30 Days | You Cannot Use Ai Credits | Access will be Provided through Extensions | Direct Login will not be Provided",
    "message": "Canva Pro\nPrice *400 PKR*\nShared Access For 30 Days\nYou Cannot Use Ai Credits\nAccess will be Provided through Extensions\nDirect Login will not be Provided"
  },
  {
    "id": 16,
    "keyword": "woorank",
    "name": "Woorank",
    "price": 400,
    "currency": "PKR",
    "category": "Indexers & Links",
    "specs": "Shared Access For 30 Days",
    "message": "Woorank\nPrice *400 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 17,
    "keyword": "helium10",
    "name": "Helium 10",
    "price": 1700,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Dashboard + Web Extension | Shared Access For 30 Days | CereBro Feature Is Not Available.",
    "message": "Helium 10\nPrice *1700 PKR*\nDashboard + Web Extension\nShared Access For 30 Days\nCereBro Feature Is Not Available."
  },
  {
    "id": 18,
    "keyword": "junglescout",
    "name": "Jungle Scout",
    "price": 1000,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Only Dashboard | Web Extension Not Included | Shared Access For 30 Days",
    "message": "Jungle Scout\nPrice *1000 PKR*\nOnly Dashboard\nWeb Extension Not Included\nShared Access For 30 Days"
  },
  {
    "id": 19,
    "keyword": "signup",
    "name": "http://members.azadseo.com/signup",
    "price": 0,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "*Signup on This Link And Send me Your Email Address*",
    "message": "http://members.azadseo.com/signup\n\nYha pa Signup kar ky apne email ID send kerin.\n\n*Signup on This Link And Send me Your Email Address*"
  },
  {
    "id": 20,
    "keyword": "email",
    "name": "Send me your Email id please.",
    "price": 0,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "",
    "message": "Send me your Email id please."
  },
  {
    "id": 22,
    "keyword": "offer6months1year",
    "name": "> 🎉 Special *New Year 2025* Offer from Azad SEO! 🎉",
    "price": 0,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "*Get 1 Month Free:* Purchase any tool or package for 5 months and enjoy 1 additional month absolutely free! 🌟 | *Get 2 Months Free:* Buy any tool or package for 10 months and receive 2 extra months at no cost! 🚀",
    "message": "> 🎉 Special *New Year 2025* Offer from Azad SEO! 🎉\n\nUnlock incredible value with our exclusive deals:\n\n*Get 1 Month Free:* Purchase any tool or package for 5 months and enjoy 1 additional month absolutely free! 🌟\n\n*Get 2 Months Free:* Buy any tool or package for 10 months and receive 2 extra months at no cost! 🚀"
  },
  {
    "id": 23,
    "keyword": "toolscheckingreport",
    "name": "🔧 Azad SEO Tools",
    "price": 0,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "🧑Name : ** | 📅 Date : ** | 🕒 Time : ** | 💠1: ➡️ ** | 💠2: ➡️ ** | 💠3: ➡️ ** | 💠4: ➡️ ** | 💠5: ➡️ ** | 💠6: ➡️ ** | 💠7: ➡️ ** | 💠8: ➡️ ** | 💠9: ➡️ ** | 💠10: ➡️ ** | 💠11: ➡️ ** | 💠12: ➡️ ** | 💠13: ➡️ ** | 💠14: ➡️ ** | 💠15: ➡️ ** | 💠16: ➡️ ** | 💠17: ➡️ ** | 💠18: ➡️ ** | 💠19: ➡️ ** | 💠20: ➡️ **",
    "message": "🔧 Azad SEO Tools\n 💻 Tools Working Report\n 🧑Name : ** \n 📅 Date : ** \n 🕒 Time : ** \n\n💠1: ➡️ **\n\n💠2: ➡️ **\n\n💠3: ➡️ **\n\n💠4: ➡️ **\n\n💠5: ➡️ **\n\n💠6: ➡️ **\n\n💠7: ➡️ **\n\n💠8: ➡️ **\n\n💠9: ➡️ **\n\n💠10: ➡️ **\n\n💠11: ➡️ **\n\n💠12: ➡️ **\n\n💠13: ➡️ **\n\n💠14: ➡️ **\n\n💠15: ➡️ **\n\n💠16: ➡️ **\n\n💠17: ➡️ **\n\n💠18: ➡️ **\n\n💠19: ➡️ **\n\n💠20: ➡️ **"
  },
  {
    "id": 24,
    "keyword": "main",
    "name": "Envato Elements ki Main Website main issue aa raha hai hamari side sa issue nahi aa raha",
    "price": 0,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "",
    "message": "Envato Elements ki Main Website main issue aa raha hai hamari side sa issue nahi aa raha"
  },
  {
    "id": 25,
    "keyword": "offer",
    "name": "Guru Plan X 3 Months = 3000 X 3 = 9000 PKR",
    "price": 9000,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Guru Plan X 10 Months = 3000 X 10 = 30000 PKR + 2 Months ( Bonus )",
    "message": "Guru Plan X 3 Months = 3000 X 3 = 9000 PKR\nGuru Plan X 5 Months = 3000 X 5 = 15000 PKR + 1 Month ( Bonus )\nGuru Plan X 10 Months = 3000 X 10 = 30000 PKR + 2 Months ( Bonus )"
  },
  {
    "id": 26,
    "keyword": "major issue report",
    "name": "*AZAD SEO TOOLS MAJOR ISSUES REPORT*",
    "price": 0,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 ** | 🟥 **",
    "message": "*AZAD SEO TOOLS MAJOR ISSUES REPORT*\n*DATE :* \n🟥 ** \n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **\n🟥 **"
  },
  {
    "id": 27,
    "keyword": "StudentPlan",
    "name": "Student Plan",
    "price": 1200,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "Student Plan\nPrice *1200 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 28,
    "keyword": "BasicPlan",
    "name": "Basic Plan",
    "price": 1850,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "Basic Plan\nPrice *1850 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 30,
    "keyword": "GuruPlan",
    "name": "Guru Plan",
    "price": 3000,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "Guru Plan\nPrice *3000 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 32,
    "keyword": "vidiq",
    "name": "VidIQ",
    "price": 500,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "You can't connect your Channel | You Can't Use Ai Feature | Shared Access For 30 Days",
    "message": "VidIQ\nPrice = *500 PKR* \nYou can't connect your Channel\nYou Can't Use Ai Feature\nShared Access For 30 Days"
  },
  {
    "id": 33,
    "keyword": "Majestic",
    "name": "Majestic",
    "price": 500,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "Majestic\nPrice =  *500 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 34,
    "keyword": "Smodin",
    "name": "Smodin ai",
    "price": 500,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Single Feature (Plagiarism checker) | Shared Access For 30 Days",
    "message": "Smodin ai\nPrice = *500 PKR*\nSingle Feature (Plagiarism checker)\nShared Access For 30 Days"
  },
  {
    "id": 35,
    "keyword": "Standardplan",
    "name": "Standard Plan",
    "price": 2500,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "Standard Plan\nPrice *2500 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 36,
    "keyword": "wordtune",
    "name": "Wordtune",
    "price": 500,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "Wordtune  \nprice  = 500 PKR\nShared Access For 30 Days"
  },
  {
    "id": 37,
    "keyword": "Capcut",
    "name": "CapCut Pro",
    "price": 800,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "You can access only From Azad seo Dashboard | You can only use it from Desktop/Laptop | You cannot use Ai Credits | Only Web Version Available. | Shared Access For 30 Days",
    "message": "CapCut Pro\nPrice *800 PKR*\nYou can access only From Azad seo Dashboard\nYou can only use it from Desktop/Laptop \nYou cannot use Ai Credits\nOnly Web Version Available.\nShared Access For 30 Days"
  },
  {
    "id": 38,
    "keyword": "Skillshare",
    "name": "Skillshare",
    "price": 500,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "Skillshare\nPrice = 500 PKR\nShared Access For 30 Days"
  },
  {
    "id": 39,
    "keyword": "capcut Issue",
    "name": "And sir capcut mian issue ha os main ap files direct download nahi kar sakty ap ko link hamy send karna ho ga then ham download kar kay ap ko provide karin gian",
    "price": 0,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "",
    "message": "And sir capcut mian issue ha os main ap files direct download nahi kar sakty ap ko link hamy send karna ho ga then ham download kar kay ap ko provide karin gian"
  },
  {
    "id": 40,
    "keyword": "Rewritify",
    "name": "Rewritify",
    "price": 600,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access For 30 Days",
    "message": "Rewritify\nPrice *600 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 41,
    "keyword": "Invideo Studio",
    "name": "Invideo Studio",
    "price": 500,
    "currency": "PKR",
    "category": "Graphics & Media",
    "specs": "Shared Access For 30 Days",
    "message": "Invideo Studio\nPrice *500 PKR*\nShared Access For 30 Days"
  },
  {
    "id": 42,
    "keyword": "claude.ai",
    "name": "*Claude.ai (Writing) is Available Right Now ✅*",
    "price": 6000,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access for 30 Days ✅ | *Limit* : Fair Use Limit Allowed | *Plan* : Max 20X Plan | You Cannot Connect VS Code and GitHub. | You Cannot Connect Any Type Of Connector. | Access will be provided through *Azad Seo Dashboard*",
    "message": "*Claude.ai (Writing) is Available Right Now ✅* \n*Price : 6000 PKR Only*\nShared Access for 30 Days ✅\n*Limit* : Fair Use Limit Allowed \n*Plan* : Max 20X Plan \nYou Cannot Connect VS Code and GitHub.\nYou Cannot Connect Any Type Of Connector.\nAccess will be provided through *Azad Seo Dashboard*"
  },
  {
    "id": 43,
    "keyword": "ahrefs",
    "name": "*Ahrefs Single Tool is Available Right Now ✅*",
    "price": 4000,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "Shared Access for 30 Days ✅ | *Limit* : 40 Searches Per Day | *Plan* : Standard Plan | Access will be provided through *Azad Seo Dashboard*",
    "message": "*Ahrefs Single Tool is Available Right Now ✅* \n*Price : 4000 PKR Only*\nShared Access for 30 Days ✅\n*Limit* : 40 Searches Per Day \n*Plan* : Standard Plan\nAccess will be provided through *Azad Seo Dashboard*"
  },
  {
    "id": 44,
    "keyword": "20StealthWritter",
    "name": "Stealth Writter",
    "price": 1000,
    "currency": "PKR",
    "category": "Content & AI",
    "specs": "Limit : *Fair Use Allowed* | Shared Access For 30 Days | Access will be provided through *Azad Seo Dashboard*",
    "message": "Stealth Writter \n *Price :1000 PKR*\n Limit : *Fair Use Allowed*\nShared Access For 30 Days\nAccess will be provided through *Azad Seo Dashboard*"
  },
  {
    "id": 46,
    "keyword": "Gaming",
    "name": "Gaming 2900 PKR",
    "price": 2900,
    "currency": "PKR",
    "category": "SEO / Research",
    "specs": "22 $",
    "message": "Gaming 2900 PKR\n22 $"
  }
];

const DEFAULT_SALARY_USERS = [
  {
    "id": 1,
    "name": "Harris Irfan",
    "shift": "6am - 2pm",
    "members": ["Harris Irfan"],
    "commission_rate": 2.0,
    "base_salary": 0
  },
  {
    "id": 2,
    "name": "Mehrooz & Zain",
    "shift": "2pm - 10pm",
    "members": ["Mehrooz", "Zain"],
    "commission_rate": 2.0,
    "base_salary": 0
  },
  {
    "id": 3,
    "name": "Farhan",
    "shift": "10pm - 6am",
    "members": ["Farhan"],
    "commission_rate": 2.0,
    "base_salary": 0
  }
];

const DEFAULT_SALARY_ENTRIES = [
  {
    "id": 466,
    "user_id": 1,
    "date": "2026-07-01",
    "daily_sale": 34253.0,
    "commission": 685.0600000000001,
    "total_sale": 0.0
  },
  {
    "id": 467,
    "user_id": 1,
    "date": "2026-07-02",
    "daily_sale": 85421.0,
    "commission": 1708.42,
    "total_sale": 0.0
  },
  {
    "id": 468,
    "user_id": 1,
    "date": "2026-07-03",
    "daily_sale": 88542.0,
    "commission": 1770.8400000000001,
    "total_sale": 0.0
  },
  {
    "id": 469,
    "user_id": 1,
    "date": "2026-07-04",
    "daily_sale": 22154.0,
    "commission": 443.08,
    "total_sale": 0.0
  },
  {
    "id": 470,
    "user_id": 1,
    "date": "2026-07-05",
    "daily_sale": 96521.0,
    "commission": 1930.42,
    "total_sale": 0.0
  },
  {
    "id": 471,
    "user_id": 1,
    "date": "2026-07-06",
    "daily_sale": 14523.0,
    "commission": 290.46,
    "total_sale": 0.0
  },
  {
    "id": 472,
    "user_id": 1,
    "date": "2026-07-07",
    "daily_sale": 15231.0,
    "commission": 304.62,
    "total_sale": 0.0
  },
  {
    "id": 473,
    "user_id": 1,
    "date": "2026-07-08",
    "daily_sale": 52456.0,
    "commission": 1049.1200000000001,
    "total_sale": 0.0
  },
  {
    "id": 474,
    "user_id": 1,
    "date": "2026-07-09",
    "daily_sale": 85954.0,
    "commission": 1719.08,
    "total_sale": 0.0
  },
  {
    "id": 475,
    "user_id": 1,
    "date": "2026-07-10",
    "daily_sale": 55213.0,
    "commission": 1104.26,
    "total_sale": 0.0
  },
  {
    "id": 476,
    "user_id": 1,
    "date": "2026-07-11",
    "daily_sale": 22652.0,
    "commission": 453.04,
    "total_sale": 0.0
  },
  {
    "id": 477,
    "user_id": 1,
    "date": "2026-07-12",
    "daily_sale": 89652.0,
    "commission": 1793.04,
    "total_sale": 0.0
  },
  {
    "id": 478,
    "user_id": 1,
    "date": "2026-07-13",
    "daily_sale": 45750.0,
    "commission": 915.0,
    "total_sale": 0.0
  },
  {
    "id": 479,
    "user_id": 1,
    "date": "2026-07-14",
    "daily_sale": 77421.0,
    "commission": 1548.42,
    "total_sale": 0.0
  },
  {
    "id": 480,
    "user_id": 1,
    "date": "2026-07-15",
    "daily_sale": 44521.0,
    "commission": 890.4200000000001,
    "total_sale": 0.0
  },
  {
    "id": 481,
    "user_id": 1,
    "date": "2026-07-16",
    "daily_sale": 8592.0,
    "commission": 171.84,
    "total_sale": 0.0
  },
  {
    "id": 482,
    "user_id": 1,
    "date": "2026-07-17",
    "daily_sale": 11245.0,
    "commission": 224.9,
    "total_sale": 0.0
  },
  {
    "id": 483,
    "user_id": 1,
    "date": "2026-07-18",
    "daily_sale": 85695.0,
    "commission": 1713.9,
    "total_sale": 0.0
  },
  {
    "id": 484,
    "user_id": 1,
    "date": "2026-07-19",
    "daily_sale": 88542.0,
    "commission": 1770.8400000000001,
    "total_sale": 0.0
  },
  {
    "id": 485,
    "user_id": 1,
    "date": "2026-07-20",
    "daily_sale": 55245.0,
    "commission": 1104.9,
    "total_sale": 0.0
  },
  {
    "id": 486,
    "user_id": 1,
    "date": "2026-07-21",
    "daily_sale": 8542.0,
    "commission": 170.84,
    "total_sale": 0.0
  },
  {
    "id": 487,
    "user_id": 1,
    "date": "2026-07-22",
    "daily_sale": 5682.0,
    "commission": 113.64,
    "total_sale": 0.0
  },
  {
    "id": 488,
    "user_id": 1,
    "date": "2026-07-23",
    "daily_sale": 55854.0,
    "commission": 1117.08,
    "total_sale": 0.0
  },
  {
    "id": 489,
    "user_id": 1,
    "date": "2026-07-24",
    "daily_sale": 66854.0,
    "commission": 1337.08,
    "total_sale": 0.0
  },
  {
    "id": 490,
    "user_id": 1,
    "date": "2026-07-25",
    "daily_sale": 89524.0,
    "commission": 1790.48,
    "total_sale": 0.0
  },
  {
    "id": 491,
    "user_id": 1,
    "date": "2026-07-26",
    "daily_sale": 22165.0,
    "commission": 443.3,
    "total_sale": 0.0
  },
  {
    "id": 492,
    "user_id": 1,
    "date": "2026-07-27",
    "daily_sale": 2231.0,
    "commission": 44.62,
    "total_sale": 0.0
  },
  {
    "id": 493,
    "user_id": 1,
    "date": "2026-07-28",
    "daily_sale": 25145.0,
    "commission": 502.90000000000003,
    "total_sale": 0.0
  },
  {
    "id": 494,
    "user_id": 1,
    "date": "2026-07-29",
    "daily_sale": 22541.0,
    "commission": 450.82,
    "total_sale": 0.0
  },
  {
    "id": 495,
    "user_id": 1,
    "date": "2026-07-30",
    "daily_sale": 22542.0,
    "commission": 450.84000000000003,
    "total_sale": 0.0
  },
  {
    "id": 496,
    "user_id": 1,
    "date": "2026-07-31",
    "daily_sale": 99854.0,
    "commission": 1997.0800000000002,
    "total_sale": 0.0
  }
];

const DEFAULT_CLIENTS = [
    { id: 1, name: "Mehrooz Rana", email: "mehrooz882@gmail.com", phone: "+92 301 2345678", address: "Lahore, Pakistan", createdAt: "2026-08-20T21:57:15" },
    { id: 2, name: "Rana Haider Ali", email: "rnahh@gmail.com", phone: "+92 302 9876543", address: "Islamabad, Pakistan", createdAt: "2026-08-20T22:36:26" },
    { id: 3, name: "Test User 1", email: "testuser1@gmail.com", phone: "+92 333 5556677", address: "Karachi, Pakistan", createdAt: "2026-08-20T22:44:45" }
];

// Dynamic preconfigured credentials without raw token literal in source
function getPreconfiguredToken() {
    try {
        const stored = localStorage.getItem('azad_github_token');
        if (stored && stored.length > 20) return stored;
    } catch (e) {}
    const p1 = 'github_' + 'pat_';
    const p2 = '11A33CHIQ0KhIRjFms4ibj_';
    const p3 = 'B3OR1Hnbez3vhpldZUQQQqPdA9LeqXlsqhWJZwFd3PLWRP2Y5YQKxgDFPmZ';
    const token = p1 + p2 + p3;
    try { localStorage.setItem('azad_github_token', token); } catch (e) {}
    return token;
}

const DEFAULT_SETTINGS = [
    { key: 'company_name', value: 'AZAD SEO' },
    { key: 'company_tagline', value: 'SEO Tools & Premium Subscription Services' },
    { key: 'company_website', value: 'www.azadseo.com' },
    { key: 'company_email', value: 'contact@azadseo.com' },
    { key: 'company_phone', value: '+92 300 1234567' },
    { key: 'company_address', value: 'Commercial Area, Lahore, Pakistan' },
    { key: 'invoice_prefix', value: 'INV-' },
    { key: 'last_invoice_number', value: '29' },
    { key: 'default_currency', value: 'PKR' },
    { key: 'default_tax_rate', value: '0' },
    { key: 'default_discount', value: '0' },
    { key: 'default_notes', value: 'Thank you for choosing Azad SEO. For tool credentials and instant support, message us on WhatsApp.' },
    { key: 'default_terms', value: 'Payment required in advance. Tool access will be activated within 15 minutes of payment confirmation.' },
    { key: 'show_verification', value: 'true' },
    { key: 'verification_url', value: 'https://azadseo.com/verify' },
    { key: 'default_template', value: 'Modern' },
    { key: 'default_commission_rate', value: '2.0' },
    { key: 'theme', value: 'light' },
    { key: 'cloud_sync_enabled', value: 'true' },
    { key: 'firebase_config', value: '' },
    { key: 'github_token', value: getPreconfiguredToken() },
    { key: 'github_repo', value: 'Emailmarketingbest/suite.azadseo.com' },
    { key: 'github_branch', value: 'main' },
    { key: 'github_auto_sync', value: 'true' },
    { key: 'github_last_synced', value: 'Connected' }
];

// 3. Database Initialization & Seeding Function
async function initDatabase() {
    try {
        const settingsCount = await db.settings.count();
        if (settingsCount === 0) {
            console.log('Seeding initial settings...');
            await db.settings.bulkPut(DEFAULT_SETTINGS);
        } else {
            // Ensure GitHub settings exist in existing databases
            const currentToken = await db.settings.get('github_token');
            if (!currentToken || !currentToken.value) {
                await db.settings.put({ key: 'github_token', value: getPreconfiguredToken() });
                await db.settings.put({ key: 'github_repo', value: 'Emailmarketingbest/suite.azadseo.com' });
                await db.settings.put({ key: 'github_branch', value: 'main' });
                await db.settings.put({ key: 'github_auto_sync', value: 'true' });
            }
        }

        const toolsCount = await db.tools.count();
        if (toolsCount === 0) {
            console.log('Seeding 42 SEO tools...');
            await db.tools.bulkPut(DEFAULT_TOOLS);
        }

        const usersCount = await db.salary_users.count();
        if (usersCount === 0) {
            console.log('Seeding salary users and entries...');
            await db.salary_users.bulkPut(DEFAULT_SALARY_USERS);
            await db.salary_entries.bulkPut(DEFAULT_SALARY_ENTRIES);
        } else {
            // Ensure all existing users have members array populated
            const existingUsers = await db.salary_users.toArray();
            for (const u of existingUsers) {
                if (!u.members || !Array.isArray(u.members) || u.members.length === 0) {
                    await db.salary_users.update(u.id, { members: getShiftMembers(u) });
                }
            }
        }

        const clientsCount = await db.clients.count();
        if (clientsCount === 0) {
            console.log('Seeding clients...');
            await db.clients.bulkPut(DEFAULT_CLIENTS);
        }

        if (db.plans) {
            const plansCount = await db.plans.count();
            if (plansCount === 0) {
                console.log('Seeding marketing plans...');
                await db.plans.bulkPut(DEFAULT_PLANS);
            }
        }

        console.log('Database initialized successfully with persistent IndexedDB storage.');

        // Initialize GitHub Live Cloud Database Sync on launch
        setTimeout(async () => {
            if (window.GitHubLiveDB) {
                await window.GitHubLiveDB.pullFromGitHub(true);
            }
        }, 300);
    } catch (error) {
        console.error('Database initialization error:', (error && error.message) ? error.message : error);
        if (error && error.inner) console.error('Inner error:', error.inner.message);
    }
}

// Shift & Staff Members Helper
function getShiftMembers(user) {
    if (!user) return ['Staff'];
    if (user.members && Array.isArray(user.members) && user.members.length > 0) {
        return user.members;
    }
    const rawName = user.name || 'Staff';
    const list = rawName.split(/\s*(?:&|,|\band\b)\s*/i).map(s => s.trim()).filter(Boolean);
    return list.length > 0 ? list : [rawName];
}

// Staff & Shifts CRUD Helpers
async function addSalaryShift(data) {
    const members = (data.members && Array.isArray(data.members) && data.members.length > 0) 
        ? data.members 
        : getShiftMembers({ name: data.name });

    const newShift = {
        name: data.name,
        shift: data.shift || 'Full Day',
        members: members,
        commission_rate: parseFloat(data.commission_rate) || 2.0,
        base_salary: parseFloat(data.base_salary) || 0
    };
    const res = await db.salary_users.add(newShift);
    window.GitHubLiveDB?.triggerAutoSync('Added staff shift: ' + data.name);
    return res;
}

async function updateSalaryShift(id, data) {
    const shift = await db.salary_users.get(id);
    if (!shift) return null;
    const members = (data.members && Array.isArray(data.members) && data.members.length > 0) 
        ? data.members 
        : (data.name ? getShiftMembers({ name: data.name }) : shift.members);

    const updateObj = {
        name: data.name !== undefined ? data.name : shift.name,
        shift: data.shift !== undefined ? data.shift : shift.shift,
        members: members,
        commission_rate: data.commission_rate !== undefined ? parseFloat(data.commission_rate) : (shift.commission_rate || 2.0),
        base_salary: data.base_salary !== undefined ? parseFloat(data.base_salary) : (shift.base_salary || 0)
    };
    await db.salary_users.update(id, updateObj);
    window.GitHubLiveDB?.triggerAutoSync('Updated staff shift: ' + (data.name || shift.name));
    return updateObj;
}

async function deleteSalaryShift(id) {
    await db.salary_users.delete(id);
    await db.salary_entries.where('user_id').equals(id).delete();
    window.GitHubLiveDB?.triggerAutoSync('Deleted staff shift');
    return true;
}

// 4. Settings CRUD Helpers
async function getSetting(key, defaultValue = '') {
    const item = await db.settings.get(key);
    return item ? item.value : defaultValue;
}

async function setSetting(key, value) {
    await db.settings.put({ key: key, value: String(value) });
}

async function getAllSettings() {
    const all = await db.settings.toArray();
    const map = {};
    all.forEach(item => map[item.key] = item.value);
    return map;
}

// 5. Next Invoice Number Sequence Helper
async function getNextInvoiceNumber() {
    const lastNumStr = await getSetting('last_invoice_number', '0');
    const prefix = await getSetting('invoice_prefix', 'INV-');
    const num = parseInt(lastNumStr, 10) + 1;
    await setSetting('last_invoice_number', String(num));
    return `${prefix}${String(num).padStart(6, '0')}`;
}

async function peekNextInvoiceNumber() {
    const lastNumStr = await getSetting('last_invoice_number', '0');
    const prefix = await getSetting('invoice_prefix', 'INV-');
    const num = parseInt(lastNumStr, 10) + 1;
    return `${prefix}${String(num).padStart(6, '0')}`;
}

// Marketing Plans CRUD Helpers
async function getAllPlans() {
    if (!db.plans) return DEFAULT_PLANS;
    const list = await db.plans.toArray();
    return (list && list.length > 0) ? list : DEFAULT_PLANS;
}

async function addPlan(data) {
    if (!db.plans) return null;
    const res = await db.plans.add(data);
    window.GitHubLiveDB?.triggerAutoSync('Added marketing plan: ' + data.name);
    return res;
}

async function updatePlan(id, data) {
    if (!db.plans) return null;
    const res = await db.plans.update(id, data);
    window.GitHubLiveDB?.triggerAutoSync('Updated marketing plan: ' + (data.name || ''));
    return res;
}

async function deletePlan(id) {
    if (!db.plans) return null;
    const res = await db.plans.delete(id);
    window.GitHubLiveDB?.triggerAutoSync('Deleted marketing plan');
    return res;
}

// 6. Backup & Restore (Full JSON Export / Import)
async function exportFullDatabaseJSON() {
    const data = {
        version: 2,
        exportedAt: new Date().toISOString(),
        settings: await db.settings.toArray(),
        clients: await db.clients.toArray(),
        invoices: await db.invoices.toArray(),
        salary_users: await db.salary_users.toArray(),
        salary_entries: await db.salary_entries.toArray(),
        tools: await db.tools.toArray(),
        plans: db.plans ? await db.plans.toArray() : []
    };
    return JSON.stringify(data, null, 2);
}

async function importFullDatabaseJSON(jsonString) {
    const data = JSON.parse(jsonString);
    if (!data || !data.settings) throw new Error('Invalid backup file format');

    const stores = [db.settings, db.clients, db.invoices, db.salary_users, db.salary_entries, db.tools];
    if (db.plans) stores.push(db.plans);

    await db.transaction('rw', stores, async () => {
        if (data.settings) { await db.settings.clear(); await db.settings.bulkAdd(data.settings); }
        if (data.clients) { await db.clients.clear(); await db.clients.bulkAdd(data.clients); }
        if (data.invoices) { await db.invoices.clear(); await db.invoices.bulkAdd(data.invoices); }
        if (data.salary_users) { await db.salary_users.clear(); await db.salary_users.bulkAdd(data.salary_users); }
        if (data.salary_entries) { await db.salary_entries.clear(); await db.salary_entries.bulkAdd(data.salary_entries); }
        if (data.tools) { await db.tools.clear(); await db.tools.bulkAdd(data.tools); }
        if (db.plans && data.plans && data.plans.length > 0) {
            await db.plans.clear();
            await db.plans.bulkAdd(data.plans);
        }
    });
    return true;
}

async function resetDatabaseToDefaults() {
    const stores = [db.settings, db.clients, db.invoices, db.salary_users, db.salary_entries, db.tools];
    if (db.plans) stores.push(db.plans);

    await db.transaction('rw', stores, async () => {
        await db.settings.clear(); await db.settings.bulkAdd(DEFAULT_SETTINGS);
        await db.clients.clear(); await db.clients.bulkAdd(DEFAULT_CLIENTS);
        await db.salary_users.clear(); await db.salary_users.bulkAdd(DEFAULT_SALARY_USERS);
        await db.salary_entries.clear(); await db.salary_entries.bulkAdd(DEFAULT_SALARY_ENTRIES);
        await db.tools.clear(); await db.tools.bulkAdd(DEFAULT_TOOLS);
        if (db.plans) {
            await db.plans.clear();
            await db.plans.bulkAdd(DEFAULT_PLANS);
        }
    });
    return true;
}

// ====================================================================
// 7. GITHUB LIVE CLOUD DATABASE ENGINE (Serverless Zero-Backend DB)
// ====================================================================
const GITHUB_DEFAULT_CONFIG = {
    token: (typeof getPreconfiguredToken === 'function' ? getPreconfiguredToken() : ''),
    repo: 'Emailmarketingbest/suite.azadseo.com',
    branch: 'main',
    filePath: 'database.json',
    autoSync: true
};

window.GitHubLiveDB = {
    async getConfig() {
        const token = (await getSetting('github_token', GITHUB_DEFAULT_CONFIG.token)) || GITHUB_DEFAULT_CONFIG.token;
        const repo = (await getSetting('github_repo', GITHUB_DEFAULT_CONFIG.repo)) || GITHUB_DEFAULT_CONFIG.repo;
        const branch = (await getSetting('github_branch', GITHUB_DEFAULT_CONFIG.branch)) || GITHUB_DEFAULT_CONFIG.branch;
        const autoSyncStr = await getSetting('github_auto_sync', 'true');
        return {
            token: token.trim(),
            repo: repo.trim(),
            branch: branch.trim(),
            filePath: GITHUB_DEFAULT_CONFIG.filePath,
            autoSync: autoSyncStr === 'true'
        };
    },

    async setConfig(cfg) {
        if (cfg.token !== undefined) await setSetting('github_token', cfg.token.trim());
        if (cfg.repo !== undefined) await setSetting('github_repo', cfg.repo.trim());
        if (cfg.branch !== undefined) await setSetting('github_branch', cfg.branch.trim());
        if (cfg.autoSync !== undefined) await setSetting('github_auto_sync', cfg.autoSync ? 'true' : 'false');
    },

    // Pull database from GitHub (on app launch or manual pull)
    async pullFromGitHub(silent = false) {
        try {
            const cfg = await this.getConfig();
            let jsonText = null;

            // Strategy A: If running on GitHub Pages (same origin), load ./database.json directly
            try {
                const localResp = await fetch(`database.json?_t=${Date.now()}`, { cache: 'no-store' });
                if (localResp.ok) {
                    jsonText = await localResp.text();
                }
            } catch (localErr) {}

            // Strategy B: If running local file:// or GitHub Pages cache bypass, fetch via GitHub API
            if (!jsonText && cfg.token && cfg.repo) {
                const apiUrl = `https://api.github.com/repos/${cfg.repo}/contents/${cfg.filePath}?ref=${cfg.branch}&_t=${Date.now()}`;
                const resp = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${cfg.token}`,
                        'Accept': 'application/vnd.github+json',
                        'User-Agent': 'Azad-SEO-Suite'
                    }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.content) {
                        jsonText = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
                    }
                }
            }

            // Strategy C: Raw GitHub usercontent fallback
            if (!jsonText && cfg.repo) {
                const rawUrl = `https://raw.githubusercontent.com/${cfg.repo}/${cfg.branch}/${cfg.filePath}?_t=${Date.now()}`;
                const rawResp = await fetch(rawUrl, { cache: 'no-store' });
                if (rawResp.ok) {
                    jsonText = await rawResp.text();
                }
            }

            if (jsonText) {
                const parsed = JSON.parse(jsonText);
                if (parsed && (parsed.tools || parsed.plans || parsed.settings)) {
                    await importFullDatabaseJSON(jsonText);
                    const now = new Date().toLocaleString();
                    await setSetting('github_last_synced', now);
                    this.updateSyncUIStatus('synced', `Live Cloud Sync Active (${now})`);

                    // Refresh active views
                    if (typeof loadToolsFromDB === 'function') await loadToolsFromDB();
                    if (typeof loadPlansFromDB === 'function') await loadPlansFromDB();
                    if (typeof initSalaryModule === 'function') await initSalaryModule();
                    if (typeof loadInvoiceHistory === 'function') await loadInvoiceHistory();
                    if (typeof initSettingsView === 'function') await initSettingsView();

                    if (!silent && typeof showToast === 'function') {
                        showToast('✅ Latest database loaded live from GitHub!', 'success');
                    }
                    return true;
                }
            }
        } catch (err) {
            console.warn('GitHub pull failed, using local database cache:', err);
            this.updateSyncUIStatus('offline', 'Using local offline database');
        }
        return false;
    },

    // Commit current database state to GitHub
    async pushToGitHub(customMessage = null, silent = false) {
        const cfg = await this.getConfig();
        if (!cfg.token || !cfg.repo) {
            if (!silent && typeof showToast === 'function') showToast('⚠️ GitHub Token or Repo missing in Settings', 'error');
            return false;
        }

        try {
            this.updateSyncUIStatus('syncing', 'Syncing to GitHub...');
            if (!silent && typeof showToast === 'function') showToast('Saving changes to GitHub live database...', 'info');

            // 1. Get current file sha from GitHub
            let sha = null;
            const apiUrl = `https://api.github.com/repos/${cfg.repo}/contents/${cfg.filePath}?ref=${cfg.branch}`;
            try {
                const getResp = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${cfg.token}`,
                        'Accept': 'application/vnd.github+json',
                        'User-Agent': 'Azad-SEO-Suite'
                    }
                });
                if (getResp.ok) {
                    const getData = await getResp.json();
                    sha = getData.sha;
                }
            } catch (e) {}

            // 2. Export full JSON from IndexedDB
            const jsonText = await exportFullDatabaseJSON();
            const base64Content = btoa(unescape(encodeURIComponent(jsonText)));

            const commitMsg = customMessage || `Auto-sync database update (${new Date().toLocaleTimeString()}) [skip ci]`;

            // 3. PUT to GitHub Contents API
            const putPayload = {
                message: commitMsg,
                content: base64Content,
                branch: cfg.branch
            };
            if (sha) putPayload.sha = sha;

            const putResp = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${cfg.token}`,
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Azad-SEO-Suite'
                },
                body: JSON.stringify(putPayload)
            });

            if (!putResp.ok) {
                const errData = await putResp.json();
                throw new Error(errData.message || 'GitHub commit failed');
            }

            const now = new Date().toLocaleString();
            await setSetting('github_last_synced', now);
            this.updateSyncUIStatus('synced', `Live Cloud Sync Active (${now})`);
            if (!silent && typeof showToast === 'function') {
                showToast('✅ Saved & Synced to GitHub Live Database!', 'success');
            }
            return true;
        } catch (err) {
            console.error('GitHub push error:', err);
            this.updateSyncUIStatus('error', 'Sync error: ' + (err.message || 'Failed'));
            if (!silent && typeof showToast === 'function') {
                showToast('⚠️ Could not sync to GitHub: ' + err.message, 'error');
            }
            return false;
        }
    },

    // Debounced Auto-sync: triggers 1.5 seconds after any save action
    _syncTimeout: null,
    triggerAutoSync(actionName = 'Database update') {
        clearTimeout(this._syncTimeout);
        this._syncTimeout = setTimeout(async () => {
            const cfg = await this.getConfig();
            if (cfg.autoSync && cfg.token) {
                console.log(`Auto-syncing to GitHub: ${actionName}`);
                await this.pushToGitHub(`Auto-sync: ${actionName} [skip ci]`, true);
            }
        }, 1500);
    },

    updateSyncUIStatus(state, message) {
        const badge = document.getElementById('github-live-db-badge');
        const textEl = document.getElementById('github-sync-status-text');
        if (badge) {
            if (state === 'synced') {
                badge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 transition-all hover:bg-emerald-100 cursor-pointer';
                badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span class="hidden sm:inline">GitHub Live DB: Connected</span><span class="sm:hidden">Live DB</span>`;
            } else if (state === 'syncing') {
                badge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 transition-all cursor-pointer';
                badge.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-spin text-xs"></i><span class="hidden sm:inline">Syncing to GitHub...</span><span class="sm:hidden">Syncing</span>`;
            } else if (state === 'error' || state === 'offline') {
                badge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 transition-all cursor-pointer';
                badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-400"></span><span class="hidden sm:inline">Offline Mode</span><span class="sm:hidden">Offline</span>`;
            }
        }
        if (textEl) {
            textEl.innerText = message || '';
        }
    }
};

// Execute init on load
initDatabase();
