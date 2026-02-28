// Auth Controller - Mock authentication logic
class AuthController {
  // Mock user database
  static users = [
    {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      role: 'buyer',
      createdAt: new Date().toISOString()
    }
  ];

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Mock authentication logic
      const user = this.users.find(u => u.email === email) || {
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        role: 'buyer'
      };

      const token = 'mock-jwt-token-' + Date.now();

      res.json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      // Check if user already exists
      const existingUser = this.users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Create new user
      const newUser = {
        id: 'user-' + Date.now(),
        name: name,
        email: email,
        password: 'hashedpassword', // In real app, this would be hashed
        role: role || 'buyer',
        createdAt: new Date().toISOString()
      };

      this.users.push(newUser);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getProfile(req, res) {
    try {
      // Mock profile data
      const profile = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'buyer',
        profilePicture: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=JD',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      res.json({
        success: true,
        user: profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AuthController;
