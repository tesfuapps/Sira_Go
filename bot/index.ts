import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

dotenv.config();

// Load Firebase Config
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || '';
const CHANNEL_ID = process.env.VITE_TELEGRAM_CHANNEL_ID || '@sira_go';
const WEB_APP_URL = process.env.APP_URL || 'https://sirago.et';

if (!BOT_TOKEN) {
  console.error('❌ Missing VITE_TELEGRAM_BOT_TOKEN. Please configure it in your .env file.');
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Persistence file for Telegram-submitted pending jobs and subscriber alerts
const STORE_PATH = path.resolve(process.cwd(), 'public', 'bot_store.json');

function loadStore(): { pendingJobs: any[]; alerts: any[] } {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading bot_store.json:', e);
  }
  return { pendingJobs: [], alerts: [] };
}

function saveStore(data: { pendingJobs: any[]; alerts: any[] }) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing bot_store.json:', e);
  }
}

// Ensure store exists on startup
if (!fs.existsSync(STORE_PATH)) {
  saveStore({ pendingJobs: [], alerts: [] });
}

interface Session {
  step?: 'title' | 'company' | 'category' | 'location' | 'salary' | 'deadline' | 'description' | 'applyMethod' | 'confirm';
  jobData?: any;
  browseCategory?: string;
  browsePage?: number;
  cachedJobs?: any[];
}

const sessions = new Map<number, Session>();

const CATEGORIES = [
  'Developers',
  'Creatives',
  'Finance',
  'Marketing & Sales',
  'Management',
  'Operations',
  'Other'
];

async function callTelegram(method: string, payload: any) {
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API error (${method}):`, err);
    return null;
  }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return callTelegram('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text: text || ''
  });
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function fetchApprovedJobs(category?: string) {
  try {
    let q;
    if (category && category !== 'All') {
      q = query(
        collection(db, 'jobs'), 
        where('status', '==', 'Approved'),
        where('category', '==', category)
      );
    } else {
      q = query(collection(db, 'jobs'), where('status', '==', 'Approved'));
    }
    const snap = await getDocs(q);
    const jobs: any[] = [];
    snap.forEach(docSnap => {
      jobs.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    return jobs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (e) {
    console.error('Error fetching jobs:', e);
    return [];
  }
}

export async function notifyAlertSubscribers(newJob: any) {
  const store = loadStore();
  const subscribers = store.alerts.filter(a => 
    !a.category || a.category === 'All' || a.category === newJob.category || 
    (a.keyword && newJob.title?.toLowerCase().includes(a.keyword.toLowerCase()))
  );

  console.log(`📢 Sending Telegram DM alerts to ${subscribers.length} subscribers for job "${newJob.title}"...`);

  for (const sub of subscribers) {
    if (!sub.chatId) continue;

    let applyUrl = `${WEB_APP_URL}/jobs/${newJob.id}`;
    if (newJob.applyMethod?.type === 'telegram') {
      const un = newJob.applyMethod.value.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '').trim();
      const msg = encodeURIComponent(`Hello! I saw your "${newJob.title}" job alert on Sira Go and would like to apply.`);
      applyUrl = `https://t.me/${un}?text=${msg}`;
    }

    const text = `🔔 <b>New Job Matching Your Alert!</b>\n\n` +
      `🔥 <b>${escapeHtml(newJob.title)}</b>\n` +
      `🏢 <b>Company:</b> ${escapeHtml(newJob.company)}\n` +
      `📍 <b>Location:</b> ${escapeHtml(newJob.location)}\n` +
      (newJob.salary ? `💰 <b>Salary:</b> ${escapeHtml(newJob.salary)}\n` : '') +
      `🏷️ <b>Category:</b> ${escapeHtml(newJob.category || 'General')}\n\n` +
      `<i>Act fast and apply directly below:</i>`;

    const reply_markup = {
      inline_keyboard: [
        [{ text: '📩 Apply Now', url: applyUrl }],
        [{ text: '👁️ View on Sira Go', url: `${WEB_APP_URL}/jobs/${newJob.id}` }]
      ]
    };

    await callTelegram('sendMessage', {
      chat_id: sub.chatId,
      text,
      parse_mode: 'HTML',
      reply_markup
    });
  }
}

async function sendMainMenu(chatId: number, firstName: string, messageId?: number) {
  const text = `👋 <b>Selam ${escapeHtml(firstName)}, Welcome to Sira Go!</b>\n\n` +
    `🇪🇹 <b>Ethiopia's premier job marketplace on Telegram & Web.</b>\n\n` +
    `Find verified vacancies, set up direct job alerts, or post openings for your team.`;

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '💼 Browse Latest Jobs', callback_data: 'browse:0' },
        { text: '🔍 Categories', callback_data: 'menu:categories' }
      ],
      [
        { text: '✍️ Post a Job (Employers)', callback_data: 'post:start' },
        { text: '🔔 Job Alerts', callback_data: 'alerts:menu' }
      ],
      [
        { text: '📢 Channel: @sira_go', url: 'https://t.me/sira_go' },
        { text: '🌐 Open Sira Go App', url: WEB_APP_URL }
      ]
    ]
  };

  if (messageId) {
    return callTelegram('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup
    });
  }

  return callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup
  });
}

async function renderJobCard(chatId: number, jobs: any[], page: number, messageId?: number) {
  if (!jobs || jobs.length === 0) {
    const emptyText = `🔍 <b>No active jobs found in this category.</b>\n\nCheck back soon or choose another category!`;
    const emptyMarkup = {
      inline_keyboard: [
        [{ text: '🔍 Choose Another Category', callback_data: 'menu:categories' }],
        [{ text: '🏠 Main Menu', callback_data: 'menu:main' }]
      ]
    };
    if (messageId) {
      return callTelegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: emptyText,
        parse_mode: 'HTML',
        reply_markup: emptyMarkup
      });
    }
    return callTelegram('sendMessage', {
      chat_id: chatId,
      text: emptyText,
      parse_mode: 'HTML',
      reply_markup: emptyMarkup
    });
  }

  const total = jobs.length;
  const safePage = Math.max(0, Math.min(page, total - 1));
  const job = jobs[safePage];

  let applyUrl = `${WEB_APP_URL}/jobs/${job.id}`;
  let applyText = '🌐 Apply on Sira Go';
  if (job.applyMethod?.type === 'telegram') {
    const un = job.applyMethod.value.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '').trim();
    const msg = encodeURIComponent(`Hello! I would like to apply for the "${job.title}" position at ${job.company} posted on Sira Go.`);
    applyUrl = `https://t.me/${un}?text=${msg}`;
    applyText = '📩 Apply via Telegram';
  } else if (job.applyMethod?.type === 'link') {
    applyUrl = job.applyMethod.value;
    applyText = '🌐 Apply on Website';
  }

  let desc = escapeHtml(job.description || '');
  if (desc.length > 400) desc = desc.slice(0, 400) + '...';

  const cardText = `💼 <b>[${safePage + 1} / ${total}] ${escapeHtml(job.title)}</b>\n\n` +
    `🏢 <b>Company:</b> ${escapeHtml(job.company)}\n` +
    `📍 <b>Location:</b> ${escapeHtml(job.location)}\n` +
    (job.category ? `🏷️ <b>Category:</b> ${escapeHtml(job.category)}\n` : '') +
    (job.salary ? `💰 <b>Salary:</b> ${escapeHtml(job.salary)}\n` : '') +
    `📅 <b>Deadline:</b> ${escapeHtml(job.deadline)}\n\n` +
    `📝 <b>Overview:</b>\n${desc}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `✨ <i>Verified listing on Sira Go</i>`;

  const navRow: any[] = [];
  if (safePage > 0) {
    navRow.push({ text: '⬅️ Prev', callback_data: `browse:${safePage - 1}` });
  }
  navRow.push({ text: `Page ${safePage + 1}/${total}`, callback_data: 'noop' });
  if (safePage < total - 1) {
    navRow.push({ text: 'Next ➡️', callback_data: `browse:${safePage + 1}` });
  }

  const reply_markup = {
    inline_keyboard: [
      navRow,
      [
        { text: applyText, url: applyUrl }
      ],
      [
        { text: '🔍 Categories', callback_data: 'menu:categories' },
        { text: '🏠 Main Menu', callback_data: 'menu:main' }
      ]
    ]
  };

  if (messageId) {
    return callTelegram('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: cardText,
      parse_mode: 'HTML',
      reply_markup
    });
  }

  return callTelegram('sendMessage', {
    chat_id: chatId,
    text: cardText,
    parse_mode: 'HTML',
    reply_markup
  });
}

async function sendCategoryMenu(chatId: number, messageId?: number) {
  const text = `📁 <b>Filter Jobs by Category:</b>\n\nSelect a sector to browse current vacancies:`;
  const keyboard: any[][] = [];

  for (let i = 0; i < CATEGORIES.length; i += 2) {
    const row = [{ text: CATEGORIES[i], callback_data: `cat:${CATEGORIES[i]}` }];
    if (CATEGORIES[i + 1]) {
      row.push({ text: CATEGORIES[i + 1], callback_data: `cat:${CATEGORIES[i + 1]}` });
    }
    keyboard.push(row);
  }
  keyboard.push([{ text: '🌟 All Categories', callback_data: 'cat:All' }]);
  keyboard.push([{ text: '🏠 Back to Main Menu', callback_data: 'menu:main' }]);

  const reply_markup = { inline_keyboard: keyboard };

  if (messageId) {
    return callTelegram('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup
    });
  }

  return callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup
  });
}

async function sendAlertsMenu(chatId: number, messageId?: number) {
  const text = `🔔 <b>Personalized Telegram Job Alerts</b>\n\n` +
    `Choose a job category to receive instant notifications in your Telegram chat as soon as an employer posts a matching position:`;

  const keyboard: any[][] = [];
  for (let i = 0; i < CATEGORIES.length; i += 2) {
    const row = [{ text: `🔔 ${CATEGORIES[i]}`, callback_data: `sub:${CATEGORIES[i]}` }];
    if (CATEGORIES[i + 1]) {
      row.push({ text: `🔔 ${CATEGORIES[i + 1]}`, callback_data: `sub:${CATEGORIES[i + 1]}` });
    }
    keyboard.push(row);
  }
  keyboard.push([{ text: '🏠 Back to Main Menu', callback_data: 'menu:main' }]);

  const reply_markup = { inline_keyboard: keyboard };

  if (messageId) {
    return callTelegram('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup
    });
  }

  return callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup
  });
}

async function startJobPostingWizard(chatId: number) {
  sessions.set(chatId, {
    step: 'title',
    jobData: {}
  });

  const text = `✍️ <b>Post a Job on Sira Go</b>\n\n` +
    `Let's set up your vacancy announcement in a few quick steps.\n\n` +
    `<b>Step 1 of 7:</b> What is the <b>Job Title</b>?\n<i>(e.g., Senior Frontend Engineer, Marketing Lead, Accountant)</i>`;

  return callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'post:cancel' }]]
    }
  });
}

async function handlePostingStep(chatId: number, messageText: string) {
  const session = sessions.get(chatId);
  if (!session || !session.step) return;

  const data = session.jobData || {};

  switch (session.step) {
    case 'title':
      data.title = messageText.trim();
      session.step = 'company';
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🏢 <b>Step 2 of 7:</b> What is the <b>Company or Organization Name</b>?`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'post:cancel' }]] }
      });
      break;

    case 'company':
      data.company = messageText.trim();
      session.step = 'category';
      const catRows: any[][] = [];
      for (let i = 0; i < CATEGORIES.length; i += 2) {
        const row = [{ text: CATEGORIES[i], callback_data: `pcat:${CATEGORIES[i]}` }];
        if (CATEGORIES[i + 1]) {
          row.push({ text: CATEGORIES[i + 1], callback_data: `pcat:${CATEGORIES[i + 1]}` });
        }
        catRows.push(row);
      }
      catRows.push([{ text: '❌ Cancel', callback_data: 'post:cancel' }]);

      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🏷️ <b>Step 3 of 7:</b> Please select the job <b>Category</b>:`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: catRows }
      });
      break;

    case 'location':
      data.location = messageText.trim();
      session.step = 'salary';
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `💰 <b>Step 5 of 7:</b> What is the <b>Monthly Salary</b>?\n<i>(e.g. 50,000 ETB, Negotiable, or Competitive)</i>`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'post:cancel' }]] }
      });
      break;

    case 'salary':
      data.salary = messageText.trim();
      session.step = 'deadline';
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `📅 <b>Step 6 of 7:</b> What is the <b>Application Deadline</b>?\n<i>(e.g. in 15 days, or YYYY-MM-DD)</i>`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'post:cancel' }]] }
      });
      break;

    case 'deadline':
      data.deadline = messageText.trim();
      session.step = 'description';
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `📝 <b>Step 7 of 7:</b> Please send the <b>Job Description & Requirements</b>:`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'post:cancel' }]] }
      });
      break;

    case 'description':
      data.description = messageText.trim();
      session.step = 'applyMethod';
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `📩 <b>Final Step:</b> How should candidates apply?\n\n` +
          `• Telegram username: <code>@your_username</code>\n` +
          `• Phone number: <code>+251911223344</code>\n` +
          `• Or Website URL: <code>https://example.et/apply</code>`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'post:cancel' }]] }
      });
      break;

    case 'applyMethod':
      const val = messageText.trim();
      if (val.startsWith('@') || val.includes('t.me/')) {
        data.applyMethod = { type: 'telegram', value: val.replace(/^https?:\/\/t\.me\//, '') };
      } else if (val.startsWith('+') || /^\d+$/.test(val.replace(/[\s-]/g, ''))) {
        data.applyMethod = { type: 'phone', value: val };
      } else {
        data.applyMethod = { type: 'link', value: val.startsWith('http') ? val : `https://${val}` };
      }

      session.step = 'confirm';

      const reviewText = `📋 <b>Review Your Job Posting:</b>\n\n` +
        `💼 <b>Title:</b> ${escapeHtml(data.title)}\n` +
        `🏢 <b>Company:</b> ${escapeHtml(data.company)}\n` +
        `🏷️ <b>Category:</b> ${escapeHtml(data.category)}\n` +
        `📍 <b>Location:</b> ${escapeHtml(data.location)}\n` +
        `💰 <b>Salary:</b> ${escapeHtml(data.salary)}\n` +
        `📅 <b>Deadline:</b> ${escapeHtml(data.deadline)}\n` +
        `📩 <b>Apply Via:</b> ${escapeHtml(data.applyMethod.type)} (${escapeHtml(data.applyMethod.value)})\n\n` +
        `📝 <b>Description:</b>\n${escapeHtml(data.description.slice(0, 300))}...\n\n` +
        `<i>Ready to submit for admin approval?</i>`;

      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: reviewText,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Submit for Approval', callback_data: 'post:confirm' }],
            [{ text: '❌ Cancel', callback_data: 'post:cancel' }]
          ]
        }
      });
      break;
  }
}

async function handleCallbackQuery(cb: any) {
  const chatId = cb.message?.chat?.id;
  const messageId = cb.message?.message_id;
  const data = cb.data;

  if (!chatId || !data) return;

  if (data === 'noop') {
    return answerCallbackQuery(cb.id);
  }

  if (data === 'menu:main') {
    await answerCallbackQuery(cb.id);
    return sendMainMenu(chatId, cb.from?.first_name || 'User', messageId);
  }

  if (data === 'menu:categories') {
    await answerCallbackQuery(cb.id);
    return sendCategoryMenu(chatId, messageId);
  }

  if (data === 'alerts:menu') {
    await answerCallbackQuery(cb.id);
    return sendAlertsMenu(chatId, messageId);
  }

  if (data.startsWith('sub:')) {
    const category = data.split(':')[1];
    await answerCallbackQuery(cb.id, `Alert set for ${category}!`);
    
    // Save to persistent bot_store.json
    const store = loadStore();
    const existingIdx = store.alerts.findIndex(a => a.chatId === chatId && a.category === category);
    if (existingIdx === -1) {
      store.alerts.push({
        id: `alert_${Date.now()}`,
        userId: `tg_${cb.from.id}`,
        chatId: chatId,
        keyword: category,
        category: category,
        notifyVia: 'telegram',
        contact: cb.from.username ? `@${cb.from.username}` : `chat_${chatId}`,
        createdAt: new Date().toISOString()
      });
      saveStore(store);
    }

    // Attempt firestore background write
    addDoc(collection(db, 'alerts'), {
      userId: `tg_${cb.from.id}`,
      keyword: category,
      category: category,
      notifyVia: 'telegram',
      contact: cb.from.username ? `@${cb.from.username}` : `chat_${chatId}`,
      createdAt: serverTimestamp()
    }).catch(() => { /* handled by local store */ });

    const text = `✅ <b>Alert Activated!</b>\n\n` +
      `You are now subscribed to <b>${escapeHtml(category)}</b> vacancies.\n` +
      `We will notify you directly here in Telegram as soon as new jobs are approved!`;

    return callTelegram('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔔 Subscribe Another Category', callback_data: 'alerts:menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'menu:main' }]
        ]
      }
    });
  }

  if (data.startsWith('browse:')) {
    const page = parseInt(data.split(':')[1], 10) || 0;
    await answerCallbackQuery(cb.id);
    const session = sessions.get(chatId) || {};
    if (!session.cachedJobs) {
      session.cachedJobs = await fetchApprovedJobs(session.browseCategory);
      sessions.set(chatId, session);
    }
    return renderJobCard(chatId, session.cachedJobs, page, messageId);
  }

  if (data.startsWith('cat:')) {
    const cat = data.split(':')[1];
    await answerCallbackQuery(cb.id, `Filtering: ${cat}`);
    const jobs = await fetchApprovedJobs(cat);
    const session = sessions.get(chatId) || {};
    session.browseCategory = cat;
    session.cachedJobs = jobs;
    sessions.set(chatId, session);
    return renderJobCard(chatId, jobs, 0, messageId);
  }

  if (data === 'post:start') {
    await answerCallbackQuery(cb.id);
    return startJobPostingWizard(chatId);
  }

  if (data === 'post:cancel') {
    sessions.delete(chatId);
    await answerCallbackQuery(cb.id, 'Job posting cancelled');
    return callTelegram('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: `❌ <i>Job posting draft cancelled.</i>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '🏠 Back to Menu', callback_data: 'menu:main' }]]
      }
    });
  }

  if (data.startsWith('pcat:')) {
    const cat = data.split(':')[1];
    await answerCallbackQuery(cb.id, `Selected ${cat}`);
    const session = sessions.get(chatId);
    if (session && session.jobData) {
      session.jobData.category = cat;
      session.step = 'location';
      return callTelegram('sendMessage', {
        chat_id: chatId,
        text: `📍 <b>Step 4 of 7:</b> Where is the job <b>Location</b>?\n<i>(e.g., Addis Ababa, Remote, Hawassa, Bole)</i>`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'post:cancel' }]] }
      });
    }
  }

  if (data === 'post:confirm') {
    const session = sessions.get(chatId);
    if (!session || !session.jobData) return;
    await answerCallbackQuery(cb.id, 'Submitting job...');

    const job = session.jobData;
    sessions.delete(chatId);

    // Save to persistent bot_store.json
    const store = loadStore();
    const newJob = {
      id: `tg_job_${Date.now()}`,
      ...job,
      status: 'Pending',
      employerId: `tg_${cb.from.id}`,
      submittedVia: 'telegram_bot',
      submitterName: cb.from.first_name || 'Employer',
      submitterHandle: cb.from.username ? `@${cb.from.username}` : undefined,
      createdAt: new Date().toISOString()
    };
    store.pendingJobs.push(newJob);
    saveStore(store);

    // Attempt firestore background write
    addDoc(collection(db, 'jobs'), {
      ...job,
      status: 'Pending',
      employerId: `tg_${cb.from.id}`,
      createdAt: serverTimestamp()
    }).catch(() => { /* handled in local store */ });

    const successText = `🎉 <b>Job Submitted Successfully!</b>\n\n` +
      `Your posting for <b>${escapeHtml(job.title)}</b> at <b>${escapeHtml(job.company)}</b> has been received.\n\n` +
      `🛡️ <b>What happens next?</b>\n` +
      `1. Sira Go admins will review and verify your listing in the Admin Panel.\n` +
      `2. Once approved, it will automatically broadcast to our channel <b>${CHANNEL_ID}</b> and alert subscribed candidates!`;

    return callTelegram('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: successText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💼 View Active Jobs', callback_data: 'browse:0' }],
          [{ text: '🏠 Main Menu', callback_data: 'menu:main' }]
        ]
      }
    });
  }
}

async function handleMessage(msg: any) {
  const chatId = msg.chat?.id;
  const text = msg.text?.trim();
  const firstName = msg.from?.first_name || 'User';

  if (!chatId || !text) return;

  // Global commands
  if (text.startsWith('/start')) {
    sessions.delete(chatId);
    return sendMainMenu(chatId, firstName);
  }

  if (text.startsWith('/talent')) {
    return callTelegram('sendMessage', {
      chat_id: chatId,
      text: `🌐 <b>Explore Talent Directory</b>\n\nFind skilled Ethiopian professionals. Visit the Talent Directory on Sira Go:`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '🌐 View Talent Directory', url: `${WEB_APP_URL}/talent` }]]
      }
    });
  }

  if (text.startsWith('/jobs')) {
    const jobs = await fetchApprovedJobs();
    const session = sessions.get(chatId) || {};
    session.cachedJobs = jobs;
    sessions.set(chatId, session);
    return renderJobCard(chatId, jobs, 0);
  }

  if (text.startsWith('/post')) {
    return startJobPostingWizard(chatId);
  }

  if (text.startsWith('/alerts')) {
    return sendAlertsMenu(chatId);
  }

  if (text.startsWith('/search')) {
    const term = text.replace('/search', '').trim().toLowerCase();
    if (!term) {
      return callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🔍 <b>How to search:</b>\nType <code>/search &lt;keyword&gt;</code>\nExample: <code>/search developer</code> or <code>/search remote</code>`,
        parse_mode: 'HTML'
      });
    }
    const allJobs = await fetchApprovedJobs();
    const filtered = allJobs.filter(j => 
      j.title?.toLowerCase().includes(term) ||
      j.description?.toLowerCase().includes(term) ||
      j.company?.toLowerCase().includes(term) ||
      j.category?.toLowerCase().includes(term) ||
      j.location?.toLowerCase().includes(term)
    );
    const session = sessions.get(chatId) || {};
    session.cachedJobs = filtered;
    sessions.set(chatId, session);
    return renderJobCard(chatId, filtered, 0);
  }

  if (text.startsWith('/help')) {
    const helpText = `ℹ️ <b>Sira Go Bot Commands:</b>\n\n` +
      `• /start - Launch Sira Go main menu\n` +
      `• /jobs - Browse active vacancies\n` +
      `• /talent - Browse talent directory\n` +
      `• /search &lt;keyword&gt; - Search jobs\n` +
      `• /post - Post a vacancy (For Employers)\n` +
      `• /alerts - Subscribe to category notifications\n\n` +
      `📢 <i>Official Channel: @sira_go</i>`;
    return callTelegram('sendMessage', {
      chat_id: chatId,
      text: helpText,
      parse_mode: 'HTML'
    });
  }

  // If user is currently in a posting wizard
  const session = sessions.get(chatId);
  if (session && session.step) {
    return handlePostingStep(chatId, text);
  }

  // Fallback: Show Main Menu
  return sendMainMenu(chatId, firstName);
}

// Polling loop
let offset = 0;
let isRunning = true;

async function pollUpdates() {
  console.log(`🤖 Sira Go Interactive Telegram Bot started!`);
  console.log(`📡 Connected as @sirago_jobs_bot | Channel: ${CHANNEL_ID}`);

  while (isRunning) {
    try {
      const res = await fetch(`${API_BASE}/getUpdates?offset=${offset}&timeout=25`);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          if (update.message) {
            await handleMessage(update.message);
          } else if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
          }
        }
      }
    } catch (err: any) {
      console.error('Polling error (will retry):', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

pollUpdates();
