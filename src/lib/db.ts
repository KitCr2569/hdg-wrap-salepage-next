// Minimal completely mocked in-memory database
export type User = {
  id: string; // Internal User ID (we map NextAuth user exactly to this ID)
  facebookId?: string; // App A facebook ID
  name?: string;
  email?: string;
  psid?: string; // Messenger App B Page Scoped ID
};

let users: User[] = [
  // Example data
  // { id: 'user_1', name: 'John Doe', email: 'john@example.com' }
];

export const db = {
  // Find a user by email
  getUserByEmail(email: string) {
    return users.find((u) => u.email === email);
  },

  // Save or update a user (upsert)
  upsertUser(user: Partial<User> & { email: string }) {
    const existingIndex = users.findIndex((u) => u.email === user.email);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
      return users[existingIndex];
    } else {
      const newUser: User = {
        id: crypto.randomUUID(),
        ...user,
      };
      users.push(newUser);
      return newUser;
    }
  },

  // Link PSID to a user based on internal ID (the refer param)
  linkPsid(internalUserId: string, psid: string) {
    const userIndex = users.findIndex((u) => u.id === internalUserId);
    if (userIndex >= 0) {
      users[userIndex].psid = psid;
      return true;
    }
    return false;
  },

  // Get a user by their internal ID 
  getUserById(id: string) {
    return users.find((u) => u.id === id);
  },

  getAll() {
    return users;
  }
};
