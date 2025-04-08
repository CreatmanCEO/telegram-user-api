/**
 * Модуль для аутентификации в Telegram через MTProto прокси
 * Использует HTTP API для доступа к Telegram как пользователь
 * 
 * Для использования в n8n workflow
 */

// Функция инициализации сессии Telegram
function loginToTelegramUserAccount(phoneNumber) {
  const options = {
    method: 'POST',
    url: 'https://tg-api.itpovar.ru/api/login',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from('admin:password').toString('base64')
    },
    body: {
      phone: phoneNumber, // Номер телефона должен передаваться в формате +7XXXXXXXXXX
    },
    json: true
  };
  
  return $http.call(options);
}

// Функция для подтверждения кода
function confirmTelegramCode(phoneNumber, code) {
  const options = {
    method: 'POST',
    url: 'https://tg-api.itpovar.ru/api/login/code',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from('admin:password').toString('base64')
    },
    body: {
      phone: phoneNumber,
      code: code.toString(),
    },
    json: true
  };
  
  return $http.call(options);
}

// Функция для отправки сообщения
function sendTelegramMessage(recipientUsername, message) {
  const options = {
    method: 'POST',
    url: 'https://tg-api.itpovar.ru/api/send_message',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from('admin:password').toString('base64')
    },
    body: {
      peer: recipientUsername, // Имя пользователя без @
      message: message
    },
    json: true
  };
  
  return $http.call(options);
}

// Экспортируем функции
module.exports = {
  loginToTelegramUserAccount,
  confirmTelegramCode,
  sendTelegramMessage
};
