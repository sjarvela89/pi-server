const { insertMessage, getMessagesForUser } = require('../data/messageStore'); // Implement accordingly

class MessagesController {
  // Save a new message (encrypted)
  async sendMessage(req, res) {
    const { username, toUser, ciphertext } = req.body;

    if (!username || !toUser || !ciphertext) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const message = {
      FromUserId: username,
      ToUserId: toUser,
      CipherText: ciphertext,
      Timestamp: new Date()
    };

    try {
      await insertMessage(message);
      return res.status(201).json({ message: 'Message sent and stored successfully' });
    } catch (error) {
      console.error('Error saving message:', error);
      return res.status(500).json({ message: 'Failed to store message' });
    }
  }

  // Retrieve messages for a user
  async getMessages(req, res) {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: 'Missing user ID' });
    }

    try {
      const messages = await getMessagesForUser(username);
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error retrieving messages:', error);
      return res.status(500).json({ message: 'Failed to retrieve messages' });
    }
  }
}

module.exports = { MessagesController };