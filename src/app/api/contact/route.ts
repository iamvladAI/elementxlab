import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, email, phone, method, telegramUsername, request } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Telegram configuration is missing. Please add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to .env' }, 
        { status: 500 }
      );
    }

    const tgLink = method === 'Telegram' && telegramUsername ? `\n<b>Нік в Telegram:</b> @${telegramUsername}` : '';

    const dateStr = `${String(new Date().getDate()).padStart(2, '0')}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${new Date().getFullYear()}`;

    const message = `
✅ <b>Нова заявка ${dateStr}</b>

<b>Ім'я:</b> ${name}
<b>Компанія:</b> ${company || 'Не вказано'}
<b>Email:</b> ${email}
<b>Телефон:</b> ${phone}
<b>Зручний зв'язок:</b> ${method}${tgLink}

<b>Запит:</b>
${request || 'Не вказано'}
    `;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error data:', errorData);
      throw new Error('Failed to send message to Telegram');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram API error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
