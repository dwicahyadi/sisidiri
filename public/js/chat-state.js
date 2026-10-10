export const CHAT_LIMIT = 25;
export const MESSAGE_LIMIT = 500;
export const messageLength = (message) => Array.from(message.trim()).length;
export const canSendChat = ({ count, pending, expired, available, message }) =>
  available && !pending && !expired && count < CHAT_LIMIT && messageLength(message) > 0 && messageLength(message) <= MESSAGE_LIMIT;
