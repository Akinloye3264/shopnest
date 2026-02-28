// User Model - Mock user data structure
class User {
  constructor(data = {}) {
    this.id = data.id || 'user-' + Date.now();
    this.name = data.name || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.role = data.role || 'buyer';
    this.profilePicture = data.profilePicture || null;
    this.emailVerified = data.emailVerified || false;
    this.phoneVerified = data.phoneVerified || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Mock static methods
  static async findById(id) {
    // Mock database query
    return new User({
      id: id,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'buyer',
      emailVerified: true,
      createdAt: new Date().toISOString()
    });
  }

  static async findByEmail(email) {
    // Mock database query
    return new User({
      id: 'user-123',
      name: 'John Doe',
      email: email,
      role: 'buyer',
      emailVerified: true,
      createdAt: new Date().toISOString()
    });
  }

  static async create(userData) {
    // Mock database creation
    return new User({
      ...userData,
      id: 'user-' + Date.now(),
      createdAt: new Date().toISOString()
    });
  }

  static async update(id, userData) {
    // Mock database update
    return new User({
      id: id,
      ...userData,
      updatedAt: new Date().toISOString()
    });
  }

  static async delete(id) {
    // Mock database deletion
    return { deleted: true };
  }

  // Instance methods
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      profilePicture: this.profilePicture,
      emailVerified: this.emailVerified,
      phoneVerified: this.phoneVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
