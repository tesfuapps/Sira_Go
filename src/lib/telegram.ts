import { Job } from '../types';

export interface TelegramConfig {
  botToken: string;
  channelId: string;
  autoBroadcastOnApproval: boolean;
  botUsername?: string;
  simulationMode?: boolean;
}

const STORAGE_KEY = 'sira_go_telegram_config';

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN || '',
  channelId: (import.meta as any).env?.VITE_TELEGRAM_CHANNEL_ID || '@sira_go',
  autoBroadcastOnApproval: true,
  botUsername: (import.meta as any).env?.VITE_TELEGRAM_BOT_USERNAME || 'sirago_jobs_bot',
  simulationMode: false
};

/**
 * Normalizes user input such as "t.me/sira_go", "https://t.me/sira_go", or "sira_go" into "@sira_go"
 */
export function normalizeTelegramChannel(input: string): string {
  if (!input) return '@sira_go';
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^https?:\/\/t\.me\//, '').replace(/^t\.me\//, '');
  if (!cleaned.startsWith('@') && !cleaned.startsWith('-100')) {
    cleaned = `@${cleaned}`;
  }
  return cleaned;
}

/**
 * Retrieve saved Telegram settings from localStorage with environment variable fallbacks.
 */
export function getTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_TELEGRAM_CONFIG,
        ...parsed,
        channelId: normalizeTelegramChannel(parsed.channelId || '@sira_go')
      };
    }
  } catch (e) {
    console.error('Failed to parse telegram config:', e);
  }
  return { ...DEFAULT_TELEGRAM_CONFIG };
}

/**
 * Persist Telegram configuration to localStorage.
 */
export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    const normalized = {
      ...config,
      channelId: normalizeTelegramChannel(config.channelId)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (e) {
    console.error('Failed to save telegram config:', e);
  }
}

/**
 * Escape HTML special characters for Telegram HTML parse_mode
 */
export function escapeTelegramHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Generate a pre-filled 1-click apply URL for Telegram chat with HR
 */
export function generateTelegramApplyUrl(job: Job): string {
  if (job.applyMethod.type === 'telegram') {
    const username = job.applyMethod.value.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '').trim();
    const introText = `Hello! I am applying for the "${job.title}" position at ${job.company} that I found on Sira Go.`;
    return `https://t.me/${username}?text=${encodeURIComponent(introText)}`;
  }
  if (job.applyMethod.type === 'phone') {
    return `tel:${job.applyMethod.value}`;
  }
  return job.applyMethod.value;
}

/**
 * Format a Job posting into standard Ethiopian job channel HTML and Telegram Inline Keyboard
 */
export function formatTelegramJobPost(job: Job, baseUrl?: string): { text: string; replyMarkup: any } {
  let origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://sirago.et');
  // Telegram Bot API rejects localhost / 127.0.0.1 URLs with BUTTON_URL_INVALID
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    origin = 'https://sirago.et';
  }
  const jobUrl = `${origin}/jobs/${job.id}`;
  
  const cleanTitle = escapeTelegramHtml(job.title);
  const cleanCompany = escapeTelegramHtml(job.company);
  const cleanLocation = escapeTelegramHtml(job.location);
  const cleanSalary = job.salary ? escapeTelegramHtml(job.salary) : null;
  const cleanCategory = job.category ? escapeTelegramHtml(job.category) : null;

  // Format deadline date
  let deadlineStr = job.deadline;
  try {
    const d = new Date(job.deadline);
    if (!isNaN(d.getTime())) {
      deadlineStr = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch (e) {
    // keep raw
  }

  // Truncate description for Telegram message length limits
  let cleanDesc = escapeTelegramHtml(job.description);
  if (cleanDesc.length > 550) {
    cleanDesc = cleanDesc.slice(0, 550) + '...';
  }

  let text = `💼 <b>NEW JOB VACANCY | SIRA GO</b>\n\n`;
  text += `🔥 <b>${cleanTitle}</b>\n`;
  text += `🏢 <b>Company:</b> ${cleanCompany}\n`;
  text += `📍 <b>Location:</b> ${cleanLocation}\n`;
  if (cleanCategory) {
    text += `🏷️ <b>Category:</b> ${cleanCategory}\n`;
  }
  if (cleanSalary) {
    text += `💰 <b>Salary:</b> ${cleanSalary}\n`;
  }
  text += `📅 <b>Deadline:</b> ${deadlineStr}\n\n`;
  text += `📝 <b>Job Overview:</b>\n${cleanDesc}\n\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `✨ <i>Verified listing via Sira Go Job Board</i>`;

  // Inline buttons
  const buttons: any[] = [];
  
  // Row 1: Apply Button
  if (job.applyMethod.type === 'telegram') {
    buttons.push([{
      text: '📩 Apply via Telegram',
      url: generateTelegramApplyUrl(job)
    }]);
  } else if (job.applyMethod.type === 'link') {
    buttons.push([{
      text: '🌐 Apply on Website',
      url: job.applyMethod.value
    }]);
  } else {
    buttons.push([{
      text: '📞 Contact to Apply',
      url: jobUrl
    }]);
  }

  // Row 2: View on Web + Share
  const shareText = `Check out this job opening on Sira Go: ${job.title} at ${job.company}`;
  const shareTelegramUrl = `https://t.me/share/url?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(shareText)}`;

  buttons.push([
    {
      text: '👁️ View on Sira Go',
      url: jobUrl
    },
    {
      text: '📢 Share with Friends',
      url: shareTelegramUrl
    }
  ]);

  return {
    text,
    replyMarkup: {
      inline_keyboard: buttons
    }
  };
}

export interface BroadcastResult {
  success: boolean;
  message: string;
  simulated?: boolean;
  messageId?: number;
  publishedUrl?: string;
}

/**
 * Test the Telegram Bot token and post permissions to the designated channel
 */
export async function testTelegramConnection(botToken: string, channelId: string): Promise<BroadcastResult> {
  const token = botToken.trim();
  const channel = channelId.trim();

  if (!token) {
    return {
      success: false,
      message: 'Bot token cannot be empty.'
    };
  }

  if (!channel) {
    return {
      success: false,
      message: 'Channel username/ID cannot be empty.'
    };
  }

  try {
    // 1. Verify bot credentials
    const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const getMeData = await getMeRes.json();

    if (!getMeData.ok) {
      return {
        success: false,
        message: `Invalid Bot Token: ${getMeData.description || 'Unknown error'}`
      };
    }

    const botName = getMeData.result.username;

    // 2. Send a test broadcast message to the channel
    const testText = `🤖 <b>Sira Go Bot Test Message</b>\n\n✅ Bot <b>@${botName}</b> is successfully connected and authorized to broadcast jobs to <b>${channel}</b>!\n\n<i>Time: ${new Date().toLocaleTimeString()}</i>`;
    
    const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channel,
        text: testText,
        parse_mode: 'HTML'
      })
    });

    const sendData = await sendRes.json();
    if (!sendData.ok) {
      let advice = '';
      if (sendData.description?.includes('chat not found')) {
        advice = ' Make sure the channel username is correct and public, or that the bot has been added as an administrator.';
      } else if (sendData.description?.includes('need administrator rights') || sendData.description?.includes('not enough rights')) {
        advice = ' Please promote your bot to Administrator in the channel with "Post Messages" permission.';
      }
      return {
        success: false,
        message: `Broadcast failed: ${sendData.description}.${advice}`
      };
    }

    return {
      success: true,
      message: `Success! Test message delivered to ${channel} from @${botName}.`,
      messageId: sendData.result?.message_id
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection error: ${err.message || 'Network request failed'}`
    };
  }
}

/**
 * Broadcast an approved Job posting to the Telegram Channel
 */
export async function broadcastJobToTelegram(
  job: Job,
  configOverride?: Partial<TelegramConfig>
): Promise<BroadcastResult> {
  const config = {
    ...getTelegramConfig(),
    ...(configOverride || {})
  };

  const { text, replyMarkup } = formatTelegramJobPost(job);

  // If no bot token provided or simulation mode explicitly enabled, simulate cleanly
  if (!config.botToken || config.simulationMode) {
    const targetChannel = normalizeTelegramChannel(config.channelId || '@sira_go');
    console.log('[Sira Go Telegram Broadcast Simulation]:', {
      channel: targetChannel,
      text,
      replyMarkup
    });

    return {
      success: true,
      simulated: true,
      message: `Job simulated as broadcasted to ${targetChannel}! (Simulation mode enabled. Add Bot Token in Settings for live post).`,
      messageId: Math.floor(10000 + Math.random() * 90000),
      publishedUrl: targetChannel.startsWith('@') 
        ? `https://t.me/${targetChannel.replace('@', '')}` 
        : undefined
    };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${config.botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: config.channelId.trim(),
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    });

    const data = await res.json();

    if (!data.ok) {
      return {
        success: false,
        message: `Telegram Error: ${data.description || 'Failed to post message'}`
      };
    }

    const messageId = data.result?.message_id;
    const cleanChan = config.channelId.replace('@', '');
    const publishedUrl = config.channelId.startsWith('@') 
      ? `https://t.me/${cleanChan}/${messageId}` 
      : undefined;

    return {
      success: true,
      message: `Job successfully broadcasted to ${config.channelId}!`,
      messageId,
      publishedUrl
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network error broadcasting to Telegram: ${err.message || 'Check bot token & internet'}`
    };
  }
}

/**
 * Synchronize Bot Commands and Web App Menu Button with Telegram Bot API
 */
export async function syncTelegramBotCommands(botToken: string, webAppUrl?: string): Promise<{ success: boolean; message: string }> {
  const token = botToken.trim();
  if (!token) return { success: false, message: 'Bot token cannot be empty.' };

  try {
    const commands = [
      { command: 'start', description: '🚀 Open Sira Go main menu' },
      { command: 'jobs', description: '💼 Browse latest job vacancies' },
      { command: 'search', description: '🔍 Search jobs by keyword or category' },
      { command: 'post', description: '✍️ Post a job opening (For Employers)' },
      { command: 'alerts', description: '🔔 Setup personalized job alerts' },
      { command: 'help', description: 'ℹ️ How to use Sira Go bot' }
    ];

    const cmdRes = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    });
    const cmdData = await cmdRes.json();

    const targetUrl = webAppUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://sirago.et');
    const safeUrl = (targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1')) ? 'https://sirago.et' : targetUrl;

    const menuRes = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: '🌐 Open Sira Go',
          web_app: { url: safeUrl }
        }
      })
    });
    const menuData = await menuRes.json();

    if (!cmdData.ok || !menuData.ok) {
      return {
        success: false,
        message: `Sync partially failed: ${cmdData.description || menuData.description}`
      };
    }

    return {
      success: true,
      message: 'Commands & Mini App Menu Button successfully registered with Telegram!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to sync bot: ${err.message}`
    };
  }
}

/**
 * Notify all Telegram users who subscribed to alerts matching this job's category or keywords
 */
export async function sendTelegramAlertNotifications(job: Job): Promise<number> {
  try {
    const res = await fetch('/bot_store.json');
    if (!res.ok) return 0;
    const store = await res.json();
    const config = getTelegramConfig();
    const token = config.botToken;
    if (!token) return 0;

    const subscribers = (store.alerts || []).filter((a: any) => 
      !a.category || a.category === 'All' || a.category === job.category ||
      (a.keyword && job.title?.toLowerCase().includes(a.keyword.toLowerCase()))
    );

    let sent = 0;
    for (const sub of subscribers) {
      if (!sub.chatId) continue;
      let applyUrl = `${window.location.origin}/jobs/${job.id}`;
      if (job.applyMethod.type === 'telegram') {
        const username = job.applyMethod.value.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '').trim();
        const introText = `Hello! I saw your "${job.title}" job alert on Sira Go and would like to apply.`;
        applyUrl = `https://t.me/${username}?text=${encodeURIComponent(introText)}`;
      }

      const text = `🔔 <b>New Job Matching Your Alert!</b>\n\n` +
        `🔥 <b>${escapeTelegramHtml(job.title)}</b>\n` +
        `🏢 <b>Company:</b> ${escapeTelegramHtml(job.company)}\n` +
        `📍 <b>Location:</b> ${escapeTelegramHtml(job.location)}\n` +
        (job.salary ? `💰 <b>Salary:</b> ${escapeTelegramHtml(job.salary)}\n` : '') +
        `🏷️ <b>Category:</b> ${escapeTelegramHtml(job.category || 'General')}\n\n` +
        `<i>Apply directly below or via Sira Go:</i>`;

      const reply_markup = {
        inline_keyboard: [
          [{ text: '📩 Apply Now', url: applyUrl }],
          [{ text: '👁️ View on Sira Go', url: `${window.location.origin}/jobs/${job.id}` }]
        ]
      };

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: sub.chatId,
          text,
          parse_mode: 'HTML',
          reply_markup
        })
      });
      sent++;
    }
    return sent;
  } catch (e) {
    console.error('Error notifying alert subscribers:', e);
    return 0;
  }
}
